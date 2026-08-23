import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthTokenService } from '../auth-token.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword & verifyPassword', () => {
    it('debe hashear una contraseña y verificarla correctamente con bcrypt', async () => {
      const password = 'mySecretPassword123';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isValid = await service.verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await service.verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('debe generar access y refresh tokens y guardar el hash en la BD', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('signed-access-token')
        .mockResolvedValueOnce('signed-refresh-token');

      mockPrismaService.user.update.mockResolvedValue({});

      const tokens = await service.generateTokens(
        'user-uuid',
        'test@uecg.edu.bo',
        'DOCENTE',
        ['read:all:Student'],
      );

      expect(tokens.accessToken).toBe('signed-access-token');
      expect(tokens.refreshToken).toBe('signed-refresh-token');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid' },
        data: {
          hashedRefreshToken: expect.any(String),
        },
      });
    });
  });

  describe('validateRefreshToken', () => {
    it('debe retornar el payload decodificado si el token es tipo refresh', async () => {
      const payload = { sub: 'user-1', email: 'test@uecg.edu.bo', type: 'refresh' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.validateRefreshToken('valid-refresh-token');
      expect(result).toEqual(payload);
    });

    it('debe lanzar UnauthorizedException si el token es de tipo access', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'access' });

      await expect(
        service.validateRefreshToken('access-token-presented-as-refresh'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si verifyAsync falla', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.validateRefreshToken('corrupted-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
