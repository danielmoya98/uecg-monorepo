import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from '../roles.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: PrismaService;

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
        { id: '2', name: 'DIRECTOR', description: 'Dirección' },
      ];
      mockPrismaService.role.findMany.mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(result).toEqual(mockRoles);
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        include: {
          _count: { select: { users: true } },
          permissions: { include: { permission: true } },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getPermissionsCatalog', () => {
    it('debe retornar el catálogo de permisos ordenado', async () => {
      const mockPermissions = [
        { id: 'p1', action: 'read:all', subject: 'Student' },
        { id: 'p2', action: 'write:any', subject: 'Enrollment' },
      ];
      mockPrismaService.permission.findMany.mockResolvedValue(mockPermissions);

      const result = await service.getPermissionsCatalog();

      expect(result).toEqual(mockPermissions);
      expect(prisma.permission.findMany).toHaveBeenCalledWith({
        orderBy: [{ subject: 'asc' }, { action: 'asc' }],
      });
    });
  });

  describe('createRole', () => {
    it('debe crear un rol con el nombre normalizado a mayúsculas y guiones bajos', async () => {
      const payload = {
        name: 'psicologo escolar ',
        description: 'Apoyo pedagógico',
      };
      const expectedName = 'PSICOLOGO_ESCOLAR';

      mockPrismaService.role.findUnique.mockResolvedValue(null);
      mockPrismaService.role.create.mockResolvedValue({
        id: 'new-id',
        ...payload,
        name: expectedName,
      });

      const result = await service.createRole(payload);

      expect(result.name).toBe(expectedName);
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { name: expectedName },
      });
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: {
          name: expectedName,
          description: payload.description,
        },
      });
    });

    it('debe lanzar una excepción ConflictException si el nombre ya existe', async () => {
      const payload = { name: 'DIRECTOR', description: 'Director General' };
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'exist-id',
        name: 'DIRECTOR',
      });

      await expect(service.createRole(payload)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteRole', () => {
    it('debe lanzar NotFoundException si el rol no existe', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(service.deleteRole('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si el rol es un rol protegido del sistema', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'super-admin-id',
        name: 'SUPER_ADMIN',
        _count: { users: 0 },
      });

      await expect(service.deleteRole('super-admin-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el rol tiene usuarios asignados', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-id',
        name: 'CUSTOM_ROLE',
        _count: { users: 5 }, // 5 usuarios asignados
      });

      await expect(service.deleteRole('role-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe eliminar el rol exitosamente si pasa todos los escudos', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-id',
        name: 'CUSTOM_ROLE',
        _count: { users: 0 },
      });
      mockPrismaService.role.delete.mockResolvedValue({ id: 'role-id' });

      const result = await service.deleteRole('role-id');

      expect(result).toEqual({
        message: 'Política de acceso eliminada del sistema',
      });
      expect(prisma.role.delete).toHaveBeenCalledWith({
        where: { id: 'role-id' },
      });
    });
  });

  describe('updateRolePermissions', () => {
    it('debe lanzar NotFoundException si el rol a actualizar no existe', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRolePermissions('non-existent', ['p1']),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe purgar y recrear los permisos dentro de una transacción ACID', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'role-id',
        name: 'DOCENTE',
      });
      mockPrismaService.rolePermission.deleteMany.mockResolvedValue({
        count: 2,
      });
      mockPrismaService.rolePermission.createMany.mockResolvedValue({
        count: 3,
      });

      const permissionIds = ['p1', 'p2', 'p3'];
      const result = await service.updateRolePermissions(
        'role-id',
        permissionIds,
      );

      expect(result).toEqual({
        message: 'Permisos del rol actualizados correctamente',
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
        where: { roleId: 'role-id' },
      });
      expect(prisma.rolePermission.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 'role-id', permissionId: 'p1' },
          { roleId: 'role-id', permissionId: 'p2' },
          { roleId: 'role-id', permissionId: 'p3' },
        ],
      });
    });
  });
});
