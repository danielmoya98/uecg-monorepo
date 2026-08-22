import { Injectable, Logger } from '@nestjs/common';

import { OnEvent } from '@nestjs/event-emitter';

import { MailQueueService } from '../queues/mail/mail.queue.service';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger(AuthListener.name);

  constructor(private readonly mailQueueService: MailQueueService) {}

  // ======================================================
  // PASSWORD RESET EVENT
  // ======================================================

  @OnEvent('auth.password_reset.requested', {
    async: true,
  })
  async handlePasswordResetRequested(payload: {
    email: string;

    fullName: string;

    code: string;
  }) {
    this.logger.log(`📨 Encolando recovery email para ${payload.email}`);

    await this.mailQueueService.enqueuePasswordResetEmail(payload);
  }
}
