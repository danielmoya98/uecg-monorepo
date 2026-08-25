import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { MailModule } from '../mail/mail.module';
import { MailQueueModule } from '../queues/mail/mail.queue.module';
import { InstitutionsModule } from '../institutions/institutions.module';

import { DataUpdatesController } from './data-updates.controller';
import { DataUpdatesService } from './data-updates.service';
import { DataUpdatesBroadcastService } from './data-updates-broadcast.service';
import { DataUpdatesTransactionService } from './data-updates-transaction.service';
import { ChannelResolverService } from './services/channel-resolver.service';
import { DataUpdatesListener } from './data-updates.listener';

@Module({
  imports: [
    PrismaModule,
    InstitutionsModule,
    MailModule,
    MailQueueModule,
    FirebaseModule,
    ConfigModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),

    BullModule.registerQueue({
      name: 'data-updates-notifications',
    }),
  ],
  controllers: [DataUpdatesController],
  providers: [
    DataUpdatesService,
    DataUpdatesBroadcastService,
    DataUpdatesTransactionService,
    ChannelResolverService,
    DataUpdatesListener,
  ],
  exports: [
    DataUpdatesService,
    DataUpdatesBroadcastService,
    ChannelResolverService,
  ],
})
export class DataUpdatesModule {}
