import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AuthGuard } from '@nestjs/passport';

import { DashboardService } from './dashboard.service';

import { PermissionsGuard } from '../auth/guards/permissions.guard';

import { RequirePermissions } from '../auth/decorators/permissions.decorator';

import { SystemPermissions } from '../auth/constants/permissions.constant';

import { DashboardRootStatsDto } from './dto/dashboard-root-stats.dto';
import { DashboardGlobalStatsDto } from './dto/dashboard-global-stats.dto';
import { DashboardTeacherStatsDto } from './dto/dashboard-teacher-stats.dto';

@ApiTags('Dashboard y Métricas')
@ApiCookieAuth('uecg_access_token')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ======================================================
  // ROOT DASHBOARD
  // ======================================================

  @Get('root')
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @ApiOperation({
    summary: 'Dashboard Root',
  })
  @ApiOkResponse({
    description: 'Estadísticas del nivel Root obtenidas con éxito.',
    type: DashboardRootStatsDto,
  })
  async getRootStats() {
    return this.dashboardService.getRootStats();
  }

  // ======================================================
  // GLOBAL DASHBOARD
  // ======================================================

  @Get('global')
  @RequirePermissions(SystemPermissions.READ_ALL_DASHBOARD)
  @ApiOperation({
    summary: 'Dashboard institucional',
  })
  @ApiOkResponse({
    description: 'Estadísticas institucionales globales obtenidas con éxito.',
    type: DashboardGlobalStatsDto,
  })
  async getGlobalStats() {
    return this.dashboardService.getGlobalStats();
  }

  // ======================================================
  // TEACHER DASHBOARD
  // ======================================================

  @Get('teacher')
  @RequirePermissions(SystemPermissions.READ_OWN_DASHBOARD)
  @ApiOperation({
    summary: 'Dashboard operativo docente',
  })
  @ApiOkResponse({
    description: 'Estadísticas operativas del docente obtenidas con éxito.',
    type: DashboardTeacherStatsDto,
  })
  async getTeacherStats(@Req() req: any) {
    return this.dashboardService.getTeacherStats(req.user.userId);
  }
}
