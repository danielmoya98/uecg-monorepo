// src/modules/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsProcessor } from './reports.processor';
import { PrismaModule } from '../prisma/prisma.module';

import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [
    PrismaModule,
    InstitutionsModule,

    BullModule.registerQueue({
      name: 'reports-queue',
    }),
  ],
  controllers: [ReportsController],

  providers: [ReportsService, ReportsProcessor],
  exports: [ReportsService],
})
export class ReportsModule {}
