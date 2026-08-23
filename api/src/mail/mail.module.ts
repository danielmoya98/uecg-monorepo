import { Module } from '@nestjs/common';

import { MailService } from './mail.service';

import { PrismaModule } from '../prisma/prisma.module';

import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [PrismaModule, InstitutionsModule],

  providers: [MailService],

  exports: [MailService],
})
export class MailModule {}
