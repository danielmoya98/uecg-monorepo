import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';

import { DataUpdatesService } from './data-updates.service';

import { SubmitDataUpdateDto } from './dto/submit-data-update.dto';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { RequirePermissions } from '../auth/decorators/permissions.decorator';

import { SystemPermissions } from '../auth/constants/permissions.constant';

@ApiTags('Actualización de Datos RUDE')
@Controller('data-updates')
export class DataUpdatesController {
  constructor(private readonly dataUpdatesService: DataUpdatesService) {}

  // ======================================================
  // MASSIVE CAMPAIGN
  // ======================================================

  @Post('broadcast/all')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Envía campaña masiva a padres',
  })
  async triggerMassiveCampaign() {
    return this.dataUpdatesService.broadcastToAll();
  }

  // ======================================================
  // PUBLIC VERIFY
  // ======================================================

  @Get('public/verify/:token')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 10,
    },
  })
  @ApiOperation({
    summary: 'Verifica token RUDE',
  })
  verifyPublicToken(
    @Param('token')
    token: string,
  ) {
    return this.dataUpdatesService.verifyTokenAndGetData(token);
  }

  // ======================================================
  // PUBLIC SUBMIT
  // ======================================================

  @Post('public/submit/:token')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 5,
    },
  })
  @ApiOperation({
    summary: 'Envía actualización RUDE',
  })
  submitUpdate(
    @Param('token')
    token: string,

    @Body()
    proposedData: SubmitDataUpdateDto,
  ) {
    return this.dataUpdatesService.submitUpdate(token, proposedData);
  }

  // ======================================================
  // PENDING REQUESTS
  // ======================================================

  @Get('pending')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.READ_ALL_STUDENT)
  @ApiOperation({
    summary: 'Solicitudes pendientes',
  })
  getPendingRequests() {
    return this.dataUpdatesService.getPendingRequests();
  }

  // ======================================================
  // APPROVE
  // ======================================================

  @Post(':id/approve')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Aprueba solicitud RUDE',
  })
  approveUpdate(
    @Param('id')
    id: string,
  ) {
    return this.dataUpdatesService.approveUpdate(id);
  }

  // ======================================================
  // REJECT
  // ======================================================

  @Patch(':id/reject')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Rechaza solicitud RUDE',
  })
  rejectUpdate(
    @Param('id')
    id: string,

    @Body('reason')
    reason: string,
  ) {
    return this.dataUpdatesService.rejectUpdate(
      id,
      reason || 'Datos inconsistentes',
    );
  }

  // ======================================================
  // PHYSICAL DELIVERY
  // ======================================================

  @Patch(':enrollmentId/mark-physical')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Marca entrega física',
  })
  markPhysicalDelivery(
    @Param('enrollmentId')
    enrollmentId: string,
  ) {
    return this.dataUpdatesService.markPhysicalDelivery(enrollmentId);
  }

  // ======================================================
  // GENERATE LINK
  // ======================================================

  @Post('generate-link/:enrollmentId')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Genera enlace seguro',
  })
  async generateUpdateLink(
    @Param('enrollmentId')
    enrollmentId: string,
  ) {
    const token =
      await this.dataUpdatesService.generateUpdateToken(enrollmentId);

    const publicUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return {
      token,

      url: `${publicUrl}/actualizar-datos/${token}`,
    };
  }

  // ======================================================
  // INDIVIDUAL CAMPAIGN
  // ======================================================

  @Post('broadcast/:enrollmentId')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Campaña individual',
  })
  async triggerPushCampaign(
    @Param('enrollmentId')
    enrollmentId: string,
  ) {
    return this.dataUpdatesService.broadcastUpdateCampaign(enrollmentId);
  }

  // ======================================================
  // CLASSROOM CAMPAIGN
  // ======================================================

  @Post('broadcast/classroom/:classroomId')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Campaña por curso',
  })
  async triggerClassroomCampaign(
    @Param('classroomId')
    classroomId: string,
  ) {
    return this.dataUpdatesService.broadcastToClassroom(classroomId);
  }

  // ======================================================
  // PREVIEW
  // ======================================================

  @Get('broadcast/classroom/:classroomId/preview')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.READ_ALL_STUDENT)
  @ApiOperation({
    summary: 'Preview campaña',
  })
  async previewClassroomCampaign(
    @Param('classroomId')
    classroomId: string,
  ) {
    return this.dataUpdatesService.previewClassroomBroadcast(classroomId);
  }
}
