import { Module } from '@nestjs/common';

import { ClassPeriodsService } from './class-periods.service';

import { ClassPeriodsController } from './class-periods.controller';

import { PrismaModule } from '../prisma/prisma.module';

import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],

  controllers: [ClassPeriodsController],

  providers: [ClassPeriodsService],
})
export class ClassPeriodsModule {}
