import { Module } from '@nestjs/common';

import { NotificationService } from './notification.service';

import { MailModule } from '../mail/mail.module';

import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [MailModule, FirebaseModule],

  providers: [NotificationService],

  exports: [NotificationService],
})
export class NotificationModule {}
