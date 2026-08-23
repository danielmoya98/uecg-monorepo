import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller';

import { DashboardService } from './dashboard.service';

import { PrismaModule } from '../prisma/prisma.module';

import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [PrismaModule, InstitutionsModule],

  controllers: [DashboardController],

  providers: [DashboardService],
})
export class DashboardModule {}
