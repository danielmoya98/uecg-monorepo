import { Module } from '@nestjs/common';
import { TimetablesService } from './timetables.service';
import { TimetablesController } from './timetables.controller';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { TimetablesProcessor } from './timetables.processor';
import { CleanupService } from './cleanup.service';

import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [
    PrismaModule,
    InstitutionsModule,
    // Registramos la cola específica para este módulo
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [TimetablesController],
  providers: [TimetablesService, TimetablesProcessor, CleanupService],
})
export class TimetablesModule {}
