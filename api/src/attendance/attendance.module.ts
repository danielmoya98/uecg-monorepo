import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { AttendanceCronService } from './attendance.cron';
import { FirebaseModule } from '../firebase/firebase.module'; // 🔥 IMPORTANTE
import { AttendanceListener } from './attendance.listener'; // 🔥 IMPORTAMOS EL LISTENER

import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [PrismaModule, IdentityModule, FirebaseModule, InstitutionsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCronService, AttendanceListener],
  exports: [AttendanceService],
})
export class AttendanceModule {}
