import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RolesService } from '../roles.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  // Objeto Mock de PrismaService
  const mockPrismaService = {
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    rolePermission: {
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar la lista de roles ordenados', async () => {
      const mockRoles = [
        { id: '1', name: 'SUPER_ADMIN', description: 'Root' },
        { id: '2', name: 'DOCENTE', description: 'Profesor' },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.role.findMany.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(mockPrismaService.role.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('getPermissionsCatalog', () => {
    it('debe retornar el catálogo ordenado por subject y action', async () => {
      const mockPermissions = [
        { id: 'p1', action: 'read:all', subject: 'Student' },
        { id: 'p2', action: 'write:any', subject: 'Student' },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.permission.findMany.mockResolvedValue(mockPermissions);

      const result = await service.getPermissionsCatalog();

      expect(result).toEqual(mockPermissions);
      expect(mockPrismaService.permission.findMany).toHaveBeenCalledWith({
        orderBy: [{ subject: 'asc' }, { action: 'asc' }],
      });
    });
  });

  describe('updateRolePermissions', () => {
    it('debe lanzar NotFoundException si el rol no existe', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRolePermissions('role-invalido', ['p1', 'p2']),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar los permisos del rol mediante transacción', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-1',
        name: 'DOCENTE',
      });

      const result = await service.updateRolePermissions('role-1', [
        'p1',
        'p2',
      ]);

      expect(result).toEqual({
        message: 'Permisos del rol actualizados correctamente',
      });
      expect(mockPrismaService.rolePermission.deleteMany).toHaveBeenCalledWith({
        where: { roleId: 'role-1' },
      });
      expect(mockPrismaService.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 'role-1', permissionId: 'p1' },
          { roleId: 'role-1', permissionId: 'p2' },
        ],
      });
      expect(mockCacheManager.del).toHaveBeenCalled();
    });
  });

  describe('createRole', () => {
    it('debe lanzar ConflictException si el rol ya existe', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-1',
        name: 'SECRETARIA',
      });

      await expect(
        service.createRole({ name: 'Secretaria', description: 'Admin' }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe crear un rol sanitizando su nombre a UPPERCASE y guiones bajos', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);
      mockPrismaService.role.create.mockResolvedValue({
        id: 'role-2',
        name: 'AUXILIAR_LIMPIEZA',
        description: 'Personal de apoyo',
      });

      const result = await service.createRole({
        name: 'Auxiliar Limpieza',
        description: 'Personal de apoyo',
      });

      expect(result.name).toBe('AUXILIAR_LIMPIEZA');
      expect(mockPrismaService.role.create).toHaveBeenCalledWith({
        data: {
          name: 'AUXILIAR_LIMPIEZA',
          description: 'Personal de apoyo',
        },
      });
    });
  });

  describe('deleteRole', () => {
    it('debe lanzar NotFoundException si el rol no existe', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(service.deleteRole('role-fantasma')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si se intenta eliminar un rol protegido del sistema', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-superadmin',
        name: 'SUPER_ADMIN',
        _count: { users: 0 },
      });

      await expect(service.deleteRole('role-superadmin')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el rol tiene usuarios asignados', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-custom',
        name: 'PASANTE',
        _count: { users: 3 },
      });

      await expect(service.deleteRole('role-custom')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe eliminar el rol exitosamente si cumple todas las validaciones', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-custom',
        name: 'PASANTE',
        _count: { users: 0 },
      });
      mockPrismaService.role.delete.mockResolvedValue({});

      const result = await service.deleteRole('role-custom');

      expect(result).toEqual({
        message: 'Política de acceso eliminada del sistema',
      });
      expect(mockPrismaService.role.delete).toHaveBeenCalledWith({
        where: { id: 'role-custom' },
      });
    });
  });
});
