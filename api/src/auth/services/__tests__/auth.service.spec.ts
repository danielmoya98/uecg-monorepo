import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from '../../auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthTokenService } from '../auth-token.service';
import { AuthPasswordService } from '../auth-password.service';
import { AuthRecoveryService } from '../auth-recovery.service';
import { AuthMobileService } from '../auth-mobile.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let authTokenService: AuthTokenService;
  let jwtService: JwtService;
  let eventEmitter: EventEmitter2;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockAuthTokenService = {
    verifyPassword: jest.fn(),
    generateTokens: jest.fn(),
    validateRefreshToken: jest.fn(),
  };

  const mockAuthPasswordService = {
    setupNewPassword: jest.fn(),
  };

  const mockAuthRecoveryService = {
    requestPasswordReset: jest.fn(),
    resetPasswordWithCode: jest.fn(),
  };

  const mockAuthMobileService = {
    registerGuardian: jest.fn(),
    registerStudent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: AuthTokenService, useValue: mockAuthTokenService },
        { provide: AuthPasswordService, useValue: mockAuthPasswordService },
        { provide: AuthRecoveryService, useValue: mockAuthRecoveryService },
        { provide: AuthMobileService, useValue: mockAuthMobileService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);
    jwtService = module.get<JwtService>(JwtService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@uecg.edu.bo',
      password: 'hashed-password',
      fullName: 'Daniel Moya',
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      lockoutUntil: null,
      requiresPasswordChange: false,
      role: {
        name: 'SUPER_ADMIN',
        permissions: [
          {
            permission: {
              action: 'manage:all',
              subject: 'all',
            },
          },
        ],
      },
    };

    it('debe iniciar sesión exitosamente y emitir evento auth.login.success', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockAuthTokenService.verifyPassword.mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockAuthTokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
      });

      const result = await service.login('ADMIN@UECG.EDU.BO', 'password123');

      expect(result.status).toBe('SUCCESS');
      expect(result.user.email).toBe('admin@uecg.edu.bo');
      expect(result.tokens.accessToken).toBe('access-token-123');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'auth.login.success',
        expect.objectContaining({ userId: 'user-1', email: 'admin@uecg.edu.bo' }),
      );
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login('noexiste@uecg.edu.bo', 'password123'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.login.failed', {
        email: 'noexiste@uecg.edu.bo',
        reason: 'USER_NOT_FOUND',
      });
    });

    it('debe lanzar ForbiddenException si la cuenta está INACTIVE', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'INACTIVE',
      });

      await expect(
        service.login('admin@uecg.edu.bo', 'password123'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.login.failed', {
        email: 'admin@uecg.edu.bo',
        reason: 'ACCOUNT_DISABLED',
      });
    });

    it('debe lanzar ForbiddenException si la cuenta se encuentra bloqueada', async () => {
      const futureDate = new Date(Date.now() + 10 * 60000);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        lockoutUntil: futureDate,
      });

      await expect(
        service.login('admin@uecg.edu.bo', 'password123'),
      ).rejects.toThrow(ForbiddenException);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.account.locked', {
        userId: 'user-1',
        email: 'admin@uecg.edu.bo',
      });
    });

    it('debe incrementar intentos fallidos y bloquear la cuenta al llegar a 5', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 4,
      });
      mockAuthTokenService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login('admin@uecg.edu.bo', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          failedLoginAttempts: 5,
          lockoutUntil: expect.any(Date),
        }),
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.account.locked', {
        userId: 'user-1',
        email: 'admin@uecg.edu.bo',
      });
    });

    it('debe resetear los intentos fallidos a 1 (en vez de 6) si el periodo de bloqueo ya expiró', async () => {
      const pastDate = new Date(Date.now() - 5 * 60000);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        failedLoginAttempts: 5,
        lockoutUntil: pastDate,
      });
      mockAuthTokenService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login('admin@uecg.edu.bo', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          failedLoginAttempts: 1,
          lockoutUntil: null,
        },
      });
    });

    it('debe retornar SETUP_REQUIRED si el usuario requiere cambio de clave', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        requiresPasswordChange: true,
      });
      mockAuthTokenService.verifyPassword.mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('temp-setup-token');

      const result = await service.login('admin@uecg.edu.bo', 'pass123');

      expect(result.status).toBe('SETUP_REQUIRED');
      expect((result as any).setupToken).toBe('temp-setup-token');
    });
  });

  describe('refreshTokens', () => {
    it('debe rotar tokens exitosamente', async () => {
      mockAuthTokenService.validateRefreshToken.mockResolvedValue({ sub: 'user-1' });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@uecg.edu.bo',
        hashedRefreshToken: 'valid-hashed-refresh',
        role: { name: 'SUPER_ADMIN', permissions: [] },
      });
      mockAuthTokenService.verifyPassword.mockResolvedValue(true);
      mockAuthTokenService.generateTokens.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const result = await service.refreshTokens('incoming-refresh');

      expect(result.status).toBe('SUCCESS');
      expect(result.tokens.accessToken).toBe('new-access');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.refresh.success', {
        userId: 'user-1',
        email: 'admin@uecg.edu.bo',
      });
    });

    it('debe lanzar ForbiddenException si el refresh token hash no coincide', async () => {
      mockAuthTokenService.validateRefreshToken.mockResolvedValue({ sub: 'user-1' });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'admin@uecg.edu.bo',
        hashedRefreshToken: 'different-hash',
        role: { name: 'SUPER_ADMIN', permissions: [] },
      });
      mockAuthTokenService.verifyPassword.mockResolvedValue(false);

      await expect(service.refreshTokens('invalid-refresh')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('logout', () => {
    it('debe limpiar hashedRefreshToken y emitir evento auth.logout', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.logout('user-1');

      expect(result.status).toBe('SUCCESS');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { hashedRefreshToken: null },
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.logout', {
        userId: 'user-1',
      });
    });
  });
});
