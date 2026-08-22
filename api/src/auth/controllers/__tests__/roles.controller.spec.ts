import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../../services/roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  // Mock object for RolesService
  const mockRolesService = {
    findAll: jest.fn(),
    getPermissionsCatalog: jest.fn(),
    updateRolePermissions: jest.fn(),
    createRole: jest.fn(),
    deleteRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);

    // Clear all mock history
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe delegar en RolesService.findAll y retornar los roles', async () => {
      const mockRoles = [
        { id: '1', name: 'SUPER_ADMIN', description: 'Root' },
        { id: '2', name: 'DIRECTOR', description: 'Dirección' },
      ];
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(result).toEqual(mockRoles);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPermissionsCatalog', () => {
    it('debe delegar en RolesService.getPermissionsCatalog y retornar el catálogo', async () => {
      const mockCatalog = [
        {
          id: 'p1',
          action: 'read:all',
          subject: 'Student',
          description: 'Ver estudiantes',
        },
      ];
      mockRolesService.getPermissionsCatalog.mockResolvedValue(mockCatalog);

      const result = await controller.getPermissionsCatalog();

      expect(result).toEqual(mockCatalog);
      expect(service.getPermissionsCatalog).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRole', () => {
    it('debe delegar en RolesService.createRole con el DTO y retornar el rol creado', async () => {
      const dto = { name: 'NUEVO_ROL', description: 'Descripción de prueba' };
      const mockCreated = { id: 'uuid-1', ...dto };
      mockRolesService.createRole.mockResolvedValue(mockCreated);

      const result = await controller.createRole(dto);

      expect(result).toEqual(mockCreated);
      expect(service.createRole).toHaveBeenCalledWith(dto);
    });
  });

  describe('updatePermissions', () => {
    it('debe delegar en RolesService.updateRolePermissions con el ID y los IDs de permisos', async () => {
      const roleId = 'uuid-role';
      const dto = { permissionIds: ['p1', 'p2'] };
      const mockResponse = {
        message: 'Permisos del rol actualizados correctamente',
      };
      mockRolesService.updateRolePermissions.mockResolvedValue(mockResponse);

      const result = await controller.updatePermissions(roleId, dto);

      expect(result).toEqual(mockResponse);
      expect(service.updateRolePermissions).toHaveBeenCalledWith(
        roleId,
        dto.permissionIds,
      );
    });
  });

  describe('deleteRole', () => {
    it('debe delegar en RolesService.deleteRole y retornar confirmación', async () => {
      const roleId = 'uuid-role-to-delete';
      const mockResponse = {
        message: 'Política de acceso eliminada del sistema',
      };
      mockRolesService.deleteRole.mockResolvedValue(mockResponse);

      const result = await controller.deleteRole(roleId);

      expect(result).toEqual(mockResponse);
      expect(service.deleteRole).toHaveBeenCalledWith(roleId);
    });
  });
});
