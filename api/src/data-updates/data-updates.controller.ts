import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { DataUpdatesService } from './data-updates.service';
import { SubmitDataUpdateDto } from './dto/submit-data-update.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

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
    summary: 'Envía campaña masiva a todos los padres registrados',
  })
  async triggerMassiveCampaign() {
    return this.dataUpdatesService.broadcastToAll();
  }

  // ======================================================
  // PUBLIC VERIFY (Rate Limited)
  // ======================================================
  @Get('public/verify/:token')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 20,
    },
  })
  @ApiOperation({
    summary: 'Verifica token público y retorna datos del estudiante para el formulario RUDE',
  })
  verifyPublicToken(@Param('token') token: string) {
    return this.dataUpdatesService.verifyTokenAndGetData(token);
  }

  // ======================================================
  // PUBLIC SUBMIT (Rate Limited)
  // ======================================================
  @Post('public/submit/:token')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 10,
    },
  })
  @ApiOperation({
    summary: 'Envía propuesta de actualización RUDE a cuarentena',
  })
  submitUpdate(
    @Param('token') token: string,
    @Body() proposedData: SubmitDataUpdateDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.dataUpdatesService.submitUpdate(token, proposedData, {
      ipAddress,
      userAgent,
    });
  }

  // ======================================================
  // PENDING REQUESTS
  // ======================================================
  @Get('pending')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.READ_ALL_STUDENT)
  @ApiOperation({
    summary: 'Lista solicitudes pendientes en cuarentena',
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
    summary: 'Aprueba y fusiona solicitud RUDE en el expediente oficial',
  })
  approveUpdate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataUpdatesService.approveUpdate(id, user?.userId);
  }

  // ======================================================
  // REJECT
  // ======================================================
  @Patch(':id/reject')
  @ApiCookieAuth('uecg_access_token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions(SystemPermissions.UPDATE_ALL_STUDENT)
  @ApiOperation({
    summary: 'Rechaza solicitud RUDE con motivo de observación',
  })
  rejectUpdate(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.dataUpdatesService.rejectUpdate(
      id,
      reason || 'Datos inconsistentes u observados por Secretaría',
      user?.userId,
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
    summary: 'Marca entrega física del formulario RUDE en papel',
  })
  markPhysicalDelivery(@Param('enrollmentId') enrollmentId: string) {
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
    summary: 'Genera enlace seguro temporal para WhatsApp/SMS',
  })
  async generateUpdateLink(@Param('enrollmentId') enrollmentId: string) {
    const token = await this.dataUpdatesService.generateUpdateToken(enrollmentId);
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
    summary: 'Dispara campaña individual omnicanal para un estudiante',
  })
  async triggerPushCampaign(@Param('enrollmentId') enrollmentId: string) {
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
    summary: 'Dispara campaña omnicanal para todo un curso',
  })
  async triggerClassroomCampaign(@Param('classroomId') classroomId: string) {
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
    summary: 'Previsualiza proyección de alcance omnicanal de la campaña',
  })
  async previewClassroomCampaign(@Param('classroomId') classroomId: string) {
    return this.dataUpdatesService.previewClassroomBroadcast(classroomId);
  }
}
