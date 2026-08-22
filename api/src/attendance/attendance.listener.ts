import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AttendanceStatus,
  NotificationFrequency,
} from '../../prisma/generated/client';

@Injectable()
export class AttendanceListener {
  private readonly logger = new Logger(AttendanceListener.name);

  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  @OnEvent('attendance.qr.scanned', { async: true })
  @OnEvent('attendance.manual.registered', { async: true })
  async handleSingleAttendance(payload: any) {
    try {
      await this.processSmartNotification(
        payload.enrollmentId,
        payload.status,
        payload.timestamp,
        payload.institutionRules,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando notificación Push para enrollment ${payload.enrollmentId}`,
        error,
      );
    }
  }

  @OnEvent('attendance.bulk.registered', { async: true })
  async handleBulkAttendance(payload: any) {
    // Para asistencia masiva, enviamos las notificaciones en paralelo pero sin bloquear el backend
    const promises = payload.records.map((record: any) =>
      this.processSmartNotification(
        record.enrollmentId,
        record.status,
        payload.timestamp,
        payload.institutionRules,
      ).catch((e) =>
        this.logger.error(
          `Error enviando Push masivo para enrollment ${record.enrollmentId}`,
          e,
        ),
      ),
    );
    await Promise.allSettled(promises);
  }

  // La lógica que extrajimos del servicio original:
  private async processSmartNotification(
    enrollmentId: string,
    status: AttendanceStatus,
    scanTime: Date,
    institution: any,
  ) {
    let shouldNotify = false;

    switch (institution.notificationFrequency) {
      case NotificationFrequency.PER_CLASS:
        shouldNotify = true;
        break;
      case NotificationFrequency.ALERTS_ONLY:
        if (
          status === AttendanceStatus.LATE ||
          status === AttendanceStatus.ABSENT
        ) {
          shouldNotify = true;
        }
        break;
      case NotificationFrequency.ENTRY_EXIT:
        const dateOnly = new Date(scanTime.toISOString().split('T')[0]);
        const recordsToday = await this.prisma.attendanceRecord.count({
          where: { enrollmentId, date: dateOnly },
        });
        if (recordsToday <= 1) shouldNotify = true;
        break;
    }

    if (!shouldNotify) return;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            guardians: { include: { guardian: { include: { user: true } } } },
          },
        },
      },
    });

    if (!enrollment || !enrollment.student.guardians) return;

    const fcmTokens = new Set<string>();
    enrollment.student.guardians.forEach((g: any) => {
      if (g.guardian.user?.fcmTokens) {
        g.guardian.user.fcmTokens.forEach((token: string) =>
          fcmTokens.add(token),
        );
      }
    });

    const tokensArray = Array.from(fcmTokens);
    if (tokensArray.length === 0) return;

    const firstName = enrollment.student.names.split(' ')[0];
    const timeStr = scanTime.toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let title = 'Control de Ingreso 🏫';
    let body = `${firstName} ha marcado asistencia a las ${timeStr}.`;

    if (status === AttendanceStatus.LATE) {
      title = 'Aviso de Atraso ⏰';
      body = `${firstName} ingresó con atraso a las ${timeStr}.`;
    } else if (status === AttendanceStatus.ABSENT) {
      title = 'Aviso de Inasistencia ⚠️';
      body = `${firstName} ha sido marcado como Ausente a las ${timeStr}.`;
    }

    await this.firebaseService.sendMulticastNotification(
      tokensArray,
      title,
      body,
      {
        type: 'ATTENDANCE_UPDATE',
        status: status,
      },
    );
  }
}
