import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttendanceStatus,
  AttendanceMethod,
  Shift,
} from '../../prisma/generated/client';

@Injectable()
export class AttendanceCronService {
  private readonly logger = new Logger(AttendanceCronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 14 * * 1-5')
  async handleMorningClosing() {
    await this.processAttendanceClosing(Shift.MANANA);
  }

  @Cron('0 20 * * 1-5')
  async handleAfternoonClosing() {
    await this.processAttendanceClosing(Shift.TARDE);
  }

  /**
   * Obtiene la fecha exacta a las 00:00:00Z en zona horaria America/La_Paz (UTC-4)
   */
  private getSafeBoliviaDate(dateInput: Date = new Date()): Date {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formatted = formatter.format(dateInput); // YYYY-MM-DD
    return new Date(`${formatted}T00:00:00.000Z`);
  }

  private async processAttendanceClosing(shift: Shift) {
    // 🔥 1. SALVAVIDAS: Verificar si hay un trimestre abierto hoy
    const activeTrimester = await this.prisma.trimester.findFirst({
      where: {
        isOpen: true,
        academicYear: { status: 'ACTIVE' },
      },
    });

    if (!activeTrimester) {
      this.logger.log(
        `[CRON ${shift}] Cancelado. No hay trimestres abiertos (Posibles vacaciones).`,
      );
      return; // Cortamos la ejecución, salvando miles de registros falsos.
    }

    const dateOnly = this.getSafeBoliviaDate(new Date());

    // 🔥 2. SALVAVIDAS: Verificar si hoy es feriado o día no lectivo
    const holiday = await this.prisma.holiday.findFirst({
      where: {
        date: dateOnly,
        OR: [
          { academicYearId: activeTrimester.academicYearId },
          { academicYearId: null },
        ],
      },
    });

    if (holiday) {
      this.logger.log(
        `[CRON ${shift}] Cancelado. Hoy es feriado o asueto escolar: ${holiday.name}.`,
      );
      return;
    }

    try {
      const activeEnrollments = await this.prisma.enrollment.findMany({
        where: {
          status: 'INSCRITO',
          academicYear: { status: 'ACTIVE' },
          classroom: { shift: shift },
        },
        select: { id: true },
      });

      if (activeEnrollments.length === 0) return;

      const firstPeriod = await this.prisma.classPeriod.findFirst({
        where: { shift: shift, isBreak: false },
        orderBy: { order: 'asc' },
      });

      if (!firstPeriod) return;

      const existingRecords = await this.prisma.attendanceRecord.findMany({
        where: { date: dateOnly, classPeriodId: firstPeriod.id },
        select: { enrollmentId: true },
      });

      const presentEnrollmentIds = new Set(
        existingRecords.map((r) => r.enrollmentId),
      );
      const absentEnrollments = activeEnrollments.filter(
        (e) => !presentEnrollmentIds.has(e.id),
      );

      if (absentEnrollments.length === 0) return;

      // 🔥 3. Buscar licencias/justificaciones aprobadas vigentes para hoy
      const activeJustifications =
        await this.prisma.attendanceJustification.findMany({
          where: {
            status: 'APPROVED',
            enrollmentId: { in: absentEnrollments.map((e) => e.id) },
            startDate: { lte: dateOnly },
            endDate: { gte: dateOnly },
          },
          select: { enrollmentId: true, reason: true },
        });

      const justifiedMap = new Map(
        activeJustifications.map((j) => [j.enrollmentId, j.reason]),
      );

      const missingRecordsData = absentEnrollments.map((enrollment) => {
        const justificationReason = justifiedMap.get(enrollment.id);
        const isJustified = !!justificationReason;

        return {
          enrollmentId: enrollment.id,
          classPeriodId: firstPeriod.id,
          date: dateOnly,
          status: isJustified
            ? AttendanceStatus.EXCUSED
            : AttendanceStatus.ABSENT,
          method: AttendanceMethod.SYSTEM_AUTO,
          justification: isJustified
            ? `Licencia aprobada: ${justificationReason}`
            : null,
          timestamp: new Date(),
          markedById: null,
        };
      });

      const result = await this.prisma.attendanceRecord.createMany({
        data: missingRecordsData,
        skipDuplicates: true,
      });

      this.logger.log(
        `Cierre completado (${shift}): ${result.count} registros automáticos procesados.`,
      );
    } catch (error) {
      this.logger.error(
        `Error durante el cierre de asistencia (${shift})`,
        error,
      );
    }
  }
}
