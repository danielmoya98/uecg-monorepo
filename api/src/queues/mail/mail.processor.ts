import { Processor, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { Injectable, Logger } from '@nestjs/common';

import { NotificationService } from '../../notifications/notification.service';

@Injectable()
@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  // ======================================================
  // PROCESS JOBS
  // ======================================================

  async process(job: Job<any>) {
    this.logger.log(`📨 Procesando job: ${job.name}`);

    switch (job.name) {
      // ======================================================
      // PASSWORD RESET
      // ======================================================

      case 'password-reset':
        return this.handlePasswordReset(job.data);

      // ======================================================
      // RUDE UPDATE
      // ======================================================

      case 'rude-update-email':
        return this.handleRudeUpdateEmail(job.data);

      // ======================================================
      // PUSH
      // ======================================================

      case 'push-notification':
        return this.handlePushNotification(job.data);

      // ======================================================
      // UNKNOWN
      // ======================================================

      default:
        this.logger.warn(`⚠️ Job desconocido: ${job.name}`);
    }
  }

  // ======================================================
  // PASSWORD RESET
  // ======================================================

  private async handlePasswordReset(payload: {
    email: string;

    fullName: string;

    code: string;
  }) {
    return this.notificationService.sendPasswordResetEmail(payload);
  }

  // ======================================================
  // RUDE UPDATE EMAIL
  // ======================================================

  private async handleRudeUpdateEmail(payload: {
    to: string;

    studentName: string;

    updateUrl: string;
  }) {
    return this.notificationService.sendRudeUpdateEmail(payload);
  }

  // ======================================================
  // PUSH
  // ======================================================

  private async handlePushNotification(payload: {
    tokens: string[];

    title: string;

    body: string;

    dataPayload?: Record<string, string>;
  }) {
    return this.notificationService.sendPushNotification(payload);
  }
}
