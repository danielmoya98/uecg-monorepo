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

import { MailService } from '../mail/mail.service';

import { JwtService } from '@nestjs/jwt';

import { MailQueueService } from '../queues/mail/mail.queue.service';
import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class DataUpdatesBroadcastService {
  private readonly logger = new Logger(DataUpdatesBroadcastService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly institutionConfig: InstitutionConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailQueueService: MailQueueService,
  ) {}

  // ======================================================
  // CACHE HELPERS
  // ======================================================

  private getPreviewCacheKey(classroomId: string) {
    return `rude_preview:${classroomId}`;
  }

  // ======================================================
  // GENERAR TOKEN SEGURO
  // ======================================================

  async generateUpdateToken(enrollmentId: string) {
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
  // NOTIFICAR TUTORES
  // ======================================================

  async notifyGuardiansByStudentId(
    studentId: string,
    title: string,
    body: string,
  ) {
    const student = await this.prisma.student.findUnique({
      where: {
        id: studentId,
      },

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
      this.logger.warn(`⚠️ Estudiante no encontrado: ${studentId}`);

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
      await this.firebaseService
        .sendMulticastNotification(tokensArray, title, body)
        .catch((e) => this.logger.error('❌ Error FCM', e));
    }
  }

  // ======================================================
  // OMNICHANNEL ENGINE
  // ======================================================

  private async processOmnichannelBroadcast(
    enrollment: any,
    channels: string[],
  ) {
    const studentName =
      `${enrollment.student.names} ${enrollment.student.lastNamePaterno || ''}`.trim();

    const token = await this.generateUpdateToken(enrollment.id);

    const publicUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const updateUrl = `${publicUrl}/actualizar-datos/${token}`;

    let pushSent = false;

    let emailSent = false;

    let whatsappLink: string | null = null;

    // ======================================================
    // PUSH
    // ======================================================

    if (channels.includes('PUSH_APP')) {
      const fcmTokens = new Set<string>();

      if (enrollment.student.guardians) {
        enrollment.student.guardians.forEach((g: any) => {
          if (g.guardian.user?.fcmTokens) {
            g.guardian.user.fcmTokens.forEach((t: string) => fcmTokens.add(t));
          }
        });
      }

      const tokensArray = Array.from(fcmTokens);

      if (tokensArray.length > 0) {
        await this.mailQueueService.enqueuePushNotification({
          tokens: tokensArray,

          title: 'Actualización de Datos Requerida 🏫',

          body: `Por favor, actualice el formulario RUDE de ${studentName}.`,

          dataPayload: {
            updateUrl,
          },
        });

        pushSent = true;
      }
    }

    // ======================================================
    // EMAIL
    // ======================================================

    if (!pushSent && channels.includes('EMAIL')) {
      if (enrollment.student.guardians) {
        for (const g of enrollment.student.guardians) {
          const targetEmail =
            g.guardian.user?.email || g.guardian.user?.recoveryEmail;

          if (targetEmail) {
            await this.mailQueueService.enqueueRudeUpdateEmail({
              to: targetEmail,

              studentName,

              updateUrl,
            });

            emailSent = true;

            break;
          }
        }
      }
    }

    // ======================================================
    // WHATSAPP FALLBACK
    // ======================================================

    if (channels.includes('WHATSAPP') && !pushSent && !emailSent) {
      let targetPhone: string | null = null;

      if (enrollment.student.guardians) {
        const guardianWithPhone = enrollment.student.guardians.find(
          (g: any) => g.guardian.phone,
        );

        targetPhone = guardianWithPhone?.guardian.phone || null;
      }

      if (targetPhone) {
        const textMessage = `Hola, el colegio requiere actualizar los datos de *${studentName}*. Por favor, ingresa a este enlace oficial: ${updateUrl}`;

        const cleanPhone = targetPhone.replace(/\D/g, '');

        whatsappLink = `https://api.whatsapp.com/send/?phone=591${cleanPhone}&text=${encodeURIComponent(textMessage)}&type=phone_number&app_absent=0`;
      }
    }

    return {
      enrollmentId: enrollment.id,

      studentName,

      pushSent,

      emailSent,

      whatsappLink,
    };
  }

  // ======================================================
  // CAMPAÑA INDIVIDUAL
  // ======================================================

  async broadcastUpdateCampaign(enrollmentId: string) {
    const institution = await this.institutionConfig.getOrNull();

    const channels = institution?.activeNotificationChannels || [];

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        id: enrollmentId,
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
  // CAMPAÑA POR CURSO
  // ======================================================

  async broadcastToClassroom(classroomId: string) {
    const institution = await this.institutionConfig.getOrNull();

    const channels = institution?.activeNotificationChannels || [];

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId,

        status: 'INSCRITO',

        academicYear: {
          status: 'ACTIVE',
        },
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
      throw new NotFoundException(
        'No hay estudiantes inscritos en este curso.',
      );
    }

    const results: any[] = [];

    for (const enrollment of enrollments) {
      const result = await this.processOmnichannelBroadcast(
        enrollment,
        channels,
      );

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
      },
    };
  }

  // ======================================================
  // PREVIEW CAMPAIGN
  // ======================================================

  async previewClassroomBroadcast(classroomId: string) {
    const cacheKey = this.getPreviewCacheKey(classroomId);

    // ======================================================
    // CACHE HIT
    // ======================================================

    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const institution = await this.institutionConfig.getOrNull();

    const channels = institution?.activeNotificationChannels || [];

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classroomId,

        status: 'INSCRITO',

        academicYear: {
          status: 'ACTIVE',
        },
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
      throw new NotFoundException(
        'No hay estudiantes inscritos en este curso.',
      );
    }

    let pushCount = 0;

    let emailCount = 0;

    let whatsappCount = 0;

    let unreachableCount = 0;

    enrollments.forEach((enrollment) => {
      let resolved = false;

      // ======================================================
      // PUSH
      // ======================================================

      if (!resolved && channels.includes('PUSH_APP')) {
        const hasToken = enrollment.student.guardians.some(
          (g: any) => (g.guardian.user?.fcmTokens?.length ?? 0) > 0,
        );

        if (hasToken) {
          pushCount++;

          resolved = true;
        }
      }

      // ======================================================
      // EMAIL
      // ======================================================

      if (!resolved && channels.includes('EMAIL')) {
        const hasEmail = enrollment.student.guardians.some(
          (g: any) => g.guardian.user?.email || g.guardian.user?.recoveryEmail,
        );

        if (hasEmail) {
          emailCount++;

          resolved = true;
        }
      }

      // ======================================================
      // WHATSAPP
      // ======================================================

      if (!resolved && channels.includes('WHATSAPP')) {
        const hasPhone = enrollment.student.guardians.some(
          (g: any) => g.guardian.phone,
        );

        if (hasPhone) {
          whatsappCount++;

          resolved = true;
        }
      }

      // ======================================================
      // UNREACHABLE
      // ======================================================

      if (!resolved) {
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

    // ======================================================
    // CACHE STORE
    // ======================================================

    await this.cacheManager.set(cacheKey, result, 60 * 10);

    return result;
  }

  // ======================================================
  // CAMPAÑA MASIVA
  // ======================================================

  async broadcastToAll() {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          name: 'PADRE',
        },

        status: 'ACTIVE',

        fcmTokens: {
          isEmpty: false,
        },
      },

      select: {
        fcmTokens: true,
      },
    });

    const fcmTokens = new Set<string>();

    users.forEach((user) =>
      user.fcmTokens.forEach((token) => fcmTokens.add(token)),
    );

    const tokensArray = Array.from(fcmTokens);

    if (tokensArray.length === 0) {
      throw new BadRequestException('No hay dispositivos registrados.');
    }

    const chunkSize = 500;

    for (let i = 0; i < tokensArray.length; i += chunkSize) {
      const chunk = tokensArray.slice(i, i + chunkSize);

      await this.mailQueueService.enqueuePushNotification({
        tokens: chunk,

        title: 'Campaña RUDE Oficial 🏫',

        body: 'Se habilitó la actualización de datos para la presente gestión.',

        dataPayload: {
          action: 'OPEN_RUDE_HUB',
        },
      });
    }

    this.logger.log(
      `📢 Campaña masiva enviada: ${tokensArray.length} dispositivos`,
    );

    return {
      status: 'SUCCESS',

      message: `Campaña enviada a ${tokensArray.length} dispositivos.`,
    };
  }
}
