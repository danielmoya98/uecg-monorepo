import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import * as bcrypt from 'bcrypt';

// Mock bcrypt for fast password validation tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService - Pruebas Unitarias y de Jerarquía ABAC', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    userSession: {
      deleteMany: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((input) =>
      typeof input === 'function' ? input(mockPrisma) : Promise.all(input),
    ),
  };

  const mockEncryption = {
    encrypt: jest.fn((val) => `encrypted_${val}`),
    decrypt: jest.fn((val) => val?.replace('encrypted_', '')),
    generateBlindIndex: jest.fn((val) => `hash_${val}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('validateHierarchy (Jerarquía Administrativa ABAC)', () => {
    it('debe permitir que un SUPER_ADMIN gestione a cualquier usuario', async () => {
      const requestingUser: AuthenticatedUser = {
        userId: 'admin-id',
        email: 'super@uecg.edu.bo',
        role: 'SUPER_ADMIN',
        permissions: ['manage:all:all'],
      };

      const targetUser = {
        id: 'target-id',
        fullName: 'Director Target',
        role: { name: 'DIRECTOR' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      // Si no lanza excepción, el acceso es exitoso
      await expect(
        service.reactivate('target-id', requestingUser),
      ).resolves.not.toThrow();
    });

    it('debe permitir que un DIRECTOR gestione a un DOCENTE', async () => {
      const requestingUser: AuthenticatedUser = {
        userId: 'director-id',
        email: 'director@uecg.edu.bo',
        role: 'DIRECTOR',
        permissions: ['manage:own:User'],
      };

      const targetUser = {
        id: 'teacher-id',
        fullName: 'Docente Target',
        role: { name: 'DOCENTE' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      await expect(
        service.reactivate('teacher-id', requestingUser),
      ).resolves.not.toThrow();
    });

    it('debe PROHIBIR que un DIRECTOR gestione a un SUPER_ADMIN', async () => {
      const requestingUser: AuthenticatedUser = {
        userId: 'director-id',
        email: 'director@uecg.edu.bo',
        role: 'DIRECTOR',
        permissions: ['manage:own:User'],
      };

      const targetUser = {
        id: 'super-id',
        fullName: 'Super Admin Target',
        role: { name: 'SUPER_ADMIN' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      await expect(
        service.reactivate('super-id', requestingUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe PROHIBIR que un DIRECTOR gestione a otro DIRECTOR', async () => {
      const requestingUser: AuthenticatedUser = {
        userId: 'director-id',
        email: 'director@uecg.edu.bo',
        role: 'DIRECTOR',
        permissions: ['manage:own:User'],
      };

      const targetUser = {
        id: 'another-director-id',
        fullName: 'Otro Director Target',
        role: { name: 'DIRECTOR' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      await expect(
        service.reactivate('another-director-id', requestingUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe PROHIBIR que cualquier otro rol (ej. DOCENTE) realice acciones administrativas', async () => {
      const requestingUser: AuthenticatedUser = {
        userId: 'docente-id',
        email: 'docente@uecg.edu.bo',
        role: 'DOCENTE',
        permissions: ['read:own:Dashboard'],
      };

      const targetUser = {
        id: 'target-id',
        fullName: 'Target User',
        role: { name: 'DOCENTE' },
      };

      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      await expect(
        service.reactivate('target-id', requestingUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Operaciones de Perfil (getProfile, updateProfile, changePassword)', () => {
    describe('getProfile', () => {
      it('debe desencriptar y retornar la información del perfil del usuario', async () => {
        const mockDbUser = {
          id: 'userId-1',
          fullName: 'Juan Perez',
          email: 'juan@uecg.edu.bo',
          status: 'ACTIVE',
          ci: 'encrypted_12345',
          phone: 'encrypted_77777',
          address: 'encrypted_Calle Principal',
          specialty: 'MATEMATICAS',
          role: { name: 'DOCENTE' },
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);

        const result = await service.getProfile('userId-1');

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'userId-1' },
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
            ci: true,
            phone: true,
            address: true,
            specialty: true,
            role: { select: { name: true } },
          },
        });
        expect(result.fullName).toBe('Juan Perez');
        expect(result.ci).toBe('12345'); // Desencriptado
        expect(result.role).toBe('DOCENTE');
        expect(mockEncryption.decrypt).toHaveBeenCalledTimes(3);
      });

      it('debe lanzar NotFoundException si el usuario no existe', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(service.getProfile('non-existent')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateProfile', () => {
      it('debe encriptar los datos sensibles y actualizar el perfil del usuario', async () => {
        const updateDto = {
          fullName: 'Juan Perez Modificado',
          ci: '54321',
          phone: '66666',
          address: 'Nueva Calle',
        };

        const mockUpdatedDbUser = {
          id: 'userId-1',
          fullName: 'Juan Perez Modificado',
          email: 'juan@uecg.edu.bo',
          ci: 'encrypted_54321',
          phone: 'encrypted_66666',
          address: 'encrypted_Nueva Calle',
          specialty: 'MATEMATICAS',
          role: { name: 'DOCENTE' },
        };

        mockPrisma.user.update.mockResolvedValue(mockUpdatedDbUser);

        const result = await service.updateProfile('userId-1', updateDto);

        expect(mockEncryption.encrypt).toHaveBeenCalledWith('54321');
        expect(mockEncryption.encrypt).toHaveBeenCalledWith('66666');
        expect(mockEncryption.encrypt).toHaveBeenCalledWith('Nueva Calle');
        expect(mockEncryption.generateBlindIndex).toHaveBeenCalledWith('54321');

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'userId-1' },
          data: {
            fullName: 'Juan Perez Modificado',
            ci: 'encrypted_54321',
            ciHash: 'hash_54321',
            phone: 'encrypted_66666',
            address: 'encrypted_Nueva Calle',
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            ci: true,
            phone: true,
            address: true,
            specialty: true,
            role: { select: { name: true } },
          },
        });

        expect(result.message).toBe('Perfil actualizado');
        expect(result.user.fullName).toBe('Juan Perez Modificado');
        expect(result.user.ci).toBe('54321'); // Desencriptado
      });
    });

    describe('changePassword', () => {
      it('debe actualizar la contraseña si la contraseña actual es correcta', async () => {
        const mockDbUser = {
          id: 'userId-1',
          password: 'hashed_current_password',
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password');

        const result = await service.changePassword('userId-1', {
          currentPassword: 'currentPassword123',
          newPassword: 'newPassword123',
        });

        expect(bcrypt.compare).toHaveBeenCalledWith(
          'currentPassword123',
          'hashed_current_password',
        );
        expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'userId-1' },
          data: { password: 'hashed_new_password' },
        });
        expect(result.message).toBe('Contraseña actualizada correctamente');
      });

      it('debe lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
        const mockDbUser = {
          id: 'userId-1',
          password: 'hashed_current_password',
        };

        mockPrisma.user.findUnique.mockResolvedValue(mockDbUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(
          service.changePassword('userId-1', {
            currentPassword: 'wrongPassword',
            newPassword: 'newPassword123',
          }),
        ).rejects.toThrow(UnauthorizedException);

        expect(mockPrisma.user.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('Operaciones Administrativas con Invalidación de Sesiones', () => {
    const adminUser: AuthenticatedUser = {
      userId: 'admin-id',
      email: 'admin@uecg.edu.bo',
      role: 'SUPER_ADMIN',
      permissions: ['manage:all:all'],
    };

    describe('remove', () => {
      it('debe desactivar el usuario e invalidar todas sus sesiones activas', async () => {
        const targetUser = {
          id: 'user-to-disable',
          fullName: 'Docente Inactivo',
          role: { name: 'DOCENTE' },
        };

        mockPrisma.user.findUnique.mockResolvedValue(targetUser);

        const result = await service.remove('user-to-disable', adminUser);

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'user-to-disable' },
          include: { role: true },
        });
        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'user-to-disable' },
          data: { status: 'INACTIVE' },
        });
        expect(mockPrisma.userSession.deleteMany).toHaveBeenCalledWith({
          where: { userId: 'user-to-disable' },
        });
        expect(result.message).toBe('Usuario desactivado exitosamente');
      });
    });

    describe('resetPassword', () => {
      it('debe generar una clave temporal segura con crypto, hashearla e invalidar sesiones', async () => {
        const targetUser = {
          id: 'user-reset-id',
          fullName: 'Profesor Carlos',
          role: { name: 'DOCENTE' },
        };

        mockPrisma.user.findUnique.mockResolvedValue(targetUser);
        (bcrypt.genSalt as jest.Mock).mockResolvedValue('random_salt');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_temp_password');

        const result = await service.resetPassword('user-reset-id', adminUser);

        expect(result.message).toBe('Credenciales restauradas');
        expect(result.fullName).toBe('Profesor Carlos');
        expect(result.newPassword).toBeDefined();
        expect(typeof result.newPassword).toBe('string');
        expect(result.newPassword.length).toBe(12); // crypto.randomBytes(6).toString('hex') = 12 hex chars

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith(result.newPassword, 'random_salt');
        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'user-reset-id' },
          data: {
            password: 'hashed_temp_password',
            requiresPasswordChange: true,
          },
        });
        expect(mockPrisma.userSession.deleteMany).toHaveBeenCalledWith({
          where: { userId: 'user-reset-id' },
        });
      });
    });
  });
});

