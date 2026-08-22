import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '../mail/mail.service';

import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailService: MailService,

    private readonly firebaseService: FirebaseService,
  ) {}

  // ======================================================
  // PASSWORD RESET EMAIL
  // ======================================================

  async sendPasswordResetEmail(payload: {
    email: string;

    fullName: string;

    code: string;
  }) {
    this.logger.log(`📧 NotificationService -> Password Reset`);

    return this.mailService.sendPasswordResetEmail(
      payload.email,
      payload.fullName,
      payload.code,
    );
  }

  // ======================================================
  // RUDE UPDATE EMAIL
  // ======================================================

  async sendRudeUpdateEmail(payload: {
    to: string;

    studentName: string;

    updateUrl: string;
  }) {
    this.logger.log(`📧 NotificationService -> RUDE Update`);

    return this.mailService.sendRudeUpdateEmail(
      payload.to,
      payload.studentName,
      payload.updateUrl,
    );
  }

  // ======================================================
  // PUSH NOTIFICATION
  // ======================================================

  async sendPushNotification(payload: {
    tokens: string[];

    title: string;

    body: string;

    dataPayload?: Record<string, string>;
  }) {
    this.logger.log(`📲 NotificationService -> Push`);

    return this.firebaseService.sendMulticastNotification(
      payload.tokens,
      payload.title,
      payload.body,
      payload.dataPayload,
    );
  }
}
