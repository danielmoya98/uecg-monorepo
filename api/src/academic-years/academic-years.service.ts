import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from "@nestjs/common";

import { CACHE_MANAGER } from "@nestjs/cache-manager";

import type { Cache } from "cache-manager";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { PrismaService } from "../prisma/prisma.service";

import { CreateAcademicYearDto } from "./dto/create-academic-year.dto";

import { UpdateAcademicYearDto } from "./dto/update-academic-year.dto";

import { TrimestersService } from "../trimesters/trimesters.service";

import { PaginationDto } from "../common/dto/pagination.dto";

import { AcademicStatus } from "../../prisma/generated/client";

@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  private readonly CURRENT_ACTIVE_CACHE_KEY = "academic-year:current-active";

  constructor(
    private readonly prisma: PrismaService,

    private readonly trimestersService: TrimestersService,

    private readonly eventEmitter: EventEmitter2,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ======================================================
  // INTERNAL RULES
  // ======================================================

  private async deactivateOtherActiveYears(tx: any, excludeId?: string) {
    await tx.academicYear.updateMany({
      where: {
        status: AcademicStatus.ACTIVE,

        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },

      data: {
        status: AcademicStatus.CLOSED,
      },
    });
  }

  // ======================================================
  // CACHE INVALIDATION
  // ======================================================

  private async invalidateCurrentAcademicYearCache() {
    await this.cacheManager.del(this.CURRENT_ACTIVE_CACHE_KEY);

    this.logger.log("🧹 Cache invalidado: Current Academic Year");
  }

  // ======================================================
  // CREATE
  // ======================================================

  async create(data: CreateAcademicYearDto) {
    const existingYear = await this.prisma.academicYear.findUnique({
      where: {
        year: data.year,
      },
    });

    if (existingYear) {
      throw new ConflictException(
        `La gestión ${data.year} ya está registrada.`,
      );
    }

    if (data.startDate >= data.endDate) {
      throw new BadRequestException(
        "La fecha de inicio debe ser menor a la fecha de fin.",
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // ======================================================
      // ONLY ONE ACTIVE YEAR
      // ======================================================

      if (data.status === AcademicStatus.ACTIVE) {
        await this.deactivateOtherActiveYears(tx);
      }

      // ======================================================
      // CREATE YEAR
      // ======================================================

      const newYear = await tx.academicYear.create({
        data,
      });

      // ======================================================
      // DEFAULT TRIMESTERS
      // ======================================================

      await this.trimestersService.createDefaultTrimesters(
        newYear.id,
        data.startDate,
        data.endDate,
        tx,
      );

      return newYear;
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit("academic-year.created", {
      academicYearId: result.id,

      year: result.year,
    });

    this.logger.log(`📚 Gestión académica creada: ${result.year}`);

    return result;
  }

  // ======================================================
  // FIND ALL
  // ======================================================

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search, sort } = query;

    const skip = (page - 1) * limit;

    const whereCondition: any = search
      ? {
          name: {
            contains: search,

            mode: "insensitive",
          },
        }
      : {};

    let orderBy = {};

    if (sort) {
      const isDesc = sort.startsWith("-");

      const field = isDesc ? sort.substring(1) : sort;

      orderBy = {
        [field]: isDesc ? "desc" : "asc",
      };
    } else {
      orderBy = {
        year: "desc",
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.academicYear.count({
        where: whereCondition,
      }),

      this.prisma.academicYear.findMany({
        where: whereCondition,

        skip,

        take: limit,

        orderBy,

        include: {
          _count: {
            select: {
              classrooms: true,
            },
          },
        },
      }),
    ]);

    return {
      data,

      meta: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======================================================
  // FIND ONE
  // ======================================================

  async findOne(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },

      include: {
        trimesters: {
          orderBy: {
            name: "asc",
          },
        },

        _count: {
          select: {
            classrooms: true,
          },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException("Gestión académica no encontrada");
    }

    return academicYear;
  }

  // ======================================================
  // CURRENT ACTIVE
  // ======================================================

  async findCurrentActive() {
    // ======================================================
    // CACHE HIT
    // ======================================================

    const cached = await this.cacheManager.get(this.CURRENT_ACTIVE_CACHE_KEY);

    if (cached) {
      this.logger.log("⚡ Current Academic Year desde cache");

      return cached;
    }

    // ======================================================
    // DB QUERY
    // ======================================================

    const current = await this.prisma.academicYear.findFirst({
      where: {
        status: AcademicStatus.ACTIVE,
      },

      include: {
        trimesters: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    // ======================================================
    // CACHE STORE
    // ======================================================

    if (current) {
      await this.cacheManager.set(
        this.CURRENT_ACTIVE_CACHE_KEY,
        current,
        60 * 5,
      );
    }

    return current;
  }

  // ======================================================
  // UPDATE
  // ======================================================

  async update(id: string, data: UpdateAcademicYearDto) {
    const updatedYear = await this.prisma.$transaction(async (tx) => {
      const currentYear = await tx.academicYear.findUnique({
        where: { id },
        include: {
          trimesters: true,
        },
      });

      if (!currentYear) {
        throw new NotFoundException("Gestión académica no encontrada");
      }

      // Validación robusta de fechas (incluso si solo se pasa startDate o endDate)
      const effectiveStart = data.startDate
        ? new Date(data.startDate)
        : currentYear.startDate;
      const effectiveEnd = data.endDate
        ? new Date(data.endDate)
        : currentYear.endDate;

      if (effectiveStart >= effectiveEnd) {
        throw new BadRequestException(
          "La fecha de inicio debe ser menor a la fecha de fin.",
        );
      }

      // Validación de fronteras con los trimestres existentes
      if (currentYear.trimesters && currentYear.trimesters.length > 0) {
        for (const trim of currentYear.trimesters) {
          if (trim.startDate < effectiveStart || trim.endDate > effectiveEnd) {
            throw new BadRequestException(
              `No se puede actualizar el rango: el trimestre ${trim.name} quedaría fuera de los límites de la gestión.`,
            );
          }
        }
      }

      if (data.year) {
        const existingYear = await tx.academicYear.findUnique({
          where: {
            year: data.year,
          },
        });

        if (existingYear && existingYear.id !== id) {
          throw new ConflictException(`La gestión ${data.year} ya existe.`);
        }
      }

      // ======================================================
      // ONLY ONE ACTIVE YEAR
      // ======================================================

      if (
        data.status === AcademicStatus.ACTIVE &&
        currentYear.status !== AcademicStatus.ACTIVE
      ) {
        await this.deactivateOtherActiveYears(tx, id);
      }

      return tx.academicYear.update({
        where: { id },

        data,
      });
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit("academic-year.updated", {
      academicYearId: updatedYear.id,

      year: updatedYear.year,
    });

    this.logger.log(`✏️ Gestión académica actualizada: ${updatedYear.year}`);

    return updatedYear;
  }

  // ======================================================
  // REMOVE
  // ======================================================

  async remove(id: string) {
    const year = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      const classroomsCount = await tx.classroom.count({
        where: {
          academicYearId: id,
        },
      });

      if (classroomsCount > 0) {
        throw new ConflictException(
          "No se puede eliminar la gestión porque tiene cursos y paralelos asignados. Cámbiela a estado CLOSED.",
        );
      }

      const enrollmentsCount = await tx.enrollment.count({
        where: {
          academicYearId: id,
        },
      });

      if (enrollmentsCount > 0) {
        throw new ConflictException(
          "No se puede eliminar la gestión porque tiene inscripciones registradas. Cámbiela a estado CLOSED.",
        );
      }

      await tx.trimester.deleteMany({
        where: {
          academicYearId: id,
        },
      });

      await tx.academicYear.delete({
        where: { id },
      });
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit("academic-year.deleted", {
      academicYearId: id,

      year: year.year,
    });

    this.logger.log(`🗑️ Gestión académica eliminada: ${year.year}`);

    return {
      message: `Gestión ${year.year} eliminada correctamente.`,
    };
  }

  // ======================================================
  // READINESS DIAGNOSTIC (SETUP WIZARD)
  // ======================================================

  async getReadiness(academicYearId?: string) {
    let targetYear: any = null;

    if (academicYearId) {
      targetYear = await this.prisma.academicYear.findUnique({
        where: { id: academicYearId },
        include: {
          trimesters: {
            orderBy: { name: "asc" },
          },
        },
      });
    } else {
      targetYear = await this.prisma.academicYear.findFirst({
        where: { status: AcademicStatus.ACTIVE },
        include: {
          trimesters: {
            orderBy: { name: "asc" },
          },
        },
      });
    }

    // Si no hay ninguna gestión creada o activa
    if (!targetYear) {
      return {
        academicYear: null,
        percentage: 0,
        completedSteps: 0,
        totalSteps: 7,
        steps: [
          {
            id: "academic_year",
            stepNumber: 1,
            title: "Ciclo Lectivo y Trimestres",
            description:
              "Crear y activar la gestión escolar del año en curso con sus 3 trimestres.",
            status: "PENDING",
            progressLabel: "Sin gestión activa creada",
            actionUrl: "/academic-years",
            actionLabel: "Crear Gestión",
          },
          {
            id: "catalog_spaces",
            stepNumber: 2,
            title: "Materias y Espacios Físicos",
            description:
              "Registrar el catálogo de asignaturas y las aulas/laboratorios físicos.",
            status: "PENDING",
            progressLabel: "Pendiente de configuración",
            actionUrl: "/subjects",
            actionLabel: "Configurar Materias",
          },
          {
            id: "classrooms",
            stepNumber: 3,
            title: "Cursos y Paralelos",
            description:
              "Crear las aulas de Inicial, Primaria y Secundaria para el año.",
            status: "PENDING",
            progressLabel: "0 aulas creadas",
            actionUrl: "/classrooms",
            actionLabel: "Crear Cursos",
          },
          {
            id: "teacher_assignments",
            stepNumber: 4,
            title: "Carga Horaria Docente",
            description:
              "Asignar a los profesores responsables de cada materia por aula.",
            status: "PENDING",
            progressLabel: "0 asignaciones realizadas",
            actionUrl: "/teacher-assignments",
            actionLabel: "Asignar Docentes",
          },
          {
            id: "timetables",
            stepNumber: 5,
            title: "Horarios Semanales",
            description:
              "Distribuir los periodos de clase en la grilla semanal sin cruces.",
            status: "PENDING",
            progressLabel: "0 horarios armados",
            actionUrl: "/timetables",
            actionLabel: "Armar Horarios",
          },
          {
            id: "enrollments",
            stepNumber: 6,
            title: "Matriculación de Estudiantes",
            description:
              "Inscribir a la población escolar en sus respectivos cursos.",
            status: "PENDING",
            progressLabel: "0 estudiantes inscritos",
            actionUrl: "/enrollments",
            actionLabel: "Inscribir Alumnos",
          },
          {
            id: "first_trimester",
            stepNumber: 7,
            title: "Apertura del 1er Trimestre",
            description:
              "Habilitar la recepción de calificaciones y pase de lista del periodo inicial.",
            status: "PENDING",
            progressLabel: "Trimestre cerrado",
            actionUrl: "/academic-years",
            actionLabel: "Abrir Trimestre",
          },
        ],
      };
    }

    // Consultas concurrentes para evaluar todos los hitos del colegio
    const [
      subjectsCount,
      spacesCount,
      periodsCount,
      classroomsCount,
      assignmentsCount,
      slotsCount,
      enrollmentsCount,
    ] = await Promise.all([
      this.prisma.subject.count(),
      this.prisma.physicalSpace.count(),
      this.prisma.classPeriod.count(),
      this.prisma.classroom.count({ where: { academicYearId: targetYear.id } }),
      this.prisma.teacherAssignment.count({
        where: { classroom: { academicYearId: targetYear.id } },
      }),
      this.prisma.scheduleSlot.count({
        where: { classroom: { academicYearId: targetYear.id } },
      }),
      this.prisma.enrollment.count({
        where: { academicYearId: targetYear.id },
      }),
    ]);

    const trimestersCount = targetYear.trimesters?.length ?? 0;
    const firstTrimester = targetYear.trimesters?.[0];
    const isFirstTrimesterOpen = Boolean(firstTrimester?.isOpen);

    const steps = [
      // Hito 1: Gestión y Trimestres
      {
        id: "academic_year",
        stepNumber: 1,
        title: "Ciclo Lectivo y Trimestres",
        description: "Crear y activar la gestión escolar con sus 3 trimestres.",
        status:
          targetYear.status === AcademicStatus.ACTIVE && trimestersCount >= 3
            ? "COMPLETED"
            : "IN_PROGRESS",
        progressLabel: `Gestión ${targetYear.year} (${trimestersCount} trimestres definidos - Estado ${targetYear.status})`,
        actionUrl: "/academic-years",
        actionLabel: "Ver Gestión",
      },
      // Hito 2: Materias y Espacios Físicos
      {
        id: "catalog_spaces",
        stepNumber: 2,
        title: "Materias y Espacios Físicos",
        description:
          "Registrar el catálogo de materias, periodos y ambientes físicos.",
        status:
          subjectsCount > 0 && spacesCount > 0
            ? "COMPLETED"
            : subjectsCount > 0 || spacesCount > 0
              ? "IN_PROGRESS"
              : "PENDING",
        progressLabel: `${subjectsCount} materias, ${spacesCount} espacios físicos, ${periodsCount} periodos`,
        actionUrl: "/subjects",
        actionLabel: "Gestionar Materias",
      },
      // Hito 3: Aulas y Cursos
      {
        id: "classrooms",
        stepNumber: 3,
        title: "Cursos y Paralelos",
        description:
          "Definir las aulas de Inicial, Primaria y Secundaria para esta gestión.",
        status:
          classroomsCount >= 4
            ? "COMPLETED"
            : classroomsCount > 0
              ? "IN_PROGRESS"
              : "PENDING",
        progressLabel: `${classroomsCount} aulas/paralelos configurados`,
        actionUrl: "/classrooms",
        actionLabel: "Gestionar Cursos",
      },
      // Hito 4: Carga Horaria Docente
      {
        id: "teacher_assignments",
        stepNumber: 4,
        title: "Carga Horaria Docente",
        description: "Asignar profesores a cada materia de cada curso.",
        status:
          assignmentsCount >= classroomsCount * 2 && classroomsCount > 0
            ? "COMPLETED"
            : assignmentsCount > 0
              ? "IN_PROGRESS"
              : "PENDING",
        progressLabel: `${assignmentsCount} asignaciones docentes realizadas`,
        actionUrl: "/teacher-assignments",
        actionLabel: "Asignar Docentes",
      },
      // Hito 5: Horarios Semanales
      {
        id: "timetables",
        stepNumber: 5,
        title: "Horarios Semanales",
        description: "Completar la grilla de horarios semanales por curso.",
        status:
          slotsCount >= classroomsCount * 4 && classroomsCount > 0
            ? "COMPLETED"
            : slotsCount > 0
              ? "IN_PROGRESS"
              : "PENDING",
        progressLabel: `${slotsCount} bloques de horario programados`,
        actionUrl: "/timetables",
        actionLabel: "Armar Horarios",
      },
      // Hito 6: Matriculación Escolar
      {
        id: "enrollments",
        stepNumber: 6,
        title: "Matriculación de Estudiantes",
        description: "Inscribir estudiantes en sus respectivos paralelos.",
        status:
          enrollmentsCount >= 10
            ? "COMPLETED"
            : enrollmentsCount > 0
              ? "IN_PROGRESS"
              : "PENDING",
        progressLabel: `${enrollmentsCount} estudiantes inscritos`,
        actionUrl: "/enrollments",
        actionLabel: "Inscribir Alumnos",
      },
      // Hito 7: Lanzamiento del 1er Trimestre
      {
        id: "first_trimester",
        stepNumber: 7,
        title: "Apertura del 1er Trimestre",
        description:
          "Habilitar el periodo académico para recepción de notas y asistencia.",
        status: isFirstTrimesterOpen ? "COMPLETED" : "PENDING",
        progressLabel: isFirstTrimesterOpen
          ? "1er Trimestre Abierto (Recepción activa de notas)"
          : "1er Trimestre cerrado",
        actionUrl: "/academic-years",
        actionLabel: isFirstTrimesterOpen
          ? "Ver Trimestres"
          : "Abrir 1er Trimestre",
      },
    ];

    const completedSteps = steps.filter((s) => s.status === "COMPLETED").length;
    const percentage = Math.round((completedSteps / steps.length) * 100);

    return {
      academicYear: {
        id: targetYear.id,
        year: targetYear.year,
        status: targetYear.status,
      },
      percentage,
      completedSteps,
      totalSteps: steps.length,
      steps,
    };
  }
}
