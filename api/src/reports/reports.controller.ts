import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { MassiveBulletinsDto } from './dto/massive-bulletins.dto';
import type { Response } from 'express';

// 🔥 IMPORTACIONES ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant'; // Ajusta la ruta a tu carpeta auth/constants si es necesario

@ApiTags('Reportes y Libretas Oficiales (Ley 070)')
@ApiCookieAuth('uecg_access_token') // 🔥 Requerido para Swagger
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // 🔥 Candados Maestros Activados
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('bulletin/:enrollmentId')
  @RequirePermissions(SystemPermissions.READ_ALL_GRADE) // 🔥 ABAC: Bloquea a los Docentes
  @ApiOperation({
    summary:
      'Obtiene los datos pivoteados para renderizar la Libreta Escolar Individual',
  })
  async getIndividualBulletin(@Param('enrollmentId') enrollmentId: string) {
    const data =
      await this.reportsService.getIndividualBulletinData(enrollmentId);

    return {
      success: true,
      message: 'Datos de boletín obtenidos correctamente',
      data,
    };
  }

  @Post('bulletins/massive')
  @RequirePermissions(SystemPermissions.READ_ALL_GRADE) // 🔥 ABAC: Bloquea a los Docentes
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary:
      'Encola un trabajo en BullMQ para generar Libretas Masivas en formato ZIP',
  })
  async triggerMassiveBulletins(
    @Body()
    payload: MassiveBulletinsDto,
    @Req() req: any,
  ) {
    // 🔥 Gracias al AuthGuard, req.user es 100% seguro y existe
    const userId = req.user.userId;

    // Pasamos el trabajo a la cola de BullMQ en segundo plano
    return this.reportsService.queueMassiveBulletins({
      ...payload,
      userId: userId,
    });
  }

  @Get('export/zip/download/:fileName')
  @RequirePermissions(SystemPermissions.READ_ALL_GRADE) // 🔥 ABAC: Bloqueo de descarga para roles no autorizados
  @ApiOperation({
    summary: 'Descarga un ZIP de libretas ya generado por el Worker',
  })
  async downloadZip(@Param('fileName') fileName: string, @Res() res: Response) {
    return this.reportsService.downloadZip(fileName, res);
  }
}
