import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterGuardianDto } from './dto/register-guardian.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetupPasswordDto } from './dto/setup-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { AuthorizeQrDto } from './dto/authorize-qr.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { SessionMetadata } from './services/auth-token.service';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  private extractSessionMetadata(req: Request): SessionMetadata {
    const userAgent = req.headers['user-agent'] || 'Desconocido';
    const ipHeader =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';
    const ipAddress = Array.isArray(ipHeader)
      ? ipHeader[0]
      : ipHeader.split(',')[0].trim();

    let deviceType = 'WEB';
    if (/android/i.test(userAgent)) {
      deviceType = 'MOBILE_ANDROID';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = 'MOBILE_IOS';
    } else if (/dart|flutter/i.test(userAgent)) {
      deviceType = 'MOBILE_FLUTTER';
    }

    return {
      deviceType,
      deviceName: userAgent.substring(0, 100),
      ipAddress,
      userAgent: userAgent.substring(0, 255),
    };
  }

  // ======================================================
  // HELPERS
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
  // LOGIN
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
  @ApiOperation({
    summary: 'Autentica a un usuario y entrega tokens/cookies de sesión',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const sessionMetadata = this.extractSessionMetadata(req);
    const result = await this.authService.login(
      loginDto.email,
      loginDto.password,
      sessionMetadata,
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
  // REFRESH TOKEN (COOKIE + BEARER)
  // ======================================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renueva el Access Token usando el Refresh Token',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token no proporcionado o inválido',
  })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.['uecg_refresh_token'] ||
      (req.body?.refreshToken as string) ||
      (req.headers['x-refresh-token'] as string);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    const sessionMetadata = this.extractSessionMetadata(req);
    const result = await this.authService.refreshTokens(
      refreshToken,
      sessionMetadata,
    );

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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const currentRefreshToken =
      req.cookies?.['uecg_refresh_token'] ||
      (req.headers['x-refresh-token'] as string);

    if (user?.userId) {
      await this.authService.logout(user.userId, currentRefreshToken);
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
  // MULTI-DEVICE SESSIONS
  // ======================================================

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lista los dispositivos y sesiones activas del usuario',
  })
  async getSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const currentRefreshToken =
      req.cookies?.['uecg_refresh_token'] ||
      (req.headers['x-refresh-token'] as string);

    const sessions = await this.authService.getUserSessions(
      user.userId,
      currentRefreshToken,
    );

    return {
      status: 'SUCCESS',
      sessions,
    };
  }

  @Delete('sessions/other')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cierra todas las sesiones en otros dispositivos excepto el actual',
  })
  async revokeOtherSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const currentRefreshToken =
      req.cookies?.['uecg_refresh_token'] ||
      (req.headers['x-refresh-token'] as string);

    if (!currentRefreshToken) {
      throw new UnauthorizedException('Token de sesión no disponible');
    }

    return this.authService.revokeAllOtherSessions(
      user.userId,
      currentRefreshToken,
    );
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cierra una sesión remota específica por ID',
  })
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(user.userId, sessionId);
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
        message: 'Registro exitoso',
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
        message: 'Registro exitoso',
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
    summary: 'Solicitud de recuperación de contraseña',
  })
  async forgotPassword(@Body() forgotDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(forgotDto.identifier);
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
    summary: 'Restablece la contraseña con el código recibido',
  })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPasswordWithCode(
      resetDto.identifier,
      resetDto.code,
      resetDto.newPassword,
    );
  }

  // ======================================================
  // CURRENT USER
  // ======================================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retorna el perfil del usuario autenticado',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
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

  // ======================================================
  // REGISTER FCM TOKEN
  // ======================================================

  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra un FCM Token para notificaciones push',
  })
  async registerFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.authService.registerFcmToken(user.userId, dto.fcmToken);
  }

  // ======================================================
  // QR LOGIN CHALLENGE-RESPONSE (WhatsApp Web Style)
  // ======================================================

  @Post('qr-challenge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crea un desafío QR para inicio de sesión en Web',
  })
  async createQrChallenge() {
    return this.authService.createQrChallenge();
  }

  @Post('qr-challenge/authorize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autoriza un desafío QR escaneado desde la app móvil',
  })
  async authorizeQrChallenge(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AuthorizeQrDto,
    @Req() req: Request,
  ) {
    const sessionMetadata = this.extractSessionMetadata(req);
    sessionMetadata.deviceName = sessionMetadata.deviceName || 'Navegador Web (Login QR)';

    return this.authService.authorizeQrChallenge(
      user.userId,
      dto.challengeId,
      sessionMetadata,
    );
  }

  @Get('qr-challenge/:challengeId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verifica el estado del desafío QR para la Web',
  })
  async getQrChallengeStatus(
    @Param('challengeId') challengeId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.getQrChallengeStatus(challengeId);

    if (result.status === 'AUTHORIZED' && result.tokens) {
      this.setTokenCookies(
        res,
        result.tokens.accessToken,
        result.tokens.refreshToken,
      );

      return {
        status: 'AUTHORIZED',
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
      };
    }

    return result;
  }

  // ======================================================
  // PERSONAL SECURITY LOGS
  // ======================================================

  @Get('security-logs')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtiene los registros personales de actividad y seguridad del usuario',
  })
  async getPersonalSecurityLogs(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getPersonalSecurityLogs(user.userId);
  }
}
