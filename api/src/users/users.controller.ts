import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';
import { UserProfileCacheInterceptor } from '../common/interceptors/user-profile-cache.interceptor';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

// 🔥 IMPORTACIONES SEGURIDAD ABAC
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SystemPermissions } from '../auth/constants/permissions.constant';

@ApiTags('Usuarios')
@ApiCookieAuth('uecg_access_token')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =======================================================
  // ENDPOINTS DE PERFIL PERSONAL
  // =======================================================

  @Get('profile')
  @UseInterceptors(UserProfileCacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({
    summary: 'Obtiene los datos del perfil del usuario logueado',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del perfil retornados exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualiza los datos básicos de mi perfil' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Post('profile/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambia la contraseña de manera voluntaria' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({
    status: 401,
    description: 'La contraseña actual es incorrecta o no autenticado',
  })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.userId, changePasswordDto);
  }

  // =======================================================
  // ENDPOINTS ADMINISTRATIVOS (Jerarquía ABAC activada)
  // =======================================================

  @Post()
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o rol inexistente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  @ApiResponse({ status: 409, description: 'El correo ya está registrado' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @ApiOperation({ summary: 'Obtener lista de usuarios filtrada por jerarquía' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios retornada con paginación',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos suficientes' })
  findAll(
    @Query() query: FindAllUsersDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.findAll(query, user);
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar nombre o rol de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes o jerarquía insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un usuario (Soft Delete)' })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes o jerarquía insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.remove(id, user);
  }

  @Patch(':id/reactivate')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivar a un usuario inactivo' })
  @ApiResponse({ status: 200, description: 'Usuario reactivado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes o jerarquía insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  reactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.reactivate(id, user);
  }

  @Post(':id/reset-password')
  @RequirePermissions(SystemPermissions.MANAGE_ALL_USER) // 🔥 ABAC
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Genera una nueva contraseña temporal' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña temporal generada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos suficientes o jerarquía insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  resetPassword(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.resetPassword(id, user);
  }
}
