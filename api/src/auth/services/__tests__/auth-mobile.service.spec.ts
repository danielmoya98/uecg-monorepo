import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthMobileService } from '../auth-mobile.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EncryptionService } from '../../../common/services/encryption.service';
import { AuthTokenService } from '../auth-token.service';

describe('AuthMobileService', () => {
  let service: AuthMobileService;
  let prisma: PrismaService;
  let encryptionService: EncryptionService;
  let authTokenService: AuthTokenService;

  const mockPrismaService = {
    guardian: {
      findUnique: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  const mockEncryptionService = {
    generateBlindIndex: jest.fn((ci) => `blind-${ci}`),
  };

  const mockAuthTokenService = {
    hashPassword: jest.fn((p) => `hashed-${p}`),
    generateTokens: jest.fn(() => ({
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMobileService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EncryptionService, useValue: mockEncryptionService },
        { provide: AuthTokenService, useValue: mockAuthTokenService },
      ],
    }).compile();

    service = module.get<AuthMobileService>(AuthMobileService);
    prisma = module.get<PrismaService>(PrismaService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registerGuardian', () => {
    const dto = {
      ci: '7654321',
      password: 'passwordPadre123',
      recoveryEmail: 'padre@gmail.com',
    };

    it('debe registrar un tutor, generar credenciales y retornar tokens', async () => {
      mockPrismaService.guardian.findUnique.mockResolvedValue({
        id: 'guardian-uuid',
        names: 'Carlos',
        lastNamePaterno: 'Perez',
        ci: '7654321',
      });
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-padre-id', name: 'PADRE' });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-padre-uuid',
        email: 'familia.perez.321@uecg.edu.bo',
        fullName: 'Carlos Perez',
        role: { name: 'PADRE', permissions: [] },
      });

      const result = await service.registerGuardian(dto);

      expect(result.status).toBe('SUCCESS');
      expect(result.user.email).toBe('familia.perez.321@uecg.edu.bo');
      expect(result.tokens.accessToken).toBe('mock-access');
      expect(result.tokens.refreshToken).toBe('mock-refresh');
      expect(mockAuthTokenService.generateTokens).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el tutor no está registrado en el colegio', async () => {
      mockPrismaService.guardian.findUnique.mockResolvedValue(null);

      await expect(service.registerGuardian(dto)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si el tutor ya tiene una cuenta creada', async () => {
      mockPrismaService.guardian.findUnique.mockResolvedValue({
        id: 'guardian-uuid',
        names: 'Carlos',
      });
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'existing-user-id' });

      await expect(service.registerGuardian(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('registerStudent', () => {
    const dto = {
      ci: '8877665',
      birthDate: '2010-05-15',
      password: 'studentPassword123',
      recoveryEmail: 'alumno@gmail.com',
    };

    it('debe registrar un estudiante, generar credenciales y retornar tokens', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue({
        id: 'student-uuid',
        names: 'Mateo',
        lastNamePaterno: 'Gomez',
        ci: '8877665',
      });
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'role-student-id', name: 'ESTUDIANTE' });
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-student-uuid',
        email: 'mateo.gomez.665@uecg.edu.bo',
        fullName: 'Mateo Gomez',
        role: { name: 'ESTUDIANTE', permissions: [] },
      });

      const result = await service.registerStudent(dto);

      expect(result.status).toBe('SUCCESS');
      expect(result.user.email).toBe('mateo.gomez.665@uecg.edu.bo');
      expect(result.tokens.accessToken).toBe('mock-access');
      expect(result.tokens.refreshToken).toBe('mock-refresh');
      expect(mockAuthTokenService.generateTokens).toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si no coincide el CI y fecha de nacimiento', async () => {
      mockPrismaService.student.findFirst.mockResolvedValue(null);

      await expect(service.registerStudent(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
