import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertGradeDto } from './dto/upsert-grade.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { ResolveChangeRequestDto } from './dto/resolve-change-request.dto';
import { Prisma } from '../../prisma/generated/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SystemPermissions } from '../auth/constants/permissions.constant';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications-queue') private notificationsQueue: Queue,
  ) {}

  // ==========================================
  // 🔥 HELPER: ABAC - VERIFICAR PROPIEDAD DE MATERIA
  // ==========================================
  private verifyAssignmentOwnership(assignment: any, user: AuthenticatedUser) {
    const permissions = user.permissions || [];

    // ABAC: Si tiene permiso global de lectura/manejo, pasa directo (Director/Secretaría)
    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.READ_ALL_GRADE) ||
      permissions.includes(SystemPermissions.UPDATE_ALL_STUDENT);

    if (isPowerUser) return;

    // Si no es Power User, debe ser estrictamente el Docente dueño de la materia
    if (assignment.teacherId !== user.userId) {
      throw new ForbiddenException(
        'Privacidad: No tienes permiso para ver o alterar las calificaciones de una materia que no dictas.',
      );
    }
  }

  // ==========================================
  // 🔥 HELPER: CÁLCULO CENTRALIZADO DE NOTAS LEY 070
  // ==========================================
  private calculateGradeScores(
    scoreSer: number | null,
    scoreSaber: number | null,
    scoreHacer: number | null,
    scoreAuto: number | null,
    recoveryScore: number | null,
  ) {
    if (
      scoreSer === null &&
      scoreSaber === null &&
      scoreHacer === null &&
      scoreAuto === null
    ) {
      return { totalScore: null, finalScore: null, recoveryScore };
    }

    const totalScore =
      (scoreSer || 0) +
      (scoreSaber || 0) +
      (scoreHacer || 0) +
      (scoreAuto || 0);

    let finalScore = totalScore;
    let finalRecovery = recoveryScore;

    if (totalScore >= 51) {
      finalRecovery = null;
      finalScore = totalScore;
    } else if (recoveryScore !== null) {
      finalScore = Math.min(recoveryScore, 51);
    }

    return { totalScore, finalScore, recoveryScore: finalRecovery };
  }

  // ==========================================
  // 🔥 HELPER: DESACOPLAMIENTO SEGURO DE NOTIFICACIONES
  // ==========================================
  private async safeSendGradeAlert(
    enrollmentId: string,
    subjectName: string,
    finalScore: number,
  ) {
    try {
      await this.notificationsQueue.add('grade-alert', {
        enrollmentId,
        subjectName,
        finalScore,
      });
    } catch (error) {
      this.logger.error(
        `Error al encolar alerta de calificación para enrollment ${enrollmentId}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  // ==========================================
  // PILAR 3: INSERCIÓN INDIVIDUAL (REFORZAMIENTO Y LEY 070)
  // ==========================================
  async upsertGrade(data: UpsertGradeDto, user: AuthenticatedUser) {
    const trimester = await this.prisma.trimester.findUnique({
      where: { id: data.trimesterId },
    });

    if (!trimester) throw new NotFoundException('Trimestre no encontrado');
    if (!trimester.isOpen) {
      throw new ForbiddenException(
        'El trimestre actual se encuentra cerrado. Comuníquese con Dirección para solicitar una corrección.',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');

    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id: data.teacherAssignmentId },
      include: { subject: true },
    });
    if (!assignment)
      throw new NotFoundException('Asignación docente no encontrada');

    // Validación ABAC de propiedad
    this.verifyAssignmentOwnership(assignment, user);

    const existingGrade = await this.prisma.grade.findUnique({
      where: {
        enrollmentId_teacherAssignmentId_trimesterId: {
          enrollmentId: data.enrollmentId,
          teacherAssignmentId: data.teacherAssignmentId,
          trimesterId: data.trimesterId,
        },
      },
    });

    const currentSer =
      data.scoreSer !== undefined
        ? data.scoreSer
        : (existingGrade?.scoreSer ?? null);
    const currentSaber =
      data.scoreSaber !== undefined
        ? data.scoreSaber
        : (existingGrade?.scoreSaber ?? null);
    const currentHacer =
      data.scoreHacer !== undefined
        ? data.scoreHacer
        : (existingGrade?.scoreHacer ?? null);
    const currentAuto =
      data.scoreAuto !== undefined
        ? data.scoreAuto
        : (existingGrade?.scoreAuto ?? null);
    const initialRecovery =
      data.recoveryScore !== undefined
        ? data.recoveryScore
        : (existingGrade?.recoveryScore ?? null);

    const {
      totalScore,
      finalScore,
      recoveryScore: currentRecovery,
    } = this.calculateGradeScores(
      currentSer,
      currentSaber,
      currentHacer,
      currentAuto,
      initialRecovery,
    );

    const targetStatus = data.status || existingGrade?.status || 'DRAFT';

    const savedGrade = await this.prisma.$transaction(async (tx) => {
      const grade = await tx.grade.upsert({
        where: {
          enrollmentId_teacherAssignmentId_trimesterId: {
            enrollmentId: data.enrollmentId,
            teacherAssignmentId: data.teacherAssignmentId,
            trimesterId: data.trimesterId,
          },
        },
        update: {
          scoreSer: currentSer,
          scoreSaber: currentSaber,
          scoreHacer: currentHacer,
          scoreAuto: currentAuto,
          totalScore,
          recoveryScore: currentRecovery,
          finalScore,
          status: targetStatus,
          lastModifiedById: user.userId,
        },
        create: {
          enrollmentId: data.enrollmentId,
          teacherAssignmentId: data.teacherAssignmentId,
          trimesterId: data.trimesterId,
          scoreSer: currentSer,
          scoreSaber: currentSaber,
          scoreHacer: currentHacer,
          scoreAuto: currentAuto,
          totalScore,
          recoveryScore: currentRecovery,
          finalScore,
          status: targetStatus,
          lastModifiedById: user.userId,
        },
      });

      await tx.gradeAudit.create({
        data: {
          gradeId: grade.id,
          changedById: user.userId,
          action: existingGrade ? 'UPSERT' : 'CREATE',
          oldScores: existingGrade
            ? {
                scoreSer: existingGrade.scoreSer,
                scoreSaber: existingGrade.scoreSaber,
                scoreHacer: existingGrade.scoreHacer,
                scoreAuto: existingGrade.scoreAuto,
                totalScore: existingGrade.totalScore,
                recoveryScore: existingGrade.recoveryScore,
                finalScore: existingGrade.finalScore,
                status: existingGrade.status,
              }
            : Prisma.DbNull,
          newScores: {
            scoreSer: currentSer,
            scoreSaber: currentSaber,
            scoreHacer: currentHacer,
            scoreAuto: currentAuto,
            totalScore,
            recoveryScore: currentRecovery,
            finalScore,
            status: targetStatus,
          },
          reason: 'Actualización individual de calificación',
        },
      });

      return grade;
    });

    if (
      savedGrade.finalScore !== null &&
      savedGrade.finalScore < 51 &&
      savedGrade.status === 'PUBLISHED'
    ) {
      await this.safeSendGradeAlert(
        data.enrollmentId,
        assignment.subject.name,
        savedGrade.finalScore,
      );
    }

    return savedGrade;
  }

  // ==========================================
  // PILAR 4: INSERCIÓN MASIVA BLINDADA
  // ==========================================
  async updateBulkGrades(
    data: {
      teacherAssignmentId: string;
      trimesterId: string;
      grades: UpsertGradeDto[];
    },
    user: AuthenticatedUser,
  ) {
    const trimester = await this.prisma.trimester.findUnique({
      where: { id: data.trimesterId },
    });

    if (!trimester) throw new NotFoundException('Trimestre no encontrado');
    if (!trimester.isOpen) {
      throw new ForbiddenException(
        'El trimestre actual se encuentra cerrado. Comuníquese con Dirección para solicitar una corrección.',
      );
    }

    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id: data.teacherAssignmentId },
      include: { subject: true },
    });
    if (!assignment)
      throw new NotFoundException('Asignación docente no encontrada');

    // Validación ABAC de propiedad
    this.verifyAssignmentOwnership(assignment, user);

    // Validación estricta de pertenencia y estado de los estudiantes
    const validEnrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId: assignment.classroomId,
        status: { in: ['INSCRITO', 'OBSERVADO'] },
        id: { in: data.grades.map((g) => g.enrollmentId) },
      },
      select: { id: true },
    });

    const validEnrollmentIds = new Set(validEnrollments.map((e) => e.id));
    const filteredGrades = data.grades.filter((g) =>
      validEnrollmentIds.has(g.enrollmentId),
    );

    if (filteredGrades.length === 0) {
      return {
        message: 'No se encontraron estudiantes válidos para calificar.',
        updatedCount: 0,
      };
    }

    let updatedCount = 0;
    const failingGradesToNotify: Array<{
      enrollmentId: string;
      finalScore: number;
    }> = [];

    // Transacción masiva con auditoría
    await this.prisma.$transaction(async (tx) => {
      const enrollmentIds = filteredGrades.map((g) => g.enrollmentId);
      const existingGrades = await tx.grade.findMany({
        where: {
          teacherAssignmentId: data.teacherAssignmentId,
          trimesterId: data.trimesterId,
          enrollmentId: { in: enrollmentIds },
        },
      });
      const gradeMap = new Map(existingGrades.map((g) => [g.enrollmentId, g]));

      for (const gradeItem of filteredGrades) {
        const existingGrade = gradeMap.get(gradeItem.enrollmentId);

        const currentSer =
          gradeItem.scoreSer !== undefined
            ? gradeItem.scoreSer
            : (existingGrade?.scoreSer ?? null);
        const currentSaber =
          gradeItem.scoreSaber !== undefined
            ? gradeItem.scoreSaber
            : (existingGrade?.scoreSaber ?? null);
        const currentHacer =
          gradeItem.scoreHacer !== undefined
            ? gradeItem.scoreHacer
            : (existingGrade?.scoreHacer ?? null);
        const currentAuto =
          gradeItem.scoreAuto !== undefined
            ? gradeItem.scoreAuto
            : (existingGrade?.scoreAuto ?? null);
        const initialRecovery =
          gradeItem.recoveryScore !== undefined
            ? gradeItem.recoveryScore
            : (existingGrade?.recoveryScore ?? null);

        const {
          totalScore,
          finalScore,
          recoveryScore: currentRecovery,
        } = this.calculateGradeScores(
          currentSer,
          currentSaber,
          currentHacer,
          currentAuto,
          initialRecovery,
        );

        const targetStatus = gradeItem.status || existingGrade?.status || 'DRAFT';

        const savedGrade = await tx.grade.upsert({
          where: {
            enrollmentId_teacherAssignmentId_trimesterId: {
              enrollmentId: gradeItem.enrollmentId,
              teacherAssignmentId: data.teacherAssignmentId,
              trimesterId: data.trimesterId,
            },
          },
          update: {
            scoreSer: currentSer,
            scoreSaber: currentSaber,
            scoreHacer: currentHacer,
            scoreAuto: currentAuto,
            totalScore,
            recoveryScore: currentRecovery,
            finalScore,
            status: targetStatus,
            lastModifiedById: user.userId,
          },
          create: {
            enrollmentId: gradeItem.enrollmentId,
            teacherAssignmentId: data.teacherAssignmentId,
            trimesterId: data.trimesterId,
            scoreSer: currentSer,
            scoreSaber: currentSaber,
            scoreHacer: currentHacer,
            scoreAuto: currentAuto,
            totalScore,
            recoveryScore: currentRecovery,
            finalScore,
            status: targetStatus,
            lastModifiedById: user.userId,
          },
        });

        await tx.gradeAudit.create({
          data: {
            gradeId: savedGrade.id,
            changedById: user.userId,
            action: 'BULK_UPDATE',
            oldScores: existingGrade
              ? {
                  scoreSer: existingGrade.scoreSer,
                  scoreSaber: existingGrade.scoreSaber,
                  scoreHacer: existingGrade.scoreHacer,
                  scoreAuto: existingGrade.scoreAuto,
                  totalScore: existingGrade.totalScore,
                  recoveryScore: existingGrade.recoveryScore,
                  finalScore: existingGrade.finalScore,
                  status: existingGrade.status,
                }
              : Prisma.DbNull,
            newScores: {
              scoreSer: currentSer,
              scoreSaber: currentSaber,
              scoreHacer: currentHacer,
              scoreAuto: currentAuto,
              totalScore,
              recoveryScore: currentRecovery,
              finalScore,
              status: targetStatus,
            },
            reason: 'Guardado masivo de planilla de calificaciones',
          },
        });

        if (
          savedGrade.finalScore !== null &&
          savedGrade.finalScore < 51 &&
          savedGrade.status === 'PUBLISHED'
        ) {
          failingGradesToNotify.push({
            enrollmentId: gradeItem.enrollmentId,
            finalScore: savedGrade.finalScore,
          });
        }

        updatedCount++;
      }
    });

    // Disparar alertas Push a los padres de alumnos reprobados en background de forma no bloqueante
    if (failingGradesToNotify.length > 0) {
      for (const item of failingGradesToNotify) {
        await this.safeSendGradeAlert(
          item.enrollmentId,
          assignment.subject.name,
          item.finalScore,
        );
      }
    }

    return {
      message: `Se guardaron las calificaciones de ${updatedCount} estudiantes.`,
      updatedCount,
    };
  }

  // OBTENER LA PLANILLA
  async getGradesByAssignment(
    teacherAssignmentId: string,
    trimesterId: string,
    user: AuthenticatedUser,
  ) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id: teacherAssignmentId },
      include: { classroom: true, subject: true },
    });

    if (!assignment) throw new NotFoundException('Asignación no encontrada');

    this.verifyAssignmentOwnership(assignment, user);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId: assignment.classroomId,
        status: { in: ['INSCRITO', 'OBSERVADO'] },
      },
      include: {
        student: {
          select: {
            id: true,
            names: true,
            lastNamePaterno: true,
            lastNameMaterno: true,
            ci: true,
          },
        },
        grades: {
          where: { teacherAssignmentId, trimesterId },
        },
      },
      orderBy: [
        { student: { lastNamePaterno: 'asc' } },
        { student: { names: 'asc' } },
      ],
    });

    return enrollments.map((e) => ({
      enrollmentId: e.id,
      student: e.student,
      grade: e.grades.length > 0 ? e.grades[0] : null,
    }));
  }

  // ==========================================
  // PILAR 2: CHANGE REQUESTS (DESCONGELAMIENTO)
  // ==========================================

  async createChangeRequest(
    data: CreateChangeRequestDto,
    user: AuthenticatedUser,
  ) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: data.gradeId },
      include: { teacherAssignment: true },
    });

    if (!grade)
      throw new NotFoundException('Calificación original no encontrada');

    this.verifyAssignmentOwnership(grade.teacherAssignment, user);

    // Evitar solicitudes duplicadas pendientes
    const existingPending = await this.prisma.gradeChangeRequest.findFirst({
      where: { gradeId: data.gradeId, status: 'PENDING' },
    });

    if (existingPending) {
      throw new ForbiddenException(
        'Ya existe una solicitud de corrección pendiente para esta calificación.',
      );
    }

    return await this.prisma.gradeChangeRequest.create({
      data: {
        gradeId: data.gradeId,
        requestedById: user.userId,
        reason: data.reason,
        proposedSer: data.proposedSer,
        proposedSaber: data.proposedSaber,
        proposedHacer: data.proposedHacer,
        proposedAuto: data.proposedAuto,
        proposedRecovery: data.proposedRecovery,
        status: 'PENDING',
      },
    });
  }

  async getPendingRequests() {
    return await this.prisma.gradeChangeRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        grade: {
          include: {
            enrollment: { include: { student: true } },
            teacherAssignment: { include: { subject: true, teacher: true } },
            trimester: true,
          },
        },
      },
      orderBy: { grade: { trimester: { startDate: 'desc' } } },
    });
  }

  async resolveChangeRequest(
    requestId: string,
    data: ResolveChangeRequestDto,
    user: AuthenticatedUser,
  ) {
    const request = await this.prisma.gradeChangeRequest.findUnique({
      where: { id: requestId },
      include: {
        grade: {
          include: {
            teacherAssignment: { include: { subject: true } },
          },
        },
      },
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.status !== 'PENDING')
      throw new ForbiddenException('Esta solicitud ya fue resuelta');

    return await this.prisma.$transaction(async (tx) => {
      const resolvedReq = await tx.gradeChangeRequest.update({
        where: { id: requestId },
        data: {
          status: data.status,
          approvedById: user.userId,
          resolvedAt: new Date(),
          rejectionReason: data.status === 'REJECTED' ? data.rejectionReason : null,
        },
      });

      if (data.status === 'APPROVED') {
        const { grade } = request;

        const newSer = request.proposedSer ?? grade.scoreSer;
        const newSaber = request.proposedSaber ?? grade.scoreSaber;
        const newHacer = request.proposedHacer ?? grade.scoreHacer;
        const newAuto = request.proposedAuto ?? grade.scoreAuto;
        const newRecovery =
          request.proposedRecovery !== null &&
          request.proposedRecovery !== undefined
            ? request.proposedRecovery
            : grade.recoveryScore;

        const { totalScore, finalScore, recoveryScore } =
          this.calculateGradeScores(
            newSer,
            newSaber,
            newHacer,
            newAuto,
            newRecovery,
          );

        await tx.grade.update({
          where: { id: grade.id },
          data: {
            scoreSer: newSer,
            scoreSaber: newSaber,
            scoreHacer: newHacer,
            scoreAuto: newAuto,
            totalScore,
            recoveryScore,
            finalScore,
            lastModifiedById: user.userId,
            status: 'PUBLISHED',
          },
        });

        await tx.gradeAudit.create({
          data: {
            gradeId: grade.id,
            changedById: user.userId,
            action: 'CHANGE_REQUEST_APPROVED',
            oldScores: {
              scoreSer: grade.scoreSer,
              scoreSaber: grade.scoreSaber,
              scoreHacer: grade.scoreHacer,
              scoreAuto: grade.scoreAuto,
              totalScore: grade.totalScore,
              recoveryScore: grade.recoveryScore,
              finalScore: grade.finalScore,
              status: grade.status,
            },
            newScores: {
              scoreSer: newSer,
              scoreSaber: newSaber,
              scoreHacer: newHacer,
              scoreAuto: newAuto,
              totalScore,
              recoveryScore,
              finalScore,
              status: 'PUBLISHED',
            },
            reason: `Aprobado por Dirección. Motivo original: ${request.reason}`,
          },
        });

        if (finalScore !== null && finalScore < 51) {
          await this.safeSendGradeAlert(
            grade.enrollmentId,
            grade.teacherAssignment.subject.name,
            finalScore,
          );
        }
      }

      return resolvedReq;
    });
  }

  // ==========================================
  // PILAR 5: ENDPOINTS DE CONSULTA PARA ESTUDIANTES Y PADRES (PORTAL / MOBILE)
  // ==========================================

  /**
   * Obtiene el boletín de calificaciones del estudiante autenticado
   */
  async getMyGrades(user: AuthenticatedUser) {
    const student = await this.prisma.student.findFirst({
      where: { user: { id: user.userId } },
    });

    if (!student) {
      throw new NotFoundException(
        'No se encontró un registro de estudiante vinculado a tu usuario.',
      );
    }

    return this.buildStudentGradesReport(student.id);
  }

  /**
   * Obtiene el boletín de calificaciones de un estudiante tutorado por el padre
   */
  async getStudentGradesForGuardian(studentId: string, user: AuthenticatedUser) {
    const permissions = user.permissions || [];
    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.READ_ALL_GRADE);

    if (!isPowerUser) {
      const guardian = await this.prisma.guardian.findFirst({
        where: { user: { id: user.userId } },
      });

      if (!guardian) {
        throw new ForbiddenException(
          'No tienes perfil de tutor ni permisos administrativos para consultar calificaciones.',
        );
      }

      const relation = await this.prisma.studentGuardian.findUnique({
        where: {
          studentId_guardianId: {
            studentId,
            guardianId: guardian.id,
          },
        },
      });

      if (!relation) {
        throw new ForbiddenException(
          'No tienes vinculación familiar registrada con este estudiante.',
        );
      }
    }

    return this.buildStudentGradesReport(studentId);
  }

  /**
   * Generador estructurado del reporte de calificaciones
   */
  private async buildStudentGradesReport(studentId: string) {
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        trimesters: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!activeYear) {
      throw new NotFoundException('No hay una gestión escolar activa en curso.');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        academicYearId: activeYear.id,
        status: { in: ['INSCRITO', 'OBSERVADO'] },
      },
      include: {
        student: true,
        classroom: {
          include: {
            subjectAssignments: {
              include: {
                subject: true,
                teacher: { select: { id: true, fullName: true } },
              },
            },
          },
        },
        grades: {
          where: {
            status: { in: ['PUBLISHED', 'LOCKED'] },
          },
          include: {
            trimester: true,
            teacherAssignment: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'El estudiante no tiene una inscripción activa en la gestión actual.',
      );
    }

    const trimesters = activeYear.trimesters.map((t) => ({
      id: t.id,
      name: t.name,
      order: t.order,
      isOpen: t.isOpen,
    }));

    // Agrupar materias asignadas al curso
    const subjectsMap = new Map<
      string,
      {
        assignmentId: string;
        subjectId: string;
        subjectName: string;
        area: string | null;
        teacherName: string;
        trimesterGrades: Record<
          string,
          {
            scoreSer: number | null;
            scoreSaber: number | null;
            scoreHacer: number | null;
            scoreAuto: number | null;
            totalScore: number | null;
            recoveryScore: number | null;
            finalScore: number | null;
          }
        >;
      }
    >();

    for (const assignment of enrollment.classroom.subjectAssignments) {
      subjectsMap.set(assignment.id, {
        assignmentId: assignment.id,
        subjectId: assignment.subject.id,
        subjectName: assignment.subject.name,
        area: assignment.subject.area,
        teacherName: assignment.teacher.fullName,
        trimesterGrades: {},
      });
    }

    for (const grade of enrollment.grades) {
      const subjectEntry = subjectsMap.get(grade.teacherAssignmentId);
      if (subjectEntry) {
        subjectEntry.trimesterGrades[grade.trimester.id] = {
          scoreSer: grade.scoreSer,
          scoreSaber: grade.scoreSaber,
          scoreHacer: grade.scoreHacer,
          scoreAuto: grade.scoreAuto,
          totalScore: grade.totalScore,
          recoveryScore: grade.recoveryScore,
          finalScore: grade.finalScore,
        };
      }
    }

    return {
      academicYear: {
        id: activeYear.id,
        year: activeYear.year,
        name: activeYear.name,
      },
      student: {
        id: enrollment.student.id,
        names: enrollment.student.names,
        lastNamePaterno: enrollment.student.lastNamePaterno,
        lastNameMaterno: enrollment.student.lastNameMaterno,
        rudeCode: enrollment.student.rudeCode,
      },
      classroom: {
        id: enrollment.classroom.id,
        grade: enrollment.classroom.grade,
        section: enrollment.classroom.section,
        level: enrollment.classroom.level,
        shift: enrollment.classroom.shift,
      },
      trimesters,
      subjects: Array.from(subjectsMap.values()),
    };
  }
}
