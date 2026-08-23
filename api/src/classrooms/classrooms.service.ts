import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AcademicStatus } from '../../prisma/generated/client';
import { CreateBulkClassroomsDto } from './dto/create-bulk-classrooms.dto';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@Injectable()
export class ClassroomsService {
  private readonly logger = new Logger(ClassroomsService.name);
  private readonly activeCacheKeys = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ======================================================
  // CACHE HELPERS
  // ======================================================

  private getClassroomsCacheKey(query: any, userId: string) {
    return `classrooms:${userId}:${JSON.stringify(query)}`;
  }

  private async invalidateCaches() {
    const keys = Array.from(this.activeCacheKeys);
    await Promise.all(keys.map((k) => this.cacheManager.del(k)));
    this.activeCacheKeys.clear();
    this.logger.log(`🧹 Cache classrooms invalidado (${keys.length} llaves)`);
  }

  // ======================================================
  // CREATE
  // ======================================================

  async create(data: CreateClassroomDto) {
    const year = await this.prisma.academicYear.findUnique({
      where: {
        id: data.academicYearId,
      },
    });

    if (!year) {
      throw new NotFoundException('La gestión académica no existe');
    }

    if (year.status === AcademicStatus.CLOSED) {
      throw new BadRequestException(
        'No se pueden crear cursos en una gestión cerrada',
      );
    }

    if (data.advisorId) {
      await this.usersService.validateTeacherAdvisor(data.advisorId);
    }

    if (data.baseRoomId) {
      const space = await this.prisma.physicalSpace.findUnique({
        where: { id: data.baseRoomId },
      });
      if (!space || !space.isActive) {
        throw new BadRequestException(
          'El espacio físico seleccionado no existe o está inactivo.',
        );
      }

      const conflictingClassroom = await this.prisma.classroom.findFirst({
        where: {
          academicYearId: data.academicYearId,
          shift: data.shift,
          baseRoomId: data.baseRoomId,
        },
      });

      if (conflictingClassroom) {
        throw new ConflictException(
          `El espacio físico '${space.name}' ya está asignado a otro curso (${conflictingClassroom.grade} ${conflictingClassroom.section}) en el turno ${data.shift}.`,
        );
      }
    }

    try {
      const classroom = await this.prisma.classroom.create({
        data,
        include: {
          advisor: {
            select: {
              id: true,
              fullName: true,
            },
          },
          academicYear: {
            select: {
              id: true,
              name: true,
              year: true,
              status: true,
            },
          },
          baseRoom: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // ======================================================
      // CACHE INVALIDATION
      // ======================================================
      await this.invalidateCaches();

      // ======================================================
      // EVENTS
      // ======================================================
      this.eventEmitter.emit('classroom.created', {
        classroomId: classroom.id,
      });

      this.logger.log(
        `🏫 Curso creado: ${classroom.grade} ${classroom.section}`,
      );

      return classroom;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `El curso ${data.grade} ${data.section} ya existe en esta gestión.`,
        );
      }

      throw error;
    }
  }

  // ======================================================
  // FIND ALL
  // ======================================================

  async findAll(
    query: PaginationDto & {
      academicYearId?: string;
      level?: string;
      shift?: string;
    },
    user: any,
  ) {
    const cacheKey = this.getClassroomsCacheKey(query, user.userId);

    // ======================================================
    // CACHE HIT
    // ======================================================

    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const { search, academicYearId, level, shift } = query;

    const permissions = user?.permissions || [];

    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.MANAGE_ALL_CLASSROOM);

    const whereCondition: any = {
      AND: [
        academicYearId ? { academicYearId } : {},

        level ? { level } : {},

        shift ? { shift } : {},

        search
          ? {
              OR: [
                {
                  grade: {
                    contains: search,

                    mode: 'insensitive',
                  },
                },

                {
                  section: {
                    contains: search,

                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},

        !isPowerUser
          ? {
              OR: [
                {
                  advisorId: user.userId,
                },

                {
                  subjectAssignments: {
                    some: {
                      teacherId: user.userId,
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [total, data] = await Promise.all([
      this.prisma.classroom.count({
        where: whereCondition,
      }),

      this.prisma.classroom.findMany({
        where: whereCondition,

        skip,

        take: limit,

        orderBy: [
          {
            level: 'asc',
          },

          {
            grade: 'asc',
          },

          {
            section: 'asc',
          },
        ],

        include: {
          advisor: {
            select: {
              id: true,

              fullName: true,
            },
          },

          academicYear: {
            select: {
              year: true,

              status: true,
            },
          },

          baseRoom: {
            select: {
              id: true,

              name: true,
            },
          },

          _count: {
            select: {
              enrollments: {
                where: {
                  status: {
                    in: ['INSCRITO', 'REVISION_SIE', 'OBSERVADO'],
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const result = {
      data,

      meta: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };

    // ======================================================
    // CACHE STORE
    // ======================================================
    this.activeCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60 * 5);

    return result;
  }

  // ======================================================
  // FIND ONE
  // ======================================================

  async findOne(id: string, user?: any) {
    const permissions = user?.permissions || [];
    const isPowerUser =
      !user ||
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.MANAGE_ALL_CLASSROOM);

    const classroom = await this.prisma.classroom.findFirst({
      where: {
        id,
        ...(isPowerUser
          ? {}
          : {
              OR: [
                {
                  advisorId: user.userId,
                },
                {
                  subjectAssignments: {
                    some: {
                      teacherId: user.userId,
                    },
                  },
                },
              ],
            }),
      },
      include: {
        advisor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
            year: true,
            status: true,
          },
        },
        baseRoom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!classroom) {
      throw new NotFoundException('Curso no encontrado o sin acceso');
    }

    return classroom;
  }

  // ======================================================
  // CREATE BULK
  // ======================================================

  async createBulk(data: CreateBulkClassroomsDto) {
    if (!data.classrooms || data.classrooms.length === 0) {
      throw new BadRequestException(
        'Debe proporcionar al menos un curso para la creación masiva.',
      );
    }

    const year = await this.prisma.academicYear.findUnique({
      where: {
        id: data.academicYearId,
      },
    });

    if (!year || year.status === AcademicStatus.CLOSED) {
      throw new BadRequestException('Gestión académica inválida o cerrada');
    }

    const existingClassrooms = await this.prisma.classroom.findMany({
      where: {
        academicYearId: data.academicYearId,
        level: data.level,
        shift: data.shift,
      },
      select: {
        grade: true,
        section: true,
        baseRoomId: true,
      },
    });

    const existingSet = new Set(
      existingClassrooms.map((c) => `${c.grade}-${c.section}`.toLowerCase()),
    );
    const assignedRooms = new Set(
      existingClassrooms
        .filter((c) => c.baseRoomId)
        .map((c) => c.baseRoomId as string),
    );

    const toCreate: any[] = [];
    const failedReports: string[] = [];

    for (const c of data.classrooms) {
      const key = `${c.grade}-${c.section}`.toLowerCase();

      if (existingSet.has(key)) {
        failedReports.push(`El curso ${c.grade} "${c.section}" ya existe.`);
        continue;
      }

      if (c.baseRoomId) {
        if (assignedRooms.has(c.baseRoomId)) {
          failedReports.push(
            `El salón base para ${c.grade} "${c.section}" ya está asignado a otro curso en este turno.`,
          );
          continue;
        }
        assignedRooms.add(c.baseRoomId);
      }

      toCreate.push({
        academicYearId: data.academicYearId,
        level: data.level,
        shift: data.shift,
        grade: c.grade,
        section: c.section,
        capacity: c.capacity,
        baseRoomId: c.baseRoomId || null,
      });
      existingSet.add(key);
    }

    // ======================================================
    // TRANSACTION
    // ======================================================
    try {
      await this.prisma.$transaction(async (tx) => {
        if (toCreate.length > 0) {
          await tx.classroom.createMany({
            data: toCreate,
          });
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Existen conflictos de duplicación en los cursos a crear masivamente.',
        );
      }
      throw error;
    }

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================
    await this.invalidateCaches();

    // ======================================================
    // EVENTS
    // ======================================================
    this.eventEmitter.emit('classroom.bulk.created', {
      count: toCreate.length,
    });

    this.logger.log(`🏫 Bulk classrooms creados: ${toCreate.length}`);

    return {
      message: `Proceso completado. Se crearon ${toCreate.length} cursos nuevos.`,
      createdCount: toCreate.length,
      failedCount: failedReports.length,
      errors: failedReports,
    };
  }

  // ======================================================
  // UPDATE
  // ======================================================

  async update(id: string, data: UpdateClassroomDto) {
    const existingClassroom = await this.findOne(id);

    if (data.advisorId) {
      await this.usersService.validateTeacherAdvisor(data.advisorId);
    }

    if (data.capacity !== undefined) {
      const activeEnrollmentsCount = await this.prisma.enrollment.count({
        where: {
          classroomId: id,
          status: {
            in: ['INSCRITO', 'REVISION_SIE', 'OBSERVADO'],
          },
        },
      });

      if (data.capacity < activeEnrollmentsCount) {
        throw new BadRequestException(
          `No se puede reducir la capacidad a ${data.capacity} porque actualmente hay ${activeEnrollmentsCount} estudiantes activos inscritos.`,
        );
      }
    }

    if (data.baseRoomId) {
      const space = await this.prisma.physicalSpace.findUnique({
        where: { id: data.baseRoomId },
      });
      if (!space || !space.isActive) {
        throw new BadRequestException(
          'El espacio físico seleccionado no existe o está inactivo.',
        );
      }

      const targetShift = data.shift || existingClassroom.shift;
      const conflictingClassroom = await this.prisma.classroom.findFirst({
        where: {
          id: { not: id },
          academicYearId: existingClassroom.academicYear.id,
          shift: targetShift,
          baseRoomId: data.baseRoomId,
        },
      });

      if (conflictingClassroom) {
        throw new ConflictException(
          `El espacio físico '${space.name}' ya está asignado a otro curso (${conflictingClassroom.grade} ${conflictingClassroom.section}) en el turno ${targetShift}.`,
        );
      }
    }

    try {
      const updated = await this.prisma.classroom.update({
        where: { id },
        data,
        include: {
          advisor: {
            select: {
              id: true,
              fullName: true,
            },
          },
          academicYear: {
            select: {
              id: true,
              name: true,
              year: true,
              status: true,
            },
          },
          baseRoom: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // ======================================================
      // CACHE INVALIDATION
      // ======================================================
      await this.invalidateCaches();

      // ======================================================
      // EVENTS
      // ======================================================
      this.eventEmitter.emit('classroom.updated', {
        classroomId: updated.id,
      });

      this.logger.log(
        `✏️ Curso actualizado: ${updated.grade} ${updated.section}`,
      );

      return updated;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Los cambios generan un curso duplicado.');
      }

      throw error;
    }
  }

  // ======================================================
  // REMOVE
  // ======================================================

  async remove(id: string) {
    await this.findOne(id);

    try {
      await this.prisma.classroom.delete({
        where: { id },
      });

      // ======================================================
      // CACHE INVALIDATION
      // ======================================================
      await this.invalidateCaches();

      // ======================================================
      // EVENTS
      // ======================================================
      this.eventEmitter.emit('classroom.deleted', {
        classroomId: id,
      });

      this.logger.log(`🗑️ Curso eliminado: ${id}`);

      return {
        message: 'Curso eliminado correctamente',
      };
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar este curso porque tiene dependencias asignadas (alumnos, asignaciones u horarios).',
        );
      }

      throw error;
    }
  }
}

