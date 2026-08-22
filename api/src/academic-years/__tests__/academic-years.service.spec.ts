import { Test, TestingModule } from '@nestjs/testing';
import { AcademicYearsService } from '../academic-years.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TrimestersService } from '../../trimesters/trimesters.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AcademicStatus } from '../../../prisma/generated/client';

describe('AcademicYearsService - Pruebas Unitarias', () => {
  let service: AcademicYearsService;
  let trimestersService: TrimestersService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    academicYear: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    classroom: {
      count: jest.fn(),
    },
    trimester: {
      deleteMany: jest.fn(),
    },
  };

  const mockTrimesters = {
    createDefaultTrimesters: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicYearsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TrimestersService, useValue: mockTrimesters },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AcademicYearsService>(AcademicYearsService);
    trimestersService = module.get<TrimestersService>(TrimestersService);

    mockPrisma.academicYear.findUnique.mockReset();
    mockPrisma.academicYear.findFirst.mockReset();
    mockPrisma.academicYear.findMany.mockReset();
    mockPrisma.academicYear.create.mockReset();
    mockPrisma.academicYear.update.mockReset();
    mockPrisma.academicYear.updateMany.mockReset();
    mockPrisma.academicYear.delete.mockReset();
    mockPrisma.academicYear.count.mockReset();
    mockPrisma.classroom.count.mockReset();
    mockPrisma.trimester.deleteMany.mockReset();
    mockTrimesters.createDefaultTrimesters.mockReset();
    mockEventEmitter.emit.mockReset();
    mockCache.del.mockReset();

    jest.clearAllMocks();
  });

  describe('create (Creación de Gestión)', () => {
    it('debe crear una nueva gestión escolar y generar los trimestres correspondientes', async () => {
      const dto = {
        year: 2026,
        name: 'Gestión Académica 2026',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-11-30'),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(null);
      mockPrisma.academicYear.create.mockResolvedValue({
        id: 'year-uuid',
        ...dto,
      });

      const result = await service.create(dto);

      expect(result.id).toBe('year-uuid');
      expect(mockPrisma.academicYear.create).toHaveBeenCalled();
      expect(trimestersService.createDefaultTrimesters).toHaveBeenCalledWith(
        'year-uuid',
        dto.startDate,
        dto.endDate,
        mockPrisma,
      );
      expect(mockCache.del).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'academic-year.created',
        expect.any(Object),
      );
    });

    it('debe lanzar ConflictException si la gestión ya existe', async () => {
      const dto = {
        year: 2026,
        name: 'Gestión Académica 2026',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-11-30'),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue({ id: 'exists' });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.create).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si la fecha de inicio es posterior a la de fin', async () => {
      const dto = {
        year: 2026,
        name: 'Gestión Académica 2026',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-11-30'),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update (Actualización de Gestión)', () => {
    it('debe lanzar NotFoundException si la gestión no existe', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar los datos de la gestión y limpiar el caché', async () => {
      const mockYear = {
        id: 'year-uuid',
        year: 2026,
        name: 'Old Name',
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear); // find in tx
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null); // find duplicate year
      mockPrisma.academicYear.update.mockResolvedValue({
        ...mockYear,
        name: 'New Name',
      });

      const result = await service.update('year-uuid', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(mockCache.del).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'academic-year.updated',
        expect.any(Object),
      );
    });
  });

  describe('remove (Eliminación de Gestión)', () => {
    it('debe lanzar ConflictException si la gestión tiene cursos/classrooms asociados', async () => {
      const mockYear = {
        id: 'year-uuid',
        year: 2026,
        name: 'Gestión 2026',
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.classroom.count.mockResolvedValue(3); // 3 classrooms associated

      await expect(service.remove('year-uuid')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });

    it('debe eliminar la gestión y sus trimestres asociados si no tiene cursos', async () => {
      const mockYear = {
        id: 'year-uuid',
        year: 2026,
        name: 'Gestión 2026',
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.classroom.count.mockResolvedValue(0);

      await service.remove('year-uuid');

      expect(mockPrisma.trimester.deleteMany).toHaveBeenCalledWith({
        where: { academicYearId: 'year-uuid' },
      });
      expect(mockPrisma.academicYear.delete).toHaveBeenCalledWith({
        where: { id: 'year-uuid' },
      });
      expect(mockCache.del).toHaveBeenCalled();
    });
  });
});
