import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './services/auth-token.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthMobileService } from './services/auth-mobile.service';
import { RegisterGuardianDto } from './dto/register-guardian.dto';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private authTokenService: AuthTokenService,
    private authPasswordService: AuthPasswordService,
    private authRecoveryService: AuthRecoveryService,
    private authMobileService: AuthMobileService,
  ) {}

  // ======================================================
  // LOGIN
  // ======================================================

  async login(email: string, pass: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // ======================================================
    // USER NOT FOUND
    // ======================================================

    if (!user) {
      this.eventEmitter.emit('auth.login.failed', {
        email: normalizedEmail,
        reason: 'USER_NOT_FOUND',
      });

      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // ======================================================
    // ACCOUNT DISABLED
    // ======================================================

    if (user.status === 'INACTIVE') {
      this.eventEmitter.emit('auth.login.failed', {
        email: normalizedEmail,
        reason: 'ACCOUNT_DISABLED',
      });

      throw new ForbiddenException('Cuenta desactivada');
    }

    // ======================================================
    // ACCOUNT LOCKED
    // ======================================================

    const now = new Date();

    if (user.lockoutUntil && user.lockoutUntil > now) {
      const remaining = Math.ceil(
        (user.lockoutUntil.getTime() - now.getTime()) / 60000,
      );

      this.eventEmitter.emit('auth.account.locked', {
        userId: user.id,
        email: user.email,
      });

      throw new ForbiddenException(
        `Cuenta bloqueada. Intente en ${remaining} minutos.`,
      );
    }

    // Si la ventana de bloqueo ya expiró, reiniciamos el conteo base de intentos a 0
    const currentFailedAttempts =
      user.lockoutUntil && user.lockoutUntil <= now
        ? 0
        : user.failedLoginAttempts;

    // ======================================================
    // PASSWORD VALIDATION
    // ======================================================

    const isMatch = await this.authTokenService.verifyPassword(
      pass,
      user.password,
    );

    // ======================================================
    // INVALID PASSWORD
    // ======================================================

    if (!isMatch) {
      const newAttempts = currentFailedAttempts + 1;
      let lockoutDate: Date | null = null;

      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        lockoutDate = new Date(
          Date.now() + this.LOCKOUT_DURATION_MINUTES * 60000,
        );

        this.eventEmitter.emit('auth.account.locked', {
          userId: user.id,
          email: user.email,
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockoutUntil: lockoutDate,
        },
      });

      this.eventEmitter.emit('auth.login.failed', {
        userId: user.id,
        email: user.email,
        reason: 'INVALID_PASSWORD',
      });

      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // ======================================================
    // RESET FAILED ATTEMPTS
    // ======================================================

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    // ======================================================
    // FORCE PASSWORD CHANGE
    // ======================================================

    if (user.requiresPasswordChange) {
      const setupToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'setup_password',
        },
        {
          expiresIn: '15m',
        },
      );

      return {
        status: 'SETUP_REQUIRED',
        message: 'Debe cambiar su contraseña',
        setupToken,
      };
    }

    // ======================================================
    // USER PERMISSIONS
    // ======================================================

    const userPermissions =
      user.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    // ======================================================
    // SESSION TOKENS GENERATION
    // ======================================================

    this.logger.log(`🔐 Generando nueva sesión para ${user.email}`);

    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.email,
      user.role?.name || 'GUEST',
      userPermissions,
    );

    // ======================================================
    // LOGIN SUCCESS EVENT
    // ======================================================

    this.eventEmitter.emit('auth.login.success', {
      userId: user.id,
      email: user.email,
      role: user.role?.name || 'GUEST',
    });

    return {
      status: 'SUCCESS',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role?.name || 'GUEST',
        permissions: userPermissions,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ======================================================
  // REFRESH TOKENS
  // ======================================================

  async refreshTokens(refreshToken: string) {
    const decoded =
      await this.authTokenService.validateRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Sesión inválida');
    }

    const isRefreshTokenValid = await this.authTokenService.verifyPassword(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      this.eventEmitter.emit('auth.refresh.failed', {
        userId: user.id,
        email: user.email,
      });

      throw new ForbiddenException('Refresh token inválido');
    }

    const userPermissions =
      user.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.email,
      user.role?.name || 'GUEST',
      userPermissions,
    );

    // ======================================================
    // REFRESH SUCCESS
    // ======================================================

    this.eventEmitter.emit('auth.refresh.success', {
      userId: user.id,
      email: user.email,
    });

    return {
      status: 'SUCCESS',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // ======================================================
  // SETUP PASSWORD
  // ======================================================

  async setupNewPassword(setupToken: string, newPasswordRaw: string) {
    return this.authPasswordService.setupNewPassword(
      setupToken,
      newPasswordRaw,
    );
  }

  // ======================================================
  // RECOVERY
  // ======================================================

  async requestPasswordReset(ciOrEmail: string) {
    return this.authRecoveryService.requestPasswordReset(ciOrEmail);
  }

  async resetPasswordWithCode(
    ciOrEmail: string,
    code: string,
    newPassword: string,
  ) {
    return this.authRecoveryService.resetPasswordWithCode(
      ciOrEmail,
      code,
      newPassword,
    );
  }

  // ======================================================
  // MOBILE REGISTER
  // ======================================================

  async registerGuardian(dto: RegisterGuardianDto) {
    return this.authMobileService.registerGuardian(dto);
  }

  async registerStudent(dto: RegisterStudentDto) {
    return this.authMobileService.registerStudent(dto);
  }

  // ======================================================
  // LOGOUT
  // ======================================================

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: null,
      },
    });

    this.eventEmitter.emit('auth.logout', {
      userId,
    });

    return {
      status: 'SUCCESS',
      message: 'Sesión cerrada exitosamente',
    };
  }

  // ======================================================
  // REGISTER FCM TOKEN
  // ======================================================

  async registerFcmToken(userId: string, fcmToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const currentTokens = user.fcmTokens || [];

    // ======================================================
    // AVOID DUPLICATES
    // ======================================================

    if (!currentTokens.includes(fcmToken)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          fcmTokens: [...currentTokens, fcmToken],
        },
      });

      this.eventEmitter.emit('auth.fcm.registered', {
        userId,
        token: fcmToken.substring(0, 20) + '...',
      });
    }

    return {
      status: 'SUCCESS',
      message: 'Dispositivo registrado',
    };
  }
}

