import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleSlotDto } from './dto/create-schedule-slot.dto';
import { Shift } from '../../prisma/generated/client';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import { renderToStream } from '@react-pdf/renderer';
import { TimetableTemplate } from './templates/timetable.template';
import React from 'react';

import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class TimetablesService {
  constructor(
    private prisma: PrismaService,
    private institutionConfig: InstitutionConfigService,
    @InjectQueue('export-queue') private exportQueue: Queue,
  ) {}

  async getPeriods(shift: Shift) {
    return this.prisma.classPeriod.findMany({
      where: { shift },
      orderBy: { order: 'asc' },
    });
  }

  async getClassroomSchedule(classroomId: string) {
    return this.prisma.scheduleSlot.findMany({
      where: { classroomId },
      include: {
        teacherAssignment: {
          include: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true } },
          },
        },
        physicalSpace: { select: { id: true, name: true } },
      },
    });
  }

  async createSlot(data: CreateScheduleSlotDto) {
    const [assignment, period, institution] = await Promise.all([
      this.prisma.teacherAssignment.findUnique({
        where: { id: data.teacherAssignmentId },
        include: {
          classroom: true,
          teacher: { select: { fullName: true } },
          subject: true,
        },
      }),
      this.prisma.classPeriod.findUnique({ where: { id: data.classPeriodId } }),
      this.institutionConfig.get(),
    ]);

    if (!assignment)
      throw new NotFoundException('Asignación docente no encontrada.');
    if (!period) throw new NotFoundException('Periodo de clase no encontrado.');
    if (!institution)
      throw new NotFoundException('Configuración institucional no encontrada.');

    if (period.isBreak) {
      throw new BadRequestException(
        'No es posible asignar materias en periodos marcados como recreo o descanso.',
      );
    }

    if (!period.isActive) {
      throw new BadRequestException(
        'No es posible asignar materias en un periodo inactivo o descontinuado.',
      );
    }

    if (
      data.classroomId !== assignment.classroomId ||
      data.teacherId !== assignment.teacherId
    ) {
      throw new ConflictException(
        'Inconsistencia de datos: El docente o curso no coinciden con la asignación oficial.',
      );
    }

    if (assignment.classroom.shift !== period.shift) {
      throw new ConflictException(
        `Incompatibilidad de turno: El curso es del turno ${assignment.classroom.shift}, pero el periodo es de la ${period.shift}.`,
      );
    }

    let finalSpaceId: string | null | undefined = data.physicalSpaceId;
    const subject = assignment.subject;
    const subjectName = subject.name.toLowerCase();
    const isSpecialSubject =
      Boolean(subject.requiresSpecialSpace) ||
      Boolean(subject.allowedSpaceType) ||
      subjectName.includes('educación física') ||
      subjectName.includes('educacion fisica');

    if (institution.schedulingMode === 'FIXED_BASE') {
      if (!isSpecialSubject) {
        finalSpaceId = assignment.classroom.baseRoomId;

        if (
          data.physicalSpaceId &&
          data.physicalSpaceId !== assignment.classroom.baseRoomId
        ) {
          throw new ConflictException(
            `En el modo 'Aula Fija', la materia de ${assignment.subject.name} no tiene permitido cambiar de espacio físico.`,
          );
        }
      }
    } else if (institution.schedulingMode === 'DYNAMIC') {
      if (!finalSpaceId) {
        throw new ConflictException(
          'En modo DINÁMICO es estrictamente obligatorio asignar un espacio físico (Aula/Lab).',
        );
      }
    }

    if (finalSpaceId) {
      const space = await this.prisma.physicalSpace.findUnique({
        where: { id: finalSpaceId },
      });
      if (!space) {
        throw new NotFoundException('El espacio físico seleccionado no existe.');
      }
      if (!space.isActive) {
        throw new BadRequestException(
          `El espacio físico "${space.name}" se encuentra inactivo y no puede ser programado en el horario.`,
        );
      }

      const spaceConflict = await this.prisma.scheduleSlot.findFirst({
        where: {
          physicalSpaceId: finalSpaceId,
          dayOfWeek: data.dayOfWeek,
          classPeriodId: data.classPeriodId,
        },
        include: { physicalSpace: true, classroom: true },
      });

      if (spaceConflict) {
        const spaceName =
          spaceConflict.physicalSpace?.name || 'El espacio seleccionado';
        throw new ConflictException(
          `Choque de Espacio: "${spaceName}" ya está reservado para ${spaceConflict.classroom.grade} "${spaceConflict.classroom.section}".`,
        );
      }
    }

    const teacherConflict = await this.prisma.scheduleSlot.findFirst({
      where: {
        teacherId: data.teacherId,
        dayOfWeek: data.dayOfWeek,
        classPeriodId: data.classPeriodId,
      },
      include: { classroom: true },
    });

    if (teacherConflict) {
      throw new ConflictException(
        `Choque de Docente: El Prof. ${assignment.teacher.fullName} ya dicta clases en ${teacherConflict.classroom.grade} "${teacherConflict.classroom.section}" a esta hora.`,
      );
    }

    try {
      return await this.prisma.scheduleSlot.create({
        data: {
          dayOfWeek: data.dayOfWeek,
          classPeriodId: data.classPeriodId,
          teacherAssignmentId: data.teacherAssignmentId,
          classroomId: assignment.classroomId,
          teacherId: assignment.teacherId,
          physicalSpaceId: finalSpaceId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Este curso ya tiene una materia asignada en este horario específico.',
        );
      }
      throw error;
    }
  }

  async removeSlot(id: string) {
    const slot = await this.prisma.scheduleSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException('Casillero no encontrado');
    await this.prisma.scheduleSlot.delete({ where: { id } });
    return { message: 'Casillero liberado exitosamente' };
  }

  async exportSinglePdf(classroomId: string, res: Response) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { academicYear: true },
    });
    if (!classroom) throw new NotFoundException('Curso no encontrado');

    const periods = await this.getPeriods(classroom.shift);
    const slots = await this.getClassroomSchedule(classroomId);

    const pdfStream = await renderToStream(
      React.createElement(TimetableTemplate, { classroom, periods, slots }),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Horario_${classroom.grade}_${classroom.section}.pdf"`,
    });

    pdfStream.pipe(res);
  }

  async requestMassiveZip(academicYearId: string, userId: string) {
    await this.exportQueue.add('generate-massive-zip', {
      academicYearId,
      userId,
    });
    return {
      message: 'Generación iniciada en segundo plano.',
      status: 'processing',
    };
  }

  async downloadZip(fileName: string, res: Response) {
    const safeFileName = path.basename(fileName);
    if (!safeFileName.endsWith('.zip') || safeFileName !== fileName) {
      throw new BadRequestException('Nombre de archivo no válido.');
    }
    const filePath = path.join(process.cwd(), 'temp-exports', safeFileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo ya no existe o expiró.');
    }
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
    });
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  async updateSlotSpace(id: string, physicalSpaceId: string | null) {
    const slot = await this.prisma.scheduleSlot.findUnique({
      where: { id },
      include: {
        teacherAssignment: { include: { subject: true } },
        classroom: true,
      },
    });

    if (!slot) throw new NotFoundException('Casillero no encontrado');

    const institution = await this.institutionConfig.get();

    const subject = slot.teacherAssignment.subject;
    const subjectName = subject.name.toLowerCase();
    const isSpecialSubject =
      Boolean(subject.requiresSpecialSpace) ||
      Boolean(subject.allowedSpaceType) ||
      subjectName.includes('educación física') ||
      subjectName.includes('educacion fisica');

    if (institution.schedulingMode === 'FIXED_BASE' && !isSpecialSubject) {
      throw new ConflictException(
        `Acción denegada: En modo 'Aula Fija', no puedes mover la materia de ${slot.teacherAssignment.subject.name} a otro espacio físico.`,
      );
    }

    if (physicalSpaceId) {
      const space = await this.prisma.physicalSpace.findUnique({
        where: { id: physicalSpaceId },
      });
      if (!space) {
        throw new NotFoundException('El espacio físico seleccionado no existe.');
      }
      if (!space.isActive) {
        throw new BadRequestException(
          `El espacio físico "${space.name}" se encuentra inactivo y no puede ser programado en el horario.`,
        );
      }

      const spaceConflict = await this.prisma.scheduleSlot.findFirst({
        where: {
          physicalSpaceId: physicalSpaceId,
          dayOfWeek: slot.dayOfWeek,
          classPeriodId: slot.classPeriodId,
          id: { not: id },
        },
        include: { physicalSpace: true, classroom: true },
      });

      if (spaceConflict) {
        const spaceName =
          spaceConflict.physicalSpace?.name || 'El espacio seleccionado';
        throw new ConflictException(
          `Choque de Espacio: "${spaceName}" ya está reservado para ${spaceConflict.classroom.grade} "${spaceConflict.classroom.section}".`,
        );
      }
    }

    return this.prisma.scheduleSlot.update({
      where: { id },
      data: { physicalSpaceId },
    });
  }

  async getMySchedule(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        student: {
          include: {
            enrollments: {
              where: { status: 'INSCRITO' },
              include: { classroom: true },
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
        },
        guardian: {
          include: {
            students: {
              include: {
                student: {
                  include: {
                    enrollments: {
                      where: { status: 'INSCRITO' },
                      include: { classroom: true },
                      orderBy: { date: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado.');

    const roleName = user.role.name;

    // 1. Docente
    if (roleName === 'DOCENTE' || roleName === 'PROFESOR') {
      const slots = await this.prisma.scheduleSlot.findMany({
        where: { teacherId: userId },
        include: {
          classPeriod: true,
          classroom: true,
          teacherAssignment: {
            include: {
              subject: true,
              teacher: { select: { id: true, fullName: true } },
            },
          },
          physicalSpace: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { classPeriod: { order: 'asc' } }],
      });

      return {
        role: 'DOCENTE',
        slots,
      };
    }

    // 2. Estudiante
    if (roleName === 'ESTUDIANTE' || user.student) {
      const activeEnrollment = user.student?.enrollments?.[0];
      if (!activeEnrollment) {
        return {
          role: 'ESTUDIANTE',
          classroom: null,
          slots: [],
        };
      }

      const slots = await this.prisma.scheduleSlot.findMany({
        where: { classroomId: activeEnrollment.classroomId },
        include: {
          classPeriod: true,
          classroom: true,
          teacherAssignment: {
            include: {
              subject: true,
              teacher: { select: { id: true, fullName: true } },
            },
          },
          physicalSpace: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { classPeriod: { order: 'asc' } }],
      });

      return {
        role: 'ESTUDIANTE',
        classroom: activeEnrollment.classroom,
        slots,
      };
    }

    // 3. Tutor / Padre de Familia
    if (roleName === 'TUTOR' || roleName === 'PADRE' || user.guardian) {
      const children = user.guardian?.students || [];
      const childrenSchedules = await Promise.all(
        children.map(async (relation) => {
          const student = relation.student;
          const activeEnrollment = student?.enrollments?.[0];
          if (!activeEnrollment) {
            return {
              student: { id: student.id, name: student.names },
              classroom: null,
              slots: [],
            };
          }

          const slots = await this.prisma.scheduleSlot.findMany({
            where: { classroomId: activeEnrollment.classroomId },
            include: {
              classPeriod: true,
              classroom: true,
              teacherAssignment: {
                include: {
                  subject: true,
                  teacher: { select: { id: true, fullName: true } },
                },
              },
              physicalSpace: true,
            },
            orderBy: [{ dayOfWeek: 'asc' }, { classPeriod: { order: 'asc' } }],
          });

          return {
            student: {
              id: student.id,
              name: `${student.names} ${student.lastNamePaterno || ''}`.trim(),
            },
            classroom: activeEnrollment.classroom,
            slots,
          };
        }),
      );

      return {
        role: 'TUTOR',
        children: childrenSchedules,
      };
    }

    // Fallback: Administradores u otro personal
    return {
      role: roleName,
      slots: [],
    };
  }

  async getTodaySchedule(userId: string) {
    const fullSchedule: any = await this.getMySchedule(userId);

    // Determinamos el día de la semana actual en Bolivia (UTC-4)
    const now = new Date();
    const boliviaDate = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
    );
    const jsDay = boliviaDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    const dayNames: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo',
    };

    const isoDate = `${boliviaDate.getFullYear()}-${String(
      boliviaDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(boliviaDate.getDate()).padStart(2, '0')}`;

    if (fullSchedule.slots) {
      const todaySlots = fullSchedule.slots.filter(
        (s: any) => s.dayOfWeek === dayOfWeek,
      );
      return {
        ...fullSchedule,
        dayOfWeek,
        dayName: dayNames[dayOfWeek] || 'Desconocido',
        date: isoDate,
        slots: todaySlots,
      };
    }

    if (fullSchedule.children) {
      const childrenToday = fullSchedule.children.map((child: any) => ({
        ...child,
        slots: child.slots.filter((s: any) => s.dayOfWeek === dayOfWeek),
      }));
      return {
        ...fullSchedule,
        dayOfWeek,
        dayName: dayNames[dayOfWeek] || 'Desconocido',
        date: isoDate,
        children: childrenToday,
      };
    }

    return {
      ...fullSchedule,
      dayOfWeek,
      dayName: dayNames[dayOfWeek] || 'Desconocido',
      date: isoDate,
      slots: [],
    };
  }
}
