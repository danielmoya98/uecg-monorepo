import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Shift,
  EducationLevel,
  DependencyType,
  Department,
} from '../../prisma/generated/client';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;
  let service: InstitutionsService;

  const mockInstitutionsService = {
    getCampaignSettings: jest.fn(),
    updateCampaignSettings: jest.fn(),
    getAttendanceSettings: jest.fn(),
    updateAttendanceSettings: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCacheManager = {
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        { provide: InstitutionsService, useValue: mockInstitutionsService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<InstitutionsController>(InstitutionsController);
    service = module.get<InstitutionsService>(InstitutionsService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getCampaignSettings', () => {
    it('debe delegar en InstitutionsService.getCampaignSettings', async () => {
      const mockResult = {
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 2,
        activeNotificationChannels: ['PUSH_APP'],
      };
      mockInstitutionsService.getCampaignSettings.mockResolvedValue(mockResult);

      const result = await controller.getCampaignSettings();

      expect(result).toEqual(mockResult);
      expect(service.getCampaignSettings).toHaveBeenCalled();
    });
  });

  describe('updateCampaignSettings', () => {
    it('debe actualizar los ajustes e invalidar la caché', async () => {
      const mockResult = { success: true };
      mockInstitutionsService.updateCampaignSettings.mockResolvedValue(
        mockResult,
      );

      const reqMock = { user: { userId: 'admin-id' } };
      const dto = { enableDigitalRudeUpdates: true };
      const result = await controller.updateCampaignSettings(
        dto,
        reqMock as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.updateCampaignSettings).toHaveBeenCalledWith(
        dto,
        'admin-id',
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('getAttendanceSettings', () => {
    it('debe delegar en InstitutionsService.getAttendanceSettings', async () => {
      const mockResult = {
        enableQrAttendance: true,
        enableBiometricAttendance: false,
        lateToleranceMinutes: 5,
        absentToleranceMinutes: 15,
        notificationFrequency: 'ALERTS_ONLY',
      };
      mockInstitutionsService.getAttendanceSettings.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getAttendanceSettings();

      expect(result).toEqual(mockResult);
      expect(service.getAttendanceSettings).toHaveBeenCalled();
    });
  });

  describe('updateAttendanceSettings', () => {
    it('debe actualizar los ajustes de asistencia e invalidar la caché', async () => {
      const mockResult = { success: true };
      mockInstitutionsService.updateAttendanceSettings.mockResolvedValue(
        mockResult,
      );

      const reqMock = { user: { userId: 'admin-id' } };
      const dto = { lateToleranceMinutes: 10 };
      const result = await controller.updateAttendanceSettings(
        dto,
        reqMock as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.updateAttendanceSettings).toHaveBeenCalledWith(
        dto,
        'admin-id',
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debe asignar directorId por defecto al creador si se omite y registrar', async () => {
      const mockResult = { id: 'inst-id' };
      mockInstitutionsService.create.mockResolvedValue(mockResult);

      const reqMock = { user: { userId: 'admin-id' } };
      const dto = {
        rueCode: '80730145',
        name: 'Escuela',
        dependencyType: DependencyType.FISCAL,
        department: Department.CHUQUISACA,
        municipality: 'Sucre',
        district: 'Sucre 1',
        address: 'Zona Villa Armonía',
        shifts: [Shift.MANANA],
        levels: [EducationLevel.PRIMARIA],
      };

      const result = await controller.create(dto, reqMock as any);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(
        {
          ...dto,
          directorId: 'admin-id',
        },
        'admin-id',
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });

    it('debe mantener el directorId proveído en el DTO sin pisarlo', async () => {
      const mockResult = { id: 'inst-id' };
      mockInstitutionsService.create.mockResolvedValue(mockResult);

      const reqMock = { user: { userId: 'admin-id' } };
      const dto = {
        rueCode: '80730145',
        name: 'Escuela',
        dependencyType: DependencyType.FISCAL,
        department: Department.CHUQUISACA,
        municipality: 'Sucre',
        district: 'Sucre 1',
        address: 'Zona Villa Armonía',
        shifts: [Shift.MANANA],
        levels: [EducationLevel.PRIMARIA],
        directorId: 'director-uuid',
      };

      const result = await controller.create(dto, reqMock as any);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(
        {
          ...dto,
          directorId: 'director-uuid',
        },
        'admin-id',
      );
    });
  });

  describe('findAll', () => {
    it('debe obtener todos los RUEs con paginación', async () => {
      const mockResult = { data: [] };
      mockInstitutionsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('debe obtener una institución por ID', async () => {
      const mockResult = { id: 'inst-id' };
      mockInstitutionsService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('inst-id');

      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith('inst-id');
    });
  });

  describe('update', () => {
    it('debe actualizar los datos sin pisar el directorId con el ID del solicitante', async () => {
      const mockResult = { success: true };
      mockInstitutionsService.update.mockResolvedValue(mockResult);

      const reqMock = { user: { userId: 'admin-id' } };
      const dto = { name: 'Nombre Modificado' };
      const result = await controller.update(
        'inst-id',
        dto,
        reqMock as any,
      );

      expect(result).toEqual(mockResult);
      expect(service.update).toHaveBeenCalledWith('inst-id', dto, 'admin-id');
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });
});
