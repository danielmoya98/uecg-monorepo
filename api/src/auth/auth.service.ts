import {
  Injectable,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService, SessionMetadata } from './services/auth-token.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthMobileService } from './services/auth-mobile.service';
import { RegisterGuardianDto } from './dto/register-guardian.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { SetupInitialDirectorDto } from './dto/setup-initial-director.dto';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // ======================================================
  // LOGIN
  // ======================================================

  async login(email: string, pass: string, sessionMetadata?: SessionMetadata) {
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
    // MULTI-DEVICE SESSION TOKENS GENERATION
    // ======================================================

    this.logger.log(`🔐 Generando sesión multidispositivo para ${user.email}`);

    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.email,
      user.role?.name || 'GUEST',
      userPermissions,
      sessionMetadata,
    );

    // ======================================================
    // LOGIN SUCCESS EVENT
    // ======================================================

    this.eventEmitter.emit('auth.login.success', {
      userId: user.id,
      email: user.email,
      role: user.role?.name || 'GUEST',
      deviceType: sessionMetadata?.deviceType || 'UNKNOWN',
      ipAddress: sessionMetadata?.ipAddress,
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
  // REFRESH TOKENS (MULTI-DEVICE SAFE)
  // ======================================================

  async refreshTokens(refreshToken: string, sessionMetadata?: SessionMetadata) {
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

    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    // Buscar la sesión específica asociada al refresh token
    const matchingSession = await this.authTokenService.findMatchingSession(
      user.id,
      refreshToken,
    );

    if (!matchingSession) {
      this.eventEmitter.emit('auth.refresh.failed', {
        userId: user.id,
        email: user.email,
        reason: 'SESSION_NOT_FOUND',
      });

      throw new ForbiddenException('Sesión expirada o inválida');
    }

    const userPermissions =
      user.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    // Rotar tokens en la sesión existente
    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.email,
      user.role?.name || 'GUEST',
      userPermissions,
      {
        ...sessionMetadata,
        sessionId: matchingSession.id,
      },
    );

    // ======================================================
    // REFRESH SUCCESS
    // ======================================================

    this.eventEmitter.emit('auth.refresh.success', {
      userId: user.id,
      email: user.email,
      sessionId: matchingSession.id,
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
  // LOGOUT (SINGLE SESSION OR ALL)
  // ======================================================

  async logout(userId: string, currentRefreshToken?: string) {
    if (currentRefreshToken) {
      await this.authTokenService.revokeSessionByToken(userId, currentRefreshToken);
    } else {
      // Si no se especifica token, elimina todas las sesiones del usuario
      await this.prisma.userSession.deleteMany({
        where: { userId },
      });
    }

    this.eventEmitter.emit('auth.logout', {
      userId,
    });

    return {
      status: 'SUCCESS',
      message: 'Sesión cerrada exitosamente',
    };
  }

  // ======================================================
  // MULTI-DEVICE SESSION MANAGEMENT
  // ======================================================

  async getUserSessions(userId: string, currentRefreshToken?: string) {
    return this.authTokenService.getUserSessions(userId, currentRefreshToken);
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.authTokenService.revokeSession(userId, sessionId);
    return {
      status: 'SUCCESS',
      message: 'Sesión revocada exitosamente',
    };
  }

  async revokeAllOtherSessions(userId: string, currentRefreshToken: string) {
    await this.authTokenService.revokeAllOtherSessions(userId, currentRefreshToken);
    return {
      status: 'SUCCESS',
      message: 'Todas las demás sesiones han sido cerradas',
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

  // ======================================================
  // QR CODE CHALLENGE-RESPONSE LOGIN (WhatsApp Web Style)
  // ======================================================

  async createQrChallenge() {
    const challengeId = crypto.randomUUID();
    const key = `qr:challenge:${challengeId}`;

    // Guarda en caché Redis con estado PENDING por 300 segundos (5 minutos)
    await this.cacheManager.set(
      key,
      JSON.stringify({ status: 'PENDING', createdAt: new Date().toISOString() }),
      300000,
    );

    return {
      status: 'SUCCESS',
      challengeId,
      qrPayload: `uecg-web-auth:${challengeId}`,
      expiresIn: 300,
    };
  }

  async authorizeQrChallenge(
    userId: string,
    challengeId: string,
    sessionMetadata?: SessionMetadata,
  ) {
    const key = `qr:challenge:${challengeId}`;
    const rawData = await this.cacheManager.get<string>(key);

    if (!rawData) {
      throw new UnauthorizedException('El código QR ha expirado o no es válido');
    }

    let parsed: any;
    try {
      parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } catch {
      parsed = rawData;
    }

    if (parsed.status === 'AUTHORIZED') {
      if (parsed.user?.id === userId) {
        return {
          status: 'SUCCESS',
          message: 'Inicio de sesión en Web autorizado con éxito',
        };
      }
      throw new UnauthorizedException('El código QR ya ha sido autorizado por otro usuario');
    }

    if (parsed.status !== 'PENDING') {
      throw new UnauthorizedException('El código QR ya ha sido procesado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    const userPermissions = user.role.permissions.map(
      (rp) => `${rp.permission.action}:${rp.permission.subject}`,
    );

    // Generar tokens para la sesión Web autorizada
    const tokens = await this.authTokenService.generateTokens(
      user.id,
      user.email,
      user.role.name,
      userPermissions,
      sessionMetadata || {
        deviceType: 'WEB',
        deviceName: 'Navegador Web (Login QR)',
      },
    );

    // Actualizar estado en Redis a AUTHORIZED por 60 segundos
    await this.cacheManager.set(
      key,
      JSON.stringify({
        status: 'AUTHORIZED',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.name,
          permissions: userPermissions,
        },
        tokens,
      }),
      60000,
    );

    this.eventEmitter.emit('auth.qr.authorized', {
      userId: user.id,
      challengeId,
      deviceType: sessionMetadata?.deviceType || 'WEB',
    });

    return {
      status: 'SUCCESS',
      message: 'Inicio de sesión en Web autorizado con éxito',
    };
  }

  async getQrChallengeStatus(challengeId: string) {
    const key = `qr:challenge:${challengeId}`;
    const rawData = await this.cacheManager.get<string>(key);

    if (!rawData) {
      return { status: 'EXPIRED' };
    }

    let parsed: any;
    try {
      parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } catch {
      parsed = rawData;
    }

    if (parsed.status === 'PENDING') {
      return { status: 'PENDING' };
    }

    if (parsed.status === 'AUTHORIZED') {
      return {
        status: 'AUTHORIZED',
        user: parsed.user,
        tokens: parsed.tokens,
      };
    }

    return { status: 'EXPIRED' };
  }

  // ======================================================
  // PERSONAL SECURITY & ACTIVITY LOGS
  // ======================================================

  async getPersonalSecurityLogs(userId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        method: true,
        route: true,
        statusCode: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });

    return {
      status: 'SUCCESS',
      logs,
    };
  }

  // ======================================================
  // SYSTEM STATUS & INITIAL BOOTSTRAP WIZARD
  // ======================================================

  async getSystemStatus() {
    const [userCount, institutionCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.institution.count(),
    ]);

    return {
      isInitialized: userCount > 0 && institutionCount > 0,
      hasUsers: userCount > 0,
      hasInstitution: institutionCount > 0,
      userCount,
      institutionCount,
    };
  }

  async setupInitialDirector(
    dto: SetupInitialDirectorDto,
    sessionMetadata?: SessionMetadata,
  ) {
    const [userCount, institutionCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.institution.count(),
    ]);

    if (userCount > 0 && institutionCount > 0) {
      throw new ForbiddenException(
        'El sistema ya cuenta con usuarios e institución configurados.',
      );
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    // Buscar rol administrativo
    let role = await this.prisma.role.findFirst({
      where: { name: { in: ['SUPER_ADMIN', 'ADMINISTRADOR', 'DIRECTOR'] } },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Administrador Principal / Director',
        },
        include: { permissions: { include: { permission: true } } },
      });
    }

    const hashedPassword =
      await this.authTokenService.hashPassword(dto.password);

    // Transacción atómica de creación
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName: dto.fullName.trim(),
          password: hashedPassword,
          ci: dto.ci,
          phone: dto.phone,
          roleId: role.id,
          status: 'ACTIVE',
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      const institution = await tx.institution.create({
        data: {
          rueCode: dto.rueCode.trim(),
          name: dto.institutionName.trim(),
          dependencyType: dto.dependencyType,
          department: dto.department,
          municipality: dto.municipality.trim(),
          district: dto.district.trim(),
          address: dto.address.trim(),
          phone: dto.institutionPhone,
          email: dto.institutionEmail?.trim().toLowerCase(),
          foundedYear: dto.foundedYear,
          shifts: dto.shifts,
          levels: dto.levels,
          schedulingMode: dto.schedulingMode || 'FIXED_BASE',
          enableQrAttendance: dto.enableQrAttendance ?? true,
          lateToleranceMinutes: dto.lateToleranceMinutes ?? 5,
          absentToleranceMinutes: dto.absentToleranceMinutes ?? 15,
          directorId: user.id,
        },
      });

      return { user, institution };
    });

    const userPermissions =
      result.user.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    const tokens = await this.authTokenService.generateTokens(
      result.user.id,
      result.user.email,
      result.user.role?.name || 'SUPER_ADMIN',
      userPermissions,
      sessionMetadata,
    );

    return {
      status: 'SUCCESS',
      message: 'Sistema e institución inicializados exitosamente',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role?.name || 'SUPER_ADMIN',
        permissions: userPermissions,
      },
      institution: result.institution,
    };
  }
}

