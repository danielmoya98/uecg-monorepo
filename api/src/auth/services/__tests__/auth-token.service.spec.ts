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
    userSession: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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
    it('debe generar tokens y crear un registro en userSession', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('signed-access-token')
        .mockResolvedValueOnce('signed-refresh-token');

      mockPrismaService.userSession.findMany.mockResolvedValue([]);
      mockPrismaService.userSession.create.mockResolvedValue({ id: 'sess-1' });

      const tokens = await service.generateTokens(
        'user-uuid',
        'test@uecg.edu.bo',
        'DOCENTE',
        ['read:all:Student'],
        {
          deviceType: 'WEB',
          deviceName: 'Chrome en Windows',
          ipAddress: '192.168.1.1',
        },
      );

      expect(tokens.accessToken).toBe('signed-access-token');
      expect(tokens.refreshToken).toBe('signed-refresh-token');
      expect(mockPrismaService.userSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-uuid',
          deviceType: 'WEB',
          deviceName: 'Chrome en Windows',
          ipAddress: '192.168.1.1',
        }),
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

  describe('multi-device sessions', () => {
    it('debe listar las sesiones activas del usuario identificando la sesión actual', async () => {
      const sampleHash = await service.hashPassword('curr-refresh');
      mockPrismaService.userSession.findMany.mockResolvedValue([
        {
          id: 'sess-1',
          userId: 'user-1',
          deviceType: 'WEB',
          deviceName: 'Chrome',
          ipAddress: '127.0.0.1',
          userAgent: 'Chrome/120',
          lastActiveAt: new Date(),
          createdAt: new Date(),
          hashedRefreshToken: sampleHash,
        },
        {
          id: 'sess-2',
          userId: 'user-1',
          deviceType: 'MOBILE_ANDROID',
          deviceName: 'Samsung S23',
          ipAddress: '192.168.1.5',
          userAgent: 'Dart/3.0',
          lastActiveAt: new Date(),
          createdAt: new Date(),
          hashedRefreshToken: 'other-hash',
        },
      ]);

      const sessions = await service.getUserSessions('user-1', 'curr-refresh');

      expect(sessions).toHaveLength(2);
      expect(sessions[0].isCurrent).toBe(true);
      expect(sessions[1].isCurrent).toBe(false);
    });
  });
});
