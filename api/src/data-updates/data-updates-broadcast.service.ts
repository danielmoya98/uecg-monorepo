import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { MailQueueService } from '../queues/mail/mail.queue.service';
import { InstitutionConfigService } from '../institutions/institution-config.service';
import { ChannelResolverService } from './services/channel-resolver.service';
import { NotificationChannel } from '../../prisma/generated/client';

export interface OmnichannelDeliveryResult {
  enrollmentId: string;
  studentName: string;
  pushSent: boolean;
  emailSent: boolean;
  whatsappLink: string | null;
  isUnreachable: boolean;
}

@Injectable()
export class DataUpdatesBroadcastService {
  private readonly logger = new Logger(DataUpdatesBroadcastService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
    private readonly institutionConfig: InstitutionConfigService,
    private readonly channelResolver: ChannelResolverService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailQueueService: MailQueueService,
  ) {}

  private getPreviewCacheKey(classroomId: string) {
    return `rude_preview:${classroomId}`;
  }

  // ======================================================
  // GENERAR TOKEN SEGURO
  // ======================================================
  async generateUpdateToken(enrollmentId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        enrollmentId,
        purpose: 'RUDE_UPDATE',
      },
      {
        expiresIn: '7d',
      },
    );
  }

  // ======================================================
  // NOTIFICAR TUTORES POR ESTUDIANTE (EVENTOS)
  // ======================================================
  async notifyGuardiansByStudentId(
    studentId: string,
    title: string,
    body: string,
  ) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        guardians: {
          include: {
            guardian: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      this.logger.warn(`⚠️ Estudiante no encontrado para notificación: ${studentId}`);
      return;
    }

    const fcmTokens = new Set<string>();
    student.guardians.forEach((g) => {
      if (g.guardian.user?.fcmTokens) {
        g.guardian.user.fcmTokens.forEach((token) => fcmTokens.add(token));
      }
    });

    const tokensArray = Array.from(fcmTokens);
    if (tokensArray.length > 0) {
      await this.mailQueueService.enqueuePushNotification({
        tokens: tokensArray,
        title,
        body,
        dataPayload: {
          action: 'OPEN_RUDE_HUB',
        },
      }).catch((err) => this.logger.error('Error encolando push notification', err));
    }
  }

  // ======================================================
  // MOTOR DE DESPACHO OMNICANAL INTELIGENTE
  // ======================================================
  private async processOmnichannelBroadcast(
    enrollment: any,
    channels: NotificationChannel[],
  ): Promise<OmnichannelDeliveryResult> {
    const studentName =
      `${enrollment.student.names} ${enrollment.student.lastNamePaterno || ''}`.trim();

    const token = await this.generateUpdateToken(enrollment.id);
    const publicUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const updateUrl = `${publicUrl}/actualizar-datos/${token}`;

    const guardians = enrollment.student.guardians || [];
    let pushSent = false;
    let emailSent = false;
    let whatsappLink: string | null = null;
    let isUnreachable = true;

    // Evaluamos los tutores y aplicamos el resolver inteligente
    for (const g of guardians) {
      const profile = {
        guardianId: g.guardian.id,
        fcmTokens: g.guardian.user?.fcmTokens || [],
        email: g.guardian.user?.email || g.guardian.user?.recoveryEmail || null,
        phone: g.guardian.phone || null,
      };

      const resolution = this.channelResolver.resolveChannels(
        profile,
        channels,
        studentName,
        updateUrl,
      );

      if (resolution.sendPush && resolution.targetTokens.length > 0 && !pushSent) {
        await this.mailQueueService.enqueuePushNotification({
          tokens: resolution.targetTokens,
          title: 'Actualización RUDE Requerida 🏫',
          body: `Por favor, actualice el formulario RUDE de ${studentName}.`,
          dataPayload: {
            updateUrl,
            action: 'OPEN_RUDE_HUB',
          },
        });
        pushSent = true;
      }

      if (resolution.sendEmail && resolution.targetEmail && !emailSent) {
        await this.mailQueueService.enqueueRudeUpdateEmail({
          to: resolution.targetEmail,
          studentName,
          updateUrl,
        });
        emailSent = true;
      }

      if (resolution.whatsappLink && !whatsappLink) {
        whatsappLink = resolution.whatsappLink;
      }

      if (!resolution.isUnreachable) {
        isUnreachable = false;
      }
    }

    return {
      enrollmentId: enrollment.id,
      studentName,
      pushSent,
      emailSent,
      whatsappLink,
      isUnreachable: !pushSent && !emailSent && !whatsappLink,
    };
  }

  // ======================================================
  // CAMPAÑA INDIVIDUAL
  // ======================================================
  async broadcastUpdateCampaign(enrollmentId: string) {
    const institution = await this.institutionConfig.getOrNull();
    const channels = institution?.activeNotificationChannels || [];

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Inscripción no encontrada.');
    }

    const result = await this.processOmnichannelBroadcast(enrollment, channels);

    return {
      status: 'SUCCESS',
      message: 'Notificación individual procesada exitosamente.',
      ...result,
    };
  }

  // ======================================================
  // CAMPAÑA POR CURSO (CLASSROOM)
  // ======================================================
  async broadcastToClassroom(classroomId: string) {
    const institution = await this.institutionConfig.getOrNull();
    const channels = institution?.activeNotificationChannels || [];

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId,
        status: 'INSCRITO',
        academicYear: { status: 'ACTIVE' },
      },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) {
      throw new NotFoundException('No hay estudiantes inscritos en este curso.');
    }

    const results: OmnichannelDeliveryResult[] = [];
    for (const enrollment of enrollments) {
      const result = await this.processOmnichannelBroadcast(enrollment, channels);
      results.push(result);
    }

    const pendingWhatsApp = results.filter((r) => r.whatsappLink !== null);

    return {
      status: 'SUCCESS',
      message: 'Campaña procesada exitosamente.',
      stats: {
        total: enrollments.length,
        pushesSent: results.filter((r) => r.pushSent).length,
        emailsSent: results.filter((r) => r.emailSent).length,
        pendingWhatsApp,
        unreachable: results.filter((r) => r.isUnreachable).length,
      },
    };
  }

  // ======================================================
  // PREVIEW CAMPAÑA CON RESOLVER INTELIGENTE
  // ======================================================
  async previewClassroomBroadcast(classroomId: string) {
    const cacheKey = this.getPreviewCacheKey(classroomId);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const institution = await this.institutionConfig.getOrNull();
    const channels = institution?.activeNotificationChannels || [];

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId,
        status: 'INSCRITO',
        academicYear: { status: 'ACTIVE' },
      },
      include: {
        student: {
          include: {
            guardians: {
              include: {
                guardian: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) {
      throw new NotFoundException('No hay estudiantes inscritos en este curso.');
    }

    let pushCount = 0;
    let emailCount = 0;
    let whatsappCount = 0;
    let unreachableCount = 0;

    enrollments.forEach((enrollment) => {
      const guardians = enrollment.student.guardians || [];
      let studentHandled = false;

      for (const g of guardians) {
        const profile = {
          guardianId: g.guardian.id,
          fcmTokens: g.guardian.user?.fcmTokens || [],
          email: g.guardian.user?.email || g.guardian.user?.recoveryEmail || null,
          phone: g.guardian.phone || null,
        };

        const resolution = this.channelResolver.resolveChannels(
          profile,
          channels,
          enrollment.student.names,
          '#preview',
        );

        if (resolution.sendPush) {
          pushCount++;
          studentHandled = true;
          break;
        } else if (resolution.sendEmail) {
          emailCount++;
          studentHandled = true;
          break;
        } else if (resolution.whatsappLink) {
          whatsappCount++;
          studentHandled = true;
          break;
        }
      }

      if (!studentHandled) {
        unreachableCount++;
      }
    });

    const result = {
      total: enrollments.length,
      channelsActive: channels,
      projection: {
        push: pushCount,
        email: emailCount,
        whatsapp: whatsappCount,
        unreachable: unreachableCount,
      },
    };

    await this.cacheManager.set(cacheKey, result, 60 * 10);
    return result;
  }

  // ======================================================
  // CAMPAÑA MASIVA (ALL PARENTS)
  // ======================================================
  async broadcastToAll() {
    const users = await this.prisma.user.findMany({
      where: {
        role: { name: 'PADRE' },
        status: 'ACTIVE',
        fcmTokens: { isEmpty: false },
      },
      select: { fcmTokens: true },
    });

    const fcmTokens = new Set<string>();
    users.forEach((user) =>
      user.fcmTokens.forEach((token) => fcmTokens.add(token)),
    );

    const tokensArray = Array.from(fcmTokens);
    if (tokensArray.length === 0) {
      throw new BadRequestException('No hay dispositivos con la app móvil registrados.');
    }

    const chunkSize = 500;
    for (let i = 0; i < tokensArray.length; i += chunkSize) {
      const chunk = tokensArray.slice(i, i + chunkSize);
      await this.mailQueueService.enqueuePushNotification({
        tokens: chunk,
        title: 'Campaña RUDE Oficial 🏫',
        body: 'Se habilitó la actualización del formulario RUDE para la presente gestión.',
        dataPayload: {
          action: 'OPEN_RUDE_HUB',
        },
      });
    }

    this.logger.log(`📢 Campaña masiva encolada: ${tokensArray.length} dispositivos`);

    return {
      status: 'SUCCESS',
      message: `Campaña encolada para ${tokensArray.length} dispositivos.`,
    };
  }
}
