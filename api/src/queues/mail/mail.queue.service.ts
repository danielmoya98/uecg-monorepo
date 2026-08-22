import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

@Injectable()
export class MailQueueService {
  constructor(
    @InjectQueue('mail')
    private readonly mailQueue: Queue,
  ) {}

  // ======================================================
  // BASE OPTIONS
  // ======================================================

  private readonly defaultJobOptions = {
    attempts: 5,

    backoff: {
      type: 'exponential',

      delay: 3000,
    },

    removeOnComplete: 50,

    removeOnFail: 100,
  };

  // ======================================================
  // PASSWORD RESET
  // ======================================================

  async enqueuePasswordResetEmail(payload: {
    email: string;

    fullName: string;

    code: string;
  }) {
    await this.mailQueue.add(
      'password-reset',

      payload,

      this.defaultJobOptions,
    );
  }

  // ======================================================
  // RUDE UPDATE EMAIL
  // ======================================================

  async enqueueRudeUpdateEmail(payload: {
    to: string;

    studentName: string;

    updateUrl: string;
  }) {
    await this.mailQueue.add(
      'rude-update-email',

      payload,

      this.defaultJobOptions,
    );
  }

  // ======================================================
  // PUSH NOTIFICATION
  // ======================================================

  async enqueuePushNotification(payload: {
    tokens: string[];

    title: string;

    body: string;

    dataPayload?: Record<string, string>;
  }) {
    await this.mailQueue.add(
      'push-notification',

      payload,

      {
        ...this.defaultJobOptions,

        attempts: 3,
      },
    );
  }
}
