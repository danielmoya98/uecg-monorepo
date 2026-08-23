import { Test, TestingModule } from '@nestjs/testing';
import { TrimestersService } from '../trimesters.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TrimesterName } from '../../../prisma/generated/client';

describe('TrimestersService - Pruebas Unitarias', () => {
  let service: TrimestersService;

  const mockPrisma = {
    trimester: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockCache = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrimestersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<TrimestersService>(TrimestersService);

    jest.clearAllMocks();
  });

  describe('createDefaultTrimesters', () => {
    it('debe insertar los 3 trimestres correspondientes de forma atómica y secuencial', async () => {
      const mockTx = {
        trimester: {
          createMany: jest.fn().mockResolvedValue({ count: 3 }),
        },
      } as any;

      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-11-30');

      await service.createDefaultTrimesters(
        'year-uuid',
        startDate,
        endDate,
        mockTx,
      );

      expect(mockTx.trimester.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              academicYearId: 'year-uuid',
              name: TrimesterName.PRIMER_TRIMESTRE,
              isOpen: false,
            }),
            expect.objectContaining({
              academicYearId: 'year-uuid',
              name: TrimesterName.SEGUNDO_TRIMESTRE,
              isOpen: false,
            }),
            expect.objectContaining({
              academicYearId: 'year-uuid',
              name: TrimesterName.TERCER_TRIMESTRE,
              isOpen: false,
            }),
          ]),
        }),
      );
    });
  });

  describe('getByAcademicYear', () => {
    it('debe listar los trimestres ordenados por nombre', async () => {
      mockPrisma.trimester.findMany.mockResolvedValue([]);

      await service.getByAcademicYear('year-uuid');

      expect(mockPrisma.trimester.findMany).toHaveBeenCalledWith({
        where: { academicYearId: 'year-uuid' },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('update (Modificación de Trimestre)', () => {
    it('debe lanzar NotFoundException si el trimestre no existe', async () => {
      mockPrisma.trimester.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { isOpen: true }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si la fecha de inicio es posterior a la de fin', async () => {
      const mockTrimester = {
        id: 'trim-uuid',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          year: 2026,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);

      await expect(
        service.update('trim-uuid', {
          startDate: '2026-06-01',
          endDate: '2026-05-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si las fechas se salen del rango del año lectivo', async () => {
      const mockTrimester = {
        id: 'trim-uuid',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-11-30'),
          year: 2026,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);

      // Fecha fin (diciembre) excede la fecha fin de gestión (noviembre)
      await expect(
        service.update('trim-uuid', {
          endDate: '2026-12-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe emitir el evento trimester.closed si el trimestre pasa de abierto a cerrado', async () => {
      const mockTrimester = {
        id: 'trim-uuid',
        academicYearId: 'year-uuid',
        isOpen: true, // Actualmente abierto
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          year: 2026,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);
      mockPrisma.trimester.update.mockResolvedValue({
        ...mockTrimester,
        isOpen: false, // Ahora cerrado
      });

      await service.update('trim-uuid', { isOpen: false });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('trimester.closed', {
        trimesterId: 'trim-uuid',
        academicYearId: 'year-uuid',
      });
      expect(mockCache.del).toHaveBeenCalledWith(
        'academic-year:current-active',
      );
    });
  });
});
