import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { AuthRecoveryService } from '../auth-recovery.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EncryptionService } from '../../../common/services/encryption.service';
import { AuthTokenService } from '../auth-token.service';

describe('AuthRecoveryService', () => {
  let service: AuthRecoveryService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;
  let encryptionService: EncryptionService;
  let authTokenService: AuthTokenService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockEncryptionService = {
    generateBlindIndex: jest.fn((text) => `blind-${text}`),
  };

  const mockAuthTokenService = {
    hashPassword: jest.fn((p) => `hashed-${p}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRecoveryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: EncryptionService, useValue: mockEncryptionService },
        { provide: AuthTokenService, useValue: mockAuthTokenService },
      ],
    }).compile();

    service = module.get<AuthRecoveryService>(AuthRecoveryService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('requestPasswordReset', () => {
    it('debe enviar código y retornar status SUCCESS cuando el usuario existe por email', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'profesor@uecg.edu.bo',
        fullName: 'Profesor Uno',
        recoveryEmail: 'profesor.personal@gmail.com',
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.requestPasswordReset('profesor@uecg.edu.bo');

      expect(result.status).toBe('SUCCESS');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'auth.password_reset.requested',
        expect.objectContaining({
          email: 'profesor.personal@gmail.com',
          fullName: 'Profesor Uno',
          code: expect.any(String),
        }),
      );
    });

    it('debe buscar por User.ciHash si se proporciona un carnet de identidad', async () => {
      const mockUser = {
        id: 'user-2',
        email: 'director@uecg.edu.bo',
        fullName: 'Director General',
        recoveryEmail: null,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.requestPasswordReset('12345678');

      expect(result.status).toBe('SUCCESS');
      expect(mockEncryptionService.generateBlindIndex).toHaveBeenCalledWith('12345678');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'auth.password_reset.requested',
        expect.objectContaining({
          email: 'director@uecg.edu.bo',
        }),
      );
    });

    it('debe retornar mensaje genérico (anti-enumeración) si el usuario no existe', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.requestPasswordReset('fantasma@uecg.edu.bo');

      expect(result.status).toBe('SUCCESS');
      expect(result.message).toContain('Si la cuenta existe');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('resetPasswordWithCode', () => {
    it('debe actualizar la contraseña cuando el código OTP es válido', async () => {
      const rawCode = '123456';
      const hashedCode = await bcrypt.hash(rawCode, 10);
      const futureDate = new Date(Date.now() + 10 * 60000);

      const mockUser = {
        id: 'user-1',
        email: 'profesor@uecg.edu.bo',
        resetCode: hashedCode,
        resetCodeExpiresAt: futureDate,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.resetPasswordWithCode(
        'profesor@uecg.edu.bo',
        '123456',
        'NewStrongPassword123',
      );

      expect(result.status).toBe('SUCCESS');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          password: 'hashed-NewStrongPassword123',
          resetCode: null,
          resetCodeExpiresAt: null,
          failedLoginAttempts: 0,
        }),
      });
    });

    it('debe lanzar UnauthorizedException si el código está expirado', async () => {
      const pastDate = new Date(Date.now() - 5 * 60000);
      const mockUser = {
        id: 'user-1',
        email: 'profesor@uecg.edu.bo',
        resetCode: 'some-hash',
        resetCodeExpiresAt: pastDate,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.resetPasswordWithCode('profesor@uecg.edu.bo', '123456', 'newPass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el código OTP es incorrecto', async () => {
      const validCode = await bcrypt.hash('654321', 10);
      const futureDate = new Date(Date.now() + 10 * 60000);
      const mockUser = {
        id: 'user-1',
        email: 'profesor@uecg.edu.bo',
        resetCode: validCode,
        resetCodeExpiresAt: futureDate,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.resetPasswordWithCode('profesor@uecg.edu.bo', '000000', 'newPass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
