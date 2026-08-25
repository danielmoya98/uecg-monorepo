import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityService } from '../identity/identity.service';
import {
  AttendanceStatus,
  AttendanceMethod,
} from '../../prisma/generated/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SystemPermissions } from '../auth/constants/permissions.constant'; // 🔥 Tu Enum Oficial
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { CreateJustificationRangeDto } from './dto/create-justification-range.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';

import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private identityService: IdentityService,
    private eventEmitter: EventEmitter2, // 🔥 Reemplaza a FirebaseService
    private institutionConfig: InstitutionConfigService, // 🔥 Inyección Unificada
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // 🔥 Para evitar saturar la BD
  ) {}

  // ==========================================
  // HELPER: FECHAS SEGURAS (TIMEZONE FIX)
  // ==========================================
  // Resuelve el bug de UTC donde a las 20:00 hrs de Bolivia ya marcaba como el día siguiente
  private getSafeLocalDate(dateInput: Date | string): Date {
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  // ==========================================
  // HELPER: REGLAS DE INSTITUCIÓN (DESDE SERVICIO CENTRAL)
  // ==========================================
  private async getInstitutionRules() {
    const institution = await this.institutionConfig.getOrNull();
    if (!institution) {
      throw new InternalServerErrorException(
        'Reglas de la institución no configuradas.',
      );
    }
    return institution;
  }

  // ==========================================
  // HELPER: VALIDAR SI HAY CLASES HOY
  // ==========================================
  private async ensureActiveTrimesterExists() {
    const activeTrimester = await this.prisma.trimester.findFirst({
      where: {
        isOpen: true,
        academicYear: { status: 'ACTIVE' },
      },
    });
    if (!activeTrimester) {
      throw new BadRequestException(
        'El sistema de asistencia está bloqueado. No hay ningún trimestre abierto actualmente.',
      );
    }
    return activeTrimester;
  }

  // ==========================================
  // 🔥 HELPER: ABAC - VERIFICAR PROPIEDAD DEL CURSO
  // ==========================================
  private async verifyTeacherClassroomAccess(
    user: AuthenticatedUser,
    classroomId: string,
  ) {
    const permissions = user.permissions || [];

    // 🔥 Usando el Enum Oficial
    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.READ_ALL_ATTENDANCE) ||
      permissions.includes(SystemPermissions.MANAGE_ALL_ATTENDANCE);

    if (isPowerUser) return;

    const isAssigned = await this.prisma.teacherAssignment.findFirst({
      where: { classroomId: classroomId, teacherId: user.userId },
    });

    if (!isAssigned) {
      throw new ForbiddenException(
        'Privacidad: No tienes carga horaria asignada a este curso. Acceso denegado.',
      );
    }
  }

  // ==========================================
  // 👨‍🏫 RUTAS DEL DOCENTE (MAGIA DE BLOQUES)
  // ==========================================
  async getDailySchedule(date: string, user: AuthenticatedUser) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // getDay() usa la hora local, getUTCDay() era frágil

    const permissions = user.permissions || [];
    const isPowerUser =
      permissions.includes(SystemPermissions.MANAGE_ALL) ||
      permissions.includes(SystemPermissions.READ_ALL_ATTENDANCE) ||
      permissions.includes(SystemPermissions.MANAGE_ALL_ATTENDANCE);

    const slots = await this.prisma.scheduleSlot.findMany({
      where: {
        dayOfWeek: dayOfWeek,
        ...(isPowerUser
          ? {}
          : { teacherAssignment: { teacherId: user.userId } }),
      },
      include: {
        classPeriod: true,
        classroom: true,
        teacherAssignment: { include: { subject: true, teacher: true } },
        physicalSpace: true,
      },
    });

    const groupedByAssignment: Record<string, any[]> = {};
    for (const slot of slots) {
      const key = `${slot.teacherAssignmentId}_${slot.classroomId}`;
      if (!groupedByAssignment[key]) {
        groupedByAssignment[key] = [];
      }
      groupedByAssignment[key].push(slot);
    }

    const blocks: any[] = [];
    for (const key in groupedByAssignment) {
      const assignmentSlots = groupedByAssignment[key];
      assignmentSlots.sort((a, b) =>
        a.classPeriod.startTime.localeCompare(b.classPeriod.startTime),
      );

      let currentBlock: any = null;
      for (const slot of assignmentSlots) {
        if (!currentBlock) {
          currentBlock = {
            id: `block_${slot.id}`,
            classroomId: slot.classroomId,
            classroom: slot.classroom,
            subjectName: slot.teacherAssignment.subject.name,
            teacherName: slot.teacherAssignment.teacher.fullName,
            teacherAssignmentId: slot.teacherAssignmentId,
            startTime: slot.classPeriod.startTime,
            endTime: slot.classPeriod.endTime,
            classPeriodIds: [slot.classPeriodId],
            periodNames: [slot.classPeriod.name],
          };
        } else {
          currentBlock.endTime = slot.classPeriod.endTime;
          currentBlock.classPeriodIds.push(slot.classPeriodId);
          currentBlock.periodNames.push(slot.classPeriod.name);
        }
      }
      if (currentBlock) blocks.push(currentBlock);
    }

    blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return blocks;
  }

  async getClassroomAttendance(
    classroomId: string,
    classPeriodId: string,
    date: string,
    user: AuthenticatedUser,
  ) {
    await this.verifyTeacherClassroomAccess(user, classroomId);

    const dateOnly = this.getSafeLocalDate(date);

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classroomId, status: 'INSCRITO' },
      include: { student: true },
      orderBy: [
        { student: { lastNamePaterno: 'asc' } },
        { student: { names: 'asc' } },
      ],
    });

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        classPeriodId,
        date: dateOnly,
        enrollmentId: { in: enrollments.map((e) => e.id) },
      },
    });

    return enrollments.map((enrollment) => {
      const record = records.find((r) => r.enrollmentId === enrollment.id);
      return {
        enrollmentId: enrollment.id,
        student: enrollment.student,
        record: record || null,
      };
    });
  }

  // ==========================================
  // 🔥 GUARDADO MASIVO (MÚLTIPLES PERIODOS A LA VEZ)
  // ==========================================
  async saveBulkAttendance(
    bulkData: BulkAttendanceDto,
    user: AuthenticatedUser,
  ) {
    await this.ensureActiveTrimesterExists();
    await this.verifyTeacherClassroomAccess(user, bulkData.classroomId);

    const dateOnly = this.getSafeLocalDate(bulkData.date);
    const now = new Date();

    // Obtenemos las reglas cacheadas
    const institution = await this.getInstitutionRules();

    const periodIds: string[] =
      bulkData.classPeriodIds ||
      (bulkData.classPeriodId ? [bulkData.classPeriodId] : []);
    const upsertOperations: any[] = [];

    for (const record of bulkData.records) {
      for (const periodId of periodIds) {
        upsertOperations.push(
          this.prisma.attendanceRecord.upsert({
            where: {
              enrollmentId_classPeriodId_date: {
                enrollmentId: record.enrollmentId,
                classPeriodId: periodId,
                date: dateOnly,
              },
            },
            update: {
              status: record.status,
              method: AttendanceMethod.MANUAL,
              markedById: user.userId,
              timestamp: now,
            },
            create: {
              enrollmentId: record.enrollmentId,
              classPeriodId: periodId,
              date: dateOnly,
              status: record.status,
              method: AttendanceMethod.MANUAL,
              markedById: user.userId,
              timestamp: now,
            },
          }),
        );
      }
    }

    await this.prisma.$transaction(upsertOperations);

    // 🔥 Emitimos el evento en lugar de procesar síncronamente
    this.eventEmitter.emit('attendance.bulk.registered', {
      records: bulkData.records,
      institutionRules: institution,
      timestamp: now,
    });

    return {
      message: 'Asistencia guardada con éxito',
      count: bulkData.records.length,
    };
  }

  // ==========================================
  // REGISTRO QR
  // ==========================================
  async registerScan(dto: RegisterAttendanceDto, user: AuthenticatedUser) {
    await this.ensureActiveTrimesterExists();

    const institution = await this.getInstitutionRules();

    if (
      !institution.enableQrAttendance &&
      (!dto.method || dto.method === AttendanceMethod.QR)
    ) {
      throw new ForbiddenException(
        'El marcado de asistencia por código QR está deshabilitado.',
      );
    }

    const studentId = await this.identityService.validateQrToken(dto.qrToken);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        status: 'INSCRITO',
        academicYear: { status: 'ACTIVE' },
      },
      include: { student: true },
    });

    if (!enrollment)
      throw new BadRequestException(
        'El estudiante no tiene una inscripción activa.',
      );

    await this.verifyTeacherClassroomAccess(user, enrollment.classroomId);

    const periodIds: string[] =
      dto.classPeriodIds || (dto.classPeriodId ? [dto.classPeriodId] : []);
    const firstPeriod = await this.prisma.classPeriod.findUnique({
      where: { id: periodIds[0] },
    });

    if (!firstPeriod)
      throw new NotFoundException('Periodo de clase no encontrado.');

    const status = this.calculateAttendanceStatus(
      firstPeriod.startTime,
      institution.lateToleranceMinutes,
      institution.absentToleranceMinutes,
    );

    const now = new Date();
    const dateOnly = this.getSafeLocalDate(now);

    try {
      await this.prisma.$transaction(
        periodIds.map((pId) =>
          this.prisma.attendanceRecord.create({
            data: {
              enrollmentId: enrollment.id,
              classPeriodId: pId,
              date: dateOnly,
              status: status,
              method: dto.method || AttendanceMethod.QR,
              timestamp: now,
              markedById: user.userId,
            },
          }),
        ),
      );

      // 🔥 Disparamos el evento para encolar la notificación Push
      this.eventEmitter.emit('attendance.qr.scanned', {
        enrollmentId: enrollment.id,
        status: status,
        timestamp: now,
        institutionRules: institution,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        this.logger.warn(
          `Escaneo duplicado ignorado para ${enrollment.student.names}`,
        );
        return this.buildScannerResponse(
          enrollment.student,
          status,
          'Ya Registrado en este Bloque',
        );
      }
      throw error;
    }

    return this.buildScannerResponse(
      enrollment.student,
      status,
      'Asistencia Exitosa',
    );
  }

  // ==========================================
  // 🔥 MONITOR EN VIVO
  // ==========================================
  async getDailyMonitor(
    dto: { classroomId: string; classPeriodId: string; date?: string },
    user: AuthenticatedUser,
  ) {
    await this.verifyTeacherClassroomAccess(user, dto.classroomId);

    const dateOnly = dto.date
      ? this.getSafeLocalDate(dto.date)
      : this.getSafeLocalDate(new Date());

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classroomId: dto.classroomId, status: 'INSCRITO' },
      include: { student: true },
    });

    if (enrollments.length === 0) {
      return {
        data: [],
        summary: { total: 0, present: 0, late: 0, absent: 0, pending: 0 },
        message: 'No hay alumnos inscritos en este curso.',
      };
    }

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        classPeriodId: dto.classPeriodId,
        date: dateOnly,
        enrollmentId: { in: enrollments.map((e) => e.id) },
      },
    });

    const monitorData = enrollments.map((enrollment) => {
      const record = attendanceRecords.find(
        (r) => r.enrollmentId === enrollment.id,
      );
      const firstName = enrollment.student.names.split(' ')[0];
      const lastName = enrollment.student.lastNamePaterno || '';

      return {
        enrollmentId: enrollment.id,
        studentId: enrollment.student.id,
        fullName:
          `${lastName} ${enrollment.student.lastNameMaterno || ''} ${firstName}`.trim(),
        status: record ? record.status : 'PENDING',
        method: record ? record.method : null,
        timestamp: record ? record.timestamp : null,
      };
    });

    monitorData.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return {
      data: monitorData,
      summary: {
        total: monitorData.length,
        present: monitorData.filter(
          (m) => m.status === AttendanceStatus.PRESENT,
        ).length,
        late: monitorData.filter((m) => m.status === AttendanceStatus.LATE)
          .length,
        absent: monitorData.filter((m) => m.status === AttendanceStatus.ABSENT)
          .length,
        pending: monitorData.filter((m) => m.status === 'PENDING').length,
      },
    };
  }

  // ==========================================
  // 🛠️ EL PLAN B: MARCADO MANUAL
  // ==========================================
  async markManualAttendance(
    dto: ManualAttendanceDto,
    user: AuthenticatedUser,
  ) {
    await this.ensureActiveTrimesterExists();

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');

    await this.verifyTeacherClassroomAccess(user, enrollment.classroomId);

    const now = new Date();
    const dateOnly = this.getSafeLocalDate(now);
    const institution = await this.getInstitutionRules();

    const periodIds: string[] =
      dto.classPeriodIds || (dto.classPeriodId ? [dto.classPeriodId] : []);

    const upsertOperations = periodIds.map((pId) =>
      this.prisma.attendanceRecord.upsert({
        where: {
          enrollmentId_classPeriodId_date: {
            enrollmentId: dto.enrollmentId,
            classPeriodId: pId,
            date: dateOnly,
          },
        },
        update: {
          status: dto.status,
          method: AttendanceMethod.MANUAL,
          markedById: user.userId,
          timestamp: now,
        },
        create: {
          enrollmentId: dto.enrollmentId,
          classPeriodId: pId,
          date: dateOnly,
          status: dto.status,
          method: AttendanceMethod.MANUAL,
          markedById: user.userId,
          timestamp: now,
        },
      }),
    );

    const records = await this.prisma.$transaction(upsertOperations);

    // 🔥 Evento asíncrono
    this.eventEmitter.emit('attendance.manual.registered', {
      enrollmentId: dto.enrollmentId,
      status: dto.status,
      timestamp: now,
      institutionRules: institution,
    });

    return {
      data: records[0],
      message: `Asistencia marcada como ${dto.status} en el bloque`,
    };
  }

  // ==========================================
  // 🏥 MÓDULO DE LICENCIAS Y JUSTIFICACIONES
  // ==========================================
  async getStudentAttendanceHistory(
    enrollmentId: string,
    _user: AuthenticatedUser,
  ) {
    return this.prisma.attendanceRecord.findMany({
      where: {
        enrollmentId,
        status: { in: [AttendanceStatus.ABSENT, AttendanceStatus.LATE] },
      },
      include: { classPeriod: { select: { name: true, startTime: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async justifyAttendance(
    recordId: string,
    justification: string,
    user: AuthenticatedUser,
  ) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    });
    if (!record)
      throw new NotFoundException('El registro de asistencia no existe.');

    // Validar permisos usando el Enum Oficial
    const isPowerUser =
      user.permissions?.includes(SystemPermissions.MANAGE_ALL) ||
      user.permissions?.includes(SystemPermissions.MANAGE_ALL_ATTENDANCE);

    if (!isPowerUser) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para justificar faltas.',
      );
    }

    return this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        status: AttendanceStatus.EXCUSED,
        justification: justification,
        markedById: user.userId,
        method: AttendanceMethod.MANUAL,
        updatedAt: new Date(),
      },
    });
  }

  async createJustificationRange(
    dto: CreateJustificationRangeDto,
    user: AuthenticatedUser,
  ) {
    const isPowerUser =
      user.permissions?.includes(SystemPermissions.MANAGE_ALL) ||
      user.permissions?.includes(SystemPermissions.MANAGE_ALL_ATTENDANCE);

    if (!isPowerUser) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para registrar licencias/justificaciones.',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: { student: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscripción de estudiante no encontrada.');
    }

    const startDate = this.getSafeLocalDate(dto.startDate);
    const endDate = this.getSafeLocalDate(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha final.',
      );
    }

    // 1. Crear el registro maestro de justificación
    const justification = await this.prisma.attendanceJustification.create({
      data: {
        enrollmentId: dto.enrollmentId,
        startDate: startDate,
        endDate: endDate,
        reason: dto.reason,
        documentUrl: dto.documentUrl,
        status: 'APPROVED',
        approvedById: user.userId,
      },
    });

    // 2. Actualizar en lote todos los AttendanceRecords existentes en ese rango a EXCUSED
    const updateResult = await this.prisma.attendanceRecord.updateMany({
      where: {
        enrollmentId: dto.enrollmentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        status: AttendanceStatus.EXCUSED,
        justification: `Licencia: ${dto.reason}`,
        markedById: user.userId,
        method: AttendanceMethod.MANUAL,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Licencia registrada exitosamente.',
      data: justification,
      updatedRecordsCount: updateResult.count,
    };
  }

  async getStudentJustifications(
    enrollmentId: string,
    _user: AuthenticatedUser,
  ) {
    return this.prisma.attendanceJustification.findMany({
      where: { enrollmentId },
      include: {
        approvedBy: {
          select: {
            id: true,
            fullName: true,
            role: { select: { name: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  // ==========================================
  // 🗓️ GESTIÓN DE FERIADOS Y DÍAS NO LECTIVOS
  // ==========================================
  async createHoliday(dto: CreateHolidayDto, user: AuthenticatedUser) {
    const isPowerUser =
      user.permissions?.includes(SystemPermissions.MANAGE_ALL) ||
      user.permissions?.includes(SystemPermissions.MANAGE_ALL_ATTENDANCE);

    if (!isPowerUser) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para registrar feriados o asuetos escolares.',
      );
    }

    const dateOnly = this.getSafeLocalDate(dto.date);

    return this.prisma.holiday.create({
      data: {
        name: dto.name,
        date: dateOnly,
        academicYearId: dto.academicYearId,
        isRecurring: dto.isRecurring ?? false,
      },
    });
  }

  async getHolidays(academicYearId?: string) {
    return this.prisma.holiday.findMany({
      where: academicYearId ? { academicYearId } : {},
      orderBy: { date: 'asc' },
    });
  }

  // ==========================================
  // FUNCIONES PRIVADAS DE CÁLCULO
  // ==========================================
  private calculateAttendanceStatus(
    startTimeStr: string,
    lateTol: number,
    absentTol: number,
  ): AttendanceStatus {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const startTotalMinutes = startH * 60 + startM;
    const diffMinutes = currentMinutes - startTotalMinutes;

    if (diffMinutes > absentTol) return AttendanceStatus.ABSENT;
    if (diffMinutes > lateTol) return AttendanceStatus.LATE;
    return AttendanceStatus.PRESENT;
  }

  private buildScannerResponse(
    student: any,
    status: AttendanceStatus,
    message: string,
  ) {
    const firstName = student.names.split(' ')[0];
    const lastName = student.lastNamePaterno || '';
    return {
      success: true,
      message,
      data: {
        studentName: `${firstName} ${lastName}`.trim(),
        status,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
