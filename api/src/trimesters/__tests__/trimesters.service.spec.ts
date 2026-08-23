import { Test, TestingModule } from '@nestjs/testing';
import { TrimestersService } from '../trimesters.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AcademicStatus, TrimesterName } from '../../../prisma/generated/client';

describe('TrimestersService - Pruebas Unitarias', () => {
  let service: TrimestersService;

  const mockPrisma = {
    $transaction: jest.fn(),
    trimester: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
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
    it('debe insertar los 3 trimestres correspondientes con su orden respectivo', async () => {
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
              order: 1,
              isOpen: false,
            }),
            expect.objectContaining({
              academicYearId: 'year-uuid',
              name: TrimesterName.SEGUNDO_TRIMESTRE,
              order: 2,
              isOpen: false,
            }),
            expect.objectContaining({
              academicYearId: 'year-uuid',
              name: TrimesterName.TERCER_TRIMESTRE,
              order: 3,
              isOpen: false,
            }),
          ]),
        }),
      );
    });
  });

  describe('getByAcademicYear', () => {
    it('debe listar los trimestres ordenados por order ascendente', async () => {
      mockPrisma.trimester.findMany.mockResolvedValue([]);

      await service.getByAcademicYear('year-uuid');

      expect(mockPrisma.trimester.findMany).toHaveBeenCalledWith({
        where: { academicYearId: 'year-uuid' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('getActiveTrimesterForYear', () => {
    it('debe consultar el trimestre abierto de la gestión', async () => {
      mockPrisma.trimester.findFirst.mockResolvedValue({ id: 't1', isOpen: true });

      const result = await service.getActiveTrimesterForYear('year-uuid');

      expect(mockPrisma.trimester.findFirst).toHaveBeenCalledWith({
        where: {
          academicYearId: 'year-uuid',
          isOpen: true,
        },
      });
      expect(result).toEqual({ id: 't1', isOpen: true });
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
        order: 1,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
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
        order: 1,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-11-30'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);

      await expect(
        service.update('trim-uuid', {
          endDate: '2026-12-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si se intenta abrir un trimestre en una gestión no activa (PLANNING)', async () => {
      const mockTrimester = {
        id: 'trim-uuid',
        order: 1,
        isOpen: false,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          year: 2026,
          status: AcademicStatus.PLANNING,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);

      await expect(
        service.update('trim-uuid', { isOpen: true }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la fecha de inicio se solapa con el trimestre anterior', async () => {
      const mockTrimester = {
        id: 'trim-2',
        order: 2,
        academicYearId: 'year-uuid',
        isOpen: false,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-30'),
        academicYear: {
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-11-30'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);
      mockPrisma.trimester.findMany.mockResolvedValue([
        {
          id: 'trim-1',
          name: TrimesterName.PRIMER_TRIMESTRE,
          order: 1,
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-05-30'),
        },
      ]);

      // Intenta mover inicio del T2 a 2026-05-15 (antes de que termine T1 el 2026-05-30)
      await expect(
        service.update('trim-2', {
          startDate: '2026-05-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la fecha de fin se solapa con el trimestre posterior', async () => {
      const mockTrimester = {
        id: 'trim-1',
        order: 1,
        academicYearId: 'year-uuid',
        isOpen: false,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-11-30'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);
      mockPrisma.trimester.findMany.mockResolvedValue([
        {
          id: 'trim-2',
          name: TrimesterName.SEGUNDO_TRIMESTRE,
          order: 2,
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-08-30'),
        },
      ]);

      // Intenta extender fin de T1 a 2026-06-15 (después del inicio de T2 el 2026-06-01)
      await expect(
        service.update('trim-1', {
          endDate: '2026-06-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe cerrar otros trimestres y emitir trimester.opened al abrir un trimestre', async () => {
      const mockTrimester = {
        id: 'trim-2',
        name: TrimesterName.SEGUNDO_TRIMESTRE,
        order: 2,
        academicYearId: 'year-uuid',
        isOpen: false, // Estaba cerrado
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-30'),
        academicYear: {
          startDate: new Date('2026-02-01'),
          endDate: new Date('2026-11-30'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);
      mockPrisma.trimester.findMany.mockResolvedValue([]);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          trimester: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            update: jest.fn().mockResolvedValue({
              ...mockTrimester,
              isOpen: true,
            }),
          },
        };
        return callback(txMock);
      });

      const result = await service.update('trim-2', { isOpen: true });

      expect(result.isOpen).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('trimester.opened', {
        trimesterId: 'trim-2',
        academicYearId: 'year-uuid',
        name: TrimesterName.SEGUNDO_TRIMESTRE,
        order: 2,
      });
      expect(mockCache.del).toHaveBeenCalledWith('academic-year:current-active');
    });

    it('debe emitir trimester.closed si el trimestre pasa de abierto a cerrado', async () => {
      const mockTrimester = {
        id: 'trim-1',
        name: TrimesterName.PRIMER_TRIMESTRE,
        order: 1,
        academicYearId: 'year-uuid',
        isOpen: true, // Actualmente abierto
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-30'),
        academicYear: {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          year: 2026,
          status: AcademicStatus.ACTIVE,
        },
      };

      mockPrisma.trimester.findUnique.mockResolvedValue(mockTrimester);
      mockPrisma.trimester.findMany.mockResolvedValue([]);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          trimester: {
            updateMany: jest.fn(),
            update: jest.fn().mockResolvedValue({
              ...mockTrimester,
              isOpen: false,
            }),
          },
        };
        return callback(txMock);
      });

      await service.update('trim-1', { isOpen: false });

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('trimester.closed', {
        trimesterId: 'trim-1',
        academicYearId: 'year-uuid',
        name: TrimesterName.PRIMER_TRIMESTRE,
        order: 1,
      });
      expect(mockCache.del).toHaveBeenCalledWith('academic-year:current-active');
    });
  });
});

