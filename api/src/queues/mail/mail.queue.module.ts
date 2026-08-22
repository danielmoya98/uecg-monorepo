import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bullmq';

import { MailQueueService } from './mail.queue.service';

import { MailProcessor } from './mail.processor';

import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),

    NotificationModule,
  ],

  providers: [MailQueueService, MailProcessor],

  exports: [MailQueueService],
})
export class MailQueueModule {}
