import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { LoginDto } from './dto/login.dto';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { RegisterGuardianDto } from './dto/register-guardian.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ======================================================
  // COOKIE HELPER
  // ======================================================

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = (isProduction ? 'none' : 'lax') as 'none' | 'lax';

    res.cookie('uecg_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSitePolicy,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('uecg_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSitePolicy,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  // ======================================================
  // LOGIN (Web y Mobile)
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia sesión (Soporte Híbrido Web Cookies y Mobile JSON)' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    if (result.status === 'SUCCESS' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: result.status,
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // REFRESH TOKEN
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000,
    },
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rota refresh token y extiende sesión (Web Cookies y Mobile JSON)',
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const refreshToken =
      req.cookies?.['uecg_refresh_token'] ||
      bodyRefreshToken ||
      (req.headers['x-refresh-token'] as string);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido o no proporcionado');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    if (result.status === 'SUCCESS' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: 'SUCCESS',
        message: 'Sesión renovada exitosamente',
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // SETUP PASSWORD
  // ======================================================

  @Post('setup-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Configura contraseña definitiva para nuevos usuarios',
  })
  async setupPassword(
    @Body() setupDto: SetupPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.setupNewPassword(
      setupDto.setupToken,
      setupDto.newPassword,
    );

    if (result.status === 'SUCCESS' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: result.status,
        message: result.message,
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cierra sesión y destruye cookies activas',
  })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (user?.userId) {
      await this.authService.logout(user.userId);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const sameSitePolicy = (isProduction ? 'none' : 'lax') as 'none' | 'lax';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSitePolicy,
    };

    res.clearCookie('uecg_access_token', cookieOptions);
    res.clearCookie('uecg_refresh_token', cookieOptions);

    return {
      status: 'SUCCESS',
      message: 'Sesión cerrada exitosamente',
    };
  }

  // ======================================================
  // REGISTER GUARDIAN (Mobile)
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('register-guardian')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Auto-registro padres/tutores mobile',
  })
  async registerGuardian(
    @Body() registerDto: RegisterGuardianDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerGuardian(registerDto);

    if (result.status === 'SUCCESS' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: result.status,
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // REGISTER STUDENT (Mobile)
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('register-student')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Auto-registro estudiantes mobile',
  })
  async registerStudent(
    @Body() registerDto: RegisterStudentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerStudent(registerDto);

    if (result.status === 'SUCCESS' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: result.status,
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // FORGOT PASSWORD
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Envía OTP al correo de recuperación o institucional',
  })
  async forgotPassword(
    @Body() dto: RequestPasswordResetDto,
  ) {
    return this.authService.requestPasswordReset(dto.identifier);
  }

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifica OTP y actualiza la contraseña',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPasswordWithCode(
      dto.identifier,
      dto.code,
      dto.newPassword,
    );
  }

  // ======================================================
  // REGISTER FCM TOKEN
  // ======================================================

  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra dispositivo para Push Notifications',
  })
  async registerFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    if (!user?.userId) {
      throw new UnauthorizedException('Usuario inválido');
    }

    return this.authService.registerFcmToken(user.userId, dto.fcmToken);
  }

  // ======================================================
  // GET ME (Comprobar sesión activa)
  // ======================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna el perfil del usuario actualmente autenticado',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return {
      status: 'SUCCESS',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }
}

