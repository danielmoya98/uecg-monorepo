import { Test, TestingModule } from '@nestjs/testing';
import { ClassPeriodsService } from './class-periods.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Shift } from '../../prisma/generated/client';

describe('ClassPeriodsService - Pruebas Unitarias', () => {
  let service: ClassPeriodsService;

  const mockPrisma = {
    classPeriod: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
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
        ClassPeriodsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ClassPeriodsService>(ClassPeriodsService);

    mockPrisma.classPeriod.findUnique.mockReset();
    mockPrisma.classPeriod.findFirst.mockReset();
    mockPrisma.classPeriod.findMany.mockReset();
    mockPrisma.classPeriod.create.mockReset();
    mockPrisma.classPeriod.update.mockReset();
    mockPrisma.classPeriod.delete.mockReset();

    mockEventEmitter.emit.mockReset();
    mockCache.get.mockReset();
    mockCache.set.mockReset();
    mockCache.del.mockReset();

    jest.clearAllMocks();
  });

  describe('create (Crear Periodo)', () => {
    const validDto = {
      name: '1ra Hora',
      startTime: '08:00',
      endTime: '08:45',
      shift: Shift.MANANA,
      isBreak: false,
      order: 1,
    };

    it('debe crear un periodo exitosamente si no hay solapamientos ni órdenes duplicados', async () => {
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOrder -> no duplicate order
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOverlap -> no overlap
      mockPrisma.classPeriod.create.mockResolvedValue({
        id: 'period-uuid',
        ...validDto,
      });

      const result = await service.create(validDto);

      expect(result.id).toBe('period-uuid');
      expect(mockPrisma.classPeriod.create).toHaveBeenCalledWith({
        data: validDto,
      });
      expect(mockCache.del).toHaveBeenCalledWith('class_periods_MANANA');
      expect(mockCache.del).toHaveBeenCalledWith('class_periods_all');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'class-period.created',
        {
          classPeriodId: 'period-uuid',
          shift: Shift.MANANA,
        },
      );
    });

    it('debe lanzar BadRequestException si la hora de inicio es igual o posterior a la hora de fin', async () => {
      const invalidTimeDto = {
        ...validDto,
        startTime: '09:00',
        endTime: '08:00',
      };

      await expect(service.create(invalidTimeDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.classPeriod.create).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el orden ya está en uso', async () => {
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce({
        id: 'existing',
      }); // validateOrder finds conflict

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.classPeriod.create).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si las horas se solapan con un periodo existente', async () => {
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOrder -> no duplicate order
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce({
        id: 'existing-overlap',
        name: 'Periodo Solapado',
        startTime: '08:30',
        endTime: '09:15',
      }); // validateOverlap finds overlap

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.classPeriod.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll (Buscar Periodos)', () => {
    const mockList = [
      { id: '1', name: '1ra Hora', shift: Shift.MANANA, order: 1 },
      { id: '2', name: '2da Hora', shift: Shift.MANANA, order: 2 },
    ];

    it('debe devolver datos en caché si existen para un turno específico', async () => {
      mockCache.get.mockResolvedValue(mockList);

      const result = await service.findAll(Shift.MANANA);

      expect(result).toEqual(mockList);
      expect(mockCache.get).toHaveBeenCalledWith('class_periods_MANANA');
      expect(mockPrisma.classPeriod.findMany).not.toHaveBeenCalled();
    });

    it('debe consultar la DB y actualizar caché si no existen datos guardados en caché', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.classPeriod.findMany.mockResolvedValue(mockList);

      const result = await service.findAll(Shift.MANANA);

      expect(result).toEqual(mockList);
      expect(mockPrisma.classPeriod.findMany).toHaveBeenCalledWith({
        where: { shift: Shift.MANANA },
        orderBy: { order: 'asc' },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        'class_periods_MANANA',
        mockList,
        60 * 60 * 24,
      );
    });

    it('debe devolver listado global si no se especifica el turno', async () => {
      mockCache.get.mockResolvedValue(null);
      mockPrisma.classPeriod.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();

      expect(result).toEqual(mockList);
      expect(mockPrisma.classPeriod.findMany).toHaveBeenCalledWith({
        orderBy: [{ shift: 'asc' }, { order: 'asc' }],
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        'class_periods_all',
        mockList,
        60 * 60 * 24,
      );
    });
  });

  describe('update (Actualizar Periodo)', () => {
    const existingPeriod = {
      id: 'period-uuid',
      name: '1ra Hora',
      startTime: '08:00',
      endTime: '08:45',
      shift: Shift.MANANA,
      isBreak: false,
      order: 1,
    };

    it('debe lanzar NotFoundException si el periodo no existe', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar los datos del periodo exitosamente e invalidar caché', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(existingPeriod);
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOverlap -> no overlap
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOrder -> no order conflict
      mockPrisma.classPeriod.update.mockResolvedValue({
        ...existingPeriod,
        name: 'Nuevo Nombre',
      });

      const result = await service.update('period-uuid', {
        name: 'Nuevo Nombre',
      });

      expect(result.name).toBe('Nuevo Nombre');
      expect(mockPrisma.classPeriod.update).toHaveBeenCalled();
      expect(mockCache.del).toHaveBeenCalledWith('class_periods_MANANA');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'class-period.updated',
        {
          classPeriodId: 'period-uuid',
          shift: Shift.MANANA,
        },
      );
    });

    it('debe invalidar caché del nuevo turno si este cambia y revalidar solapamiento', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(existingPeriod);
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOverlap -> no overlap in new shift
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null); // validateOrder -> no order conflict
      mockPrisma.classPeriod.update.mockResolvedValue({
        ...existingPeriod,
        shift: Shift.TARDE,
      });

      await service.update('period-uuid', { shift: Shift.TARDE });

      expect(mockCache.del).toHaveBeenCalledWith('class_periods_MANANA');
      expect(mockCache.del).toHaveBeenCalledWith('class_periods_TARDE');
    });

    it('debe lanzar ConflictException si Prisma lanza error de unicidad P2002 en update', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(existingPeriod);
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null);
      mockPrisma.classPeriod.findFirst.mockResolvedValueOnce(null);
      const p2002Error = new Error('Unique constraint failed');
      (p2002Error as any).code = 'P2002';
      mockPrisma.classPeriod.update.mockRejectedValue(p2002Error);

      await expect(
        service.update('period-uuid', { order: 2 }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove (Eliminar Periodo)', () => {
    const existingPeriod = {
      id: 'period-uuid',
      name: '1ra Hora',
      shift: Shift.MANANA,
    };

    it('debe lanzar NotFoundException si el periodo no existe', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe eliminar el periodo exitosamente e invalidar el caché', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(existingPeriod);
      mockPrisma.classPeriod.delete.mockResolvedValue(existingPeriod);

      const result = await service.remove('period-uuid');

      expect(result.message).toBe('Periodo eliminado correctamente');
      expect(mockPrisma.classPeriod.delete).toHaveBeenCalledWith({
        where: { id: 'period-uuid' },
      });
      expect(mockCache.del).toHaveBeenCalledWith('class_periods_MANANA');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'class-period.deleted',
        {
          classPeriodId: 'period-uuid',
          shift: Shift.MANANA,
        },
      );
    });

    it('debe lanzar ConflictException si Prisma lanza error de restricción de clave foránea P2003', async () => {
      mockPrisma.classPeriod.findUnique.mockResolvedValue(existingPeriod);
      const dbError = new Error('FK Error');
      (dbError as any).code = 'P2003';
      mockPrisma.classPeriod.delete.mockRejectedValue(dbError);

      await expect(service.remove('period-uuid')).rejects.toThrow(
        ConflictException,
      );
      expect(mockCache.del).not.toHaveBeenCalled();
    });
  });
});
