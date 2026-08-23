import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { UpdateTeacherAssignmentDto } from './dto/update-teacher-assignment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CloneAssignmentsDto } from './dto/clone-assignments.dto';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@Injectable()
export class TeacherAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTeacherAssignmentDto) {
    // 1. Validar existencia del curso y que la gestión no esté cerrada
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: data.classroomId },
      include: { academicYear: true },
    });

    if (!classroom) {
      throw new NotFoundException('El curso/aula especificado no existe.');
    }

    if (classroom.academicYear.status === 'CLOSED') {
      throw new ConflictException(
        'Operación bloqueada: No se pueden realizar asignaciones en una gestión académica cerrada.',
      );
    }

    // 2. Validar existencia de la materia y coherencia de nivel
    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    if (!subject) {
      throw new NotFoundException('La materia especificada no existe.');
    }

    if (subject.level !== classroom.level) {
      throw new BadRequestException(
        `Incompatibilidad de nivel: La materia "${subject.name}" (${subject.level}) no corresponde al nivel del curso (${classroom.level}).`,
      );
    }

    // 3. Validar docente
    const teacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId, status: 'ACTIVE' },
      include: { role: true },
    });

    if (!teacher || teacher.role?.name !== 'DOCENTE') {
      throw new BadRequestException(
        'El usuario asignado no existe, está inactivo, o no tiene el rol de DOCENTE.',
      );
    }

    try {
      return await this.prisma.teacherAssignment.create({
        data,
        include: {
          teacher: { select: { id: true, fullName: true, email: true } },
          subject: { select: { id: true, name: true, level: true, area: true } },
          classroom: {
            select: {
              id: true,
              level: true,
              grade: true,
              section: true,
              shift: true,
              capacity: true,
              baseRoom: { select: { id: true, name: true } },
              _count: { select: { enrollments: true } },
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Este curso ya tiene un docente asignado para esta materia.',
        );
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateTeacherAssignmentDto) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id },
      include: {
        classroom: { include: { academicYear: true } },
        subject: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Asignación no encontrada.');
    }

    if (assignment.classroom.academicYear.status === 'CLOSED') {
      throw new ConflictException(
        'Operación bloqueada: No se puede modificar una asignación en una gestión académica cerrada.',
      );
    }

    if (assignment.teacherId === data.teacherId) {
      return assignment;
    }

    const newTeacher = await this.prisma.user.findUnique({
      where: { id: data.teacherId, status: 'ACTIVE' },
      include: { role: true },
    });

    if (!newTeacher || newTeacher.role?.name !== 'DOCENTE') {
      throw new BadRequestException(
        'El nuevo docente no existe, está inactivo, o no tiene el rol de DOCENTE.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.teacherAssignment.update({
        where: { id },
        data: { teacherId: data.teacherId },
        include: {
          teacher: { select: { id: true, fullName: true, email: true } },
          subject: { select: { id: true, name: true, level: true, area: true } },
          classroom: {
            select: {
              id: true,
              level: true,
              grade: true,
              section: true,
              shift: true,
              capacity: true,
              baseRoom: { select: { id: true, name: true } },
              _count: { select: { enrollments: true } },
            },
          },
        },
      });

      // Sincronizar automáticamente los casilleros de horarios existentes
      await tx.scheduleSlot.updateMany({
        where: { teacherAssignmentId: id },
        data: { teacherId: data.teacherId },
      });

      return updated;
    });
  }

  async cloneAssignments(data: CloneAssignmentsDto) {
    if (data.targetClassroomIds.length === 0 || data.assignments.length === 0) {
      throw new BadRequestException(
        'Debe seleccionar al menos un curso destino y una materia.',
      );
    }

    // 1. Obtener y validar las aulas destino
    const targetClassrooms = await this.prisma.classroom.findMany({
      where: { id: { in: data.targetClassroomIds } },
      include: { academicYear: true },
    });

    if (targetClassrooms.length !== data.targetClassroomIds.length) {
      throw new NotFoundException('Uno o más cursos destino no fueron encontrados.');
    }

    for (const room of targetClassrooms) {
      if (room.academicYear.status === 'CLOSED') {
        throw new ConflictException(
          `El curso ${room.grade} "${room.section}" pertenece a una gestión académica cerrada.`,
        );
      }
    }

    // 2. Validar que las materias pertenezcan al nivel de las aulas
    const subjectIds = [...new Set(data.assignments.map((a) => a.subjectId))];
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
    });
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    for (const room of targetClassrooms) {
      for (const assignment of data.assignments) {
        const sub = subjectMap.get(assignment.subjectId);
        if (!sub) {
          throw new NotFoundException(`Materia con ID ${assignment.subjectId} no encontrada.`);
        }
        if (sub.level !== room.level) {
          throw new BadRequestException(
            `La materia "${sub.name}" (${sub.level}) no es compatible con el nivel de ${room.grade} "${room.section}" (${room.level}).`,
          );
        }
      }
    }

    const recordsToInsert: {
      classroomId: string;
      subjectId: string;
      teacherId: string;
    }[] = [];

    for (const targetId of data.targetClassroomIds) {
      for (const assignment of data.assignments) {
        recordsToInsert.push({
          classroomId: targetId,
          subjectId: assignment.subjectId,
          teacherId: assignment.teacherId,
        });
      }
    }

    const result = await this.prisma.teacherAssignment.createMany({
      data: recordsToInsert,
      skipDuplicates: true, // Ignora si una materia ya está asignada en el curso destino
    });

    return {
      message: 'Clonación completada con éxito',
      clonedCount: result.count,
    };
  }

  async findAll(
    query: PaginationDto & {
      academicYearId?: string;
      classroomId?: string;
      teacherId?: string;
    },
    user: any,
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    let { academicYearId, classroomId, teacherId } = query;

    // 🔥 REGLA ABAC: Evaluamos los permisos del usuario
    const permissions = user.permissions || [];
    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.MANAGE_ALL_TEACHER_ASSIGNMENT);

    if (!isPowerUser) {
      // Si NO es Power User (es un DOCENTE), solo ve su propia carga horaria.
      teacherId = user.userId;
    }

    const whereCondition: any = {
      AND: [
        classroomId ? { classroomId } : {},
        teacherId ? { teacherId } : {},
        academicYearId ? { classroom: { academicYearId } } : {},
      ],
    };

    const [total, data] = await Promise.all([
      this.prisma.teacherAssignment.count({ where: whereCondition }),
      this.prisma.teacherAssignment.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: [
          { classroom: { grade: 'asc' } },
          { subject: { name: 'asc' } },
        ],
        include: {
          teacher: { select: { id: true, fullName: true, email: true } },
          subject: {
            select: { id: true, name: true, level: true, area: true },
          },
          classroom: {
            select: {
              id: true,
              level: true,
              grade: true,
              section: true,
              shift: true,
              capacity: true,
              baseRoom: { select: { id: true, name: true } },
              _count: { select: { enrollments: true } },
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.teacherAssignment.findUnique({
        where: { id },
        include: { classroom: { include: { academicYear: true } } },
      });

      if (!assignment) {
        throw new NotFoundException('Asignación no encontrada');
      }

      if (assignment.classroom.academicYear.status === 'CLOSED') {
        throw new ConflictException(
          'Operación bloqueada: No se puede eliminar una asignación de una gestión académica cerrada.',
        );
      }

      // 🛡️ Protección de Integridad (Calificaciones)
      const gradesCount = await tx.grade.count({
        where: { teacherAssignmentId: id },
      });

      if (gradesCount > 0) {
        throw new ConflictException(
          'Operación bloqueada: No se puede quitar al docente porque ya existen calificaciones registradas para esta materia. Utilice la función de reasignar docente.',
        );
      }

      // 🛡️ Protección de Integridad (Horarios)
      const schedulesCount = await tx.scheduleSlot.count({
        where: { teacherAssignmentId: id },
      });

      if (schedulesCount > 0) {
        throw new ConflictException(
          'Operación bloqueada: No se puede eliminar esta asignación porque la materia ya está distribuida en el Horario Escolar. Reasigne el docente o retire la materia del horario.',
        );
      }

      await tx.teacherAssignment.delete({ where: { id } });
      return { message: 'Asignación eliminada correctamente' };
    });
  }
}
