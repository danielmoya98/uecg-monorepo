import { Module } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { InstitutionsController } from './institutions.controller';
import { InstitutionConfigService } from './institution-config.service';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, InstitutionConfigService],
  exports: [InstitutionConfigService, InstitutionsService],
})
export class InstitutionsModule {}
