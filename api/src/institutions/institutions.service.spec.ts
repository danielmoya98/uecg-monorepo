import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../prisma/prisma.service';
import { InstitutionConfigService } from './institution-config.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  Shift,
  EducationLevel,
  SchedulingMode,
  DependencyType,
  Department,
} from '../../prisma/generated/client';

describe('InstitutionsService', () => {
  let service: InstitutionsService;

  const mockInstitution = {
    id: 'inst-uuid',
    rueCode: '80730145',
    name: 'Unidad Educativa Che Guevara',
    dependencyType: DependencyType.FISCAL,
    department: Department.CHUQUISACA,
    municipality: 'Sucre',
    district: 'Sucre 1',
    address: 'Zona Villa Armonía',
    phone: '46452311',
    email: 'colegio@uecheguevara.bo',
    foundedYear: 2005,
    shifts: [Shift.MANANA, Shift.TARDE],
    levels: [EducationLevel.PRIMARIA, EducationLevel.SECUNDARIA],
    directorId: 'director-uuid',
    schedulingMode: SchedulingMode.FIXED_BASE,
    enableDigitalRudeUpdates: false,
    maxRudeUpdatesPerYear: 2,
    activeNotificationChannels: ['PUSH_APP'],
    enableQrAttendance: false,
    enableBiometricAttendance: false,
    lateToleranceMinutes: 5,
    absentToleranceMinutes: 15,
    notificationFrequency: 'ALERTS_ONLY',
  };

  const mockPrisma = {
    institution: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
    invalidate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: InstitutionConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe registrar una nueva institución exitosamente', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(null);
      mockPrisma.institution.create.mockResolvedValue(mockInstitution);

      const dto = {
        rueCode: '80730145',
        name: 'Unidad Educativa Che Guevara',
        dependencyType: DependencyType.FISCAL,
        department: Department.CHUQUISACA,
        municipality: 'Sucre',
        district: 'Sucre 1',
        address: 'Zona Villa Armonía',
        shifts: [Shift.MANANA],
        levels: [EducationLevel.PRIMARIA],
      };

      const result = await service.create(dto);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { rueCode: dto.rueCode },
      });
      expect(mockPrisma.institution.create).toHaveBeenCalledWith({ data: dto });
      expect(result.message).toBe('Institución registrada exitosamente');
      expect(result.data).toEqual(mockInstitution);
    });

    it('debe lanzar ConflictException si el RUE ya está registrado', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);

      const dto = {
        rueCode: '80730145',
        name: 'Otra Escuela',
        dependencyType: DependencyType.FISCAL,
        department: Department.CHUQUISACA,
        municipality: 'Sucre',
        district: 'Sucre 1',
        address: 'Calle Falsa 123',
        shifts: [Shift.MANANA],
        levels: [EducationLevel.PRIMARIA],
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.institution.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar instituciones con metadatos de paginación', async () => {
      mockPrisma.institution.count.mockResolvedValue(1);
      mockPrisma.institution.findMany.mockResolvedValue([mockInstitution]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockPrisma.institution.count).toHaveBeenCalled();
      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { director: { select: { fullName: true, email: true } } },
      });
      expect(result.meta.total).toBe(1);
      expect(result.data).toEqual([mockInstitution]);
    });
  });

  describe('findOne', () => {
    it('debe obtener una institución por ID', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);

      const result = await service.findOne('inst-uuid');

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: 'inst-uuid' },
        include: { director: { select: { fullName: true, email: true } } },
      });
      expect(result.data).toEqual(mockInstitution);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await expect(service.findOne('inst-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar los datos de la institución', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrisma.institution.update.mockResolvedValue({
        ...mockInstitution,
        name: 'Nombre Modificado',
      });

      const dto = { name: 'Nombre Modificado' };
      const result = await service.update('inst-uuid', dto as any);

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: 'inst-uuid' },
      });
      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: 'inst-uuid' },
        data: dto,
      });
      expect(result.data.name).toBe('Nombre Modificado');
    });

    it('debe lanzar NotFoundException al actualizar si no existe', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await expect(service.update('inst-uuid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCampaignSettings', () => {
    it('debe retornar los ajustes de campaña de la institución', async () => {
      mockConfigService.get.mockResolvedValue(mockInstitution);

      const result = await service.getCampaignSettings();

      expect(mockConfigService.get).toHaveBeenCalled();
      expect(result.enableDigitalRudeUpdates).toBe(
        mockInstitution.enableDigitalRudeUpdates,
      );
      expect(result.maxRudeUpdatesPerYear).toBe(
        mockInstitution.maxRudeUpdatesPerYear,
      );
    });
  });

  describe('updateCampaignSettings', () => {
    it('debe actualizar los ajustes de campaña e invalidar la caché', async () => {
      mockConfigService.get.mockResolvedValue(mockInstitution);
      mockPrisma.institution.update.mockResolvedValue({
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 3,
        activeNotificationChannels: ['EMAIL'],
      });

      const payload = {
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 3,
        activeNotificationChannels: ['EMAIL'],
      };

      const result = await service.updateCampaignSettings(payload);

      expect(mockPrisma.institution.update).toHaveBeenCalled();
      expect(mockConfigService.invalidate).toHaveBeenCalled();
      expect(result.message).toBe(
        'Configuración de la Campaña RUDE actualizada exitosamente',
      );
    });
  });

  describe('getAttendanceSettings', () => {
    it('debe obtener los ajustes de tolerancia y asistencia', async () => {
      mockConfigService.get.mockResolvedValue(mockInstitution);

      const result = await service.getAttendanceSettings();

      expect(result.lateToleranceMinutes).toBe(
        mockInstitution.lateToleranceMinutes,
      );
      expect(result.absentToleranceMinutes).toBe(
        mockInstitution.absentToleranceMinutes,
      );
    });
  });

  describe('updateAttendanceSettings', () => {
    it('debe actualizar los ajustes de asistencia e invalidar la caché', async () => {
      mockConfigService.get.mockResolvedValue(mockInstitution);
      mockPrisma.institution.update.mockResolvedValue({
        enableQrAttendance: true,
        enableBiometricAttendance: true,
        lateToleranceMinutes: 10,
        absentToleranceMinutes: 20,
        notificationFrequency: 'PER_CLASS',
      });

      const payload = {
        enableQrAttendance: true,
        enableBiometricAttendance: true,
        lateToleranceMinutes: 10,
        absentToleranceMinutes: 20,
        notificationFrequency: 'PER_CLASS',
      };

      const result = await service.updateAttendanceSettings(payload);

      expect(mockPrisma.institution.update).toHaveBeenCalled();
      expect(mockConfigService.invalidate).toHaveBeenCalled();
      expect(result.data.lateToleranceMinutes).toBe(10);
    });
  });
});
