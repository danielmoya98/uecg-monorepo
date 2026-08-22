import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from '../services/roles.service';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { SystemPermissions } from '../constants/permissions.constant';
import { PermissionsGuard } from '../guards/permissions.guard';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';

@ApiTags('Roles y Permisos')
@ApiCookieAuth('uecg_access_token')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @ApiOperation({ summary: 'Lista todos los roles del sistema' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions-catalog')
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @ApiOperation({
    summary: 'Obtiene el catálogo completo de permisos disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de permisos obtenido correctamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  getPermissionsCatalog() {
    return this.rolesService.getPermissionsCatalog();
  }

  @Patch(':id/permissions')
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @ApiOperation({ summary: 'Actualiza los permisos asignados a un rol' })
  @ApiParam({ name: 'id', description: 'UUID del rol', type: String })
  @ApiResponse({
    status: 200,
    description: 'Permisos del rol actualizados correctamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updateRolePermissions(id, dto.permissionIds);
  }

  @Post()
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea un nuevo rol personalizado en el sistema' })
  @ApiResponse({ status: 201, description: 'Rol creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un rol del sistema' })
  @ApiParam({
    name: 'id',
    description: 'UUID del rol a eliminar',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Rol eliminado correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.deleteRole(id);
  }
}
