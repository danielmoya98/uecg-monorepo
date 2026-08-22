import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';

// 🔥 NUEVAS IMPORTACIONES ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@ApiTags('Tutores (App Móvil)')
@ApiCookieAuth('uecg_access_token')
@Controller('guardians')
@UseGuards(AuthGuard('jwt'), PermissionsGuard) // 🔥 Escudo Activado
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Get('me')
  @RequirePermissions(SystemPermissions.READ_OWN_GUARDIAN) // 🔥 ABAC: Exclusivo para el dueño del perfil
  @ApiOperation({
    summary:
      'Devuelve el perfil del padre y sus hijos para el Dashboard de Flutter',
  })
  getMyProfile(@Req() req: any) {
    // req.user.userId viene de la validación del JWT
    return this.guardiansService.getMyProfileAndStudents(req.user.userId);
  }
}
