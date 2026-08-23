import { Test, TestingModule } from '@nestjs/testing';
import { PhysicalSpacesService } from './physical-spaces.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SpaceType } from '../../prisma/generated/client';

describe('PhysicalSpacesService - Pruebas Unitarias', () => {
  let service: PhysicalSpacesService;

  const mockPrisma = {
    physicalSpace: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    scheduleSlot: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    classroom: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhysicalSpacesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PhysicalSpacesService>(PhysicalSpacesService);

    jest.clearAllMocks();
  });

  describe('create (Registrar Espacio Físico)', () => {
    it('debe lanzar ConflictException si ya existe un espacio con el mismo nombre', async () => {
      mockPrisma.physicalSpace.findFirst.mockResolvedValue({
        id: '1',
        name: 'Aula 101',
      });

      const dto = {
        name: 'Aula 101',
        type: 'SALON' as SpaceType,
        isActive: true,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.physicalSpace.findFirst).toHaveBeenCalled();
    });

    it('debe registrar un espacio físico exitosamente', async () => {
      mockPrisma.physicalSpace.findFirst.mockResolvedValue(null);
      const createdSpace = {
        id: 'new-id',
        name: 'Aula 102',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.create.mockResolvedValue(createdSpace);

      const dto = {
        name: 'Aula 102',
        type: 'SALON' as SpaceType,
        isActive: true,
      };

      const result = await service.create(dto);

      expect(result).toEqual(createdSpace);
      expect(mockPrisma.physicalSpace.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('findAll (Listar Espacios Físicos)', () => {
    it('debe obtener todos los espacios físicos ordenados', async () => {
      const spacesList = [
        { id: '1', name: 'Aula 101', type: 'SALON', isActive: true },
        { id: '2', name: 'Lab 2', type: 'LABORATORIO', isActive: true },
      ];
      mockPrisma.physicalSpace.findMany.mockResolvedValue(spacesList);

      const result = await service.findAll();

      expect(result).toEqual(spacesList);
      expect(mockPrisma.physicalSpace.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });
    });

    it('debe aplicar filtros cuando se proporcionan', async () => {
      mockPrisma.physicalSpace.findMany.mockResolvedValue([]);

      await service.findAll('LABORATORIO' as SpaceType, false);

      expect(mockPrisma.physicalSpace.findMany).toHaveBeenCalledWith({
        where: {
          type: 'LABORATORIO',
          isActive: false,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });
    });

    it('debe aplicar filtro de búsqueda por nombre si se proporciona', async () => {
      mockPrisma.physicalSpace.findMany.mockResolvedValue([]);

      await service.findAll(undefined, undefined, 'aula');

      expect(mockPrisma.physicalSpace.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'aula',
            mode: 'insensitive',
          },
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('findOne (Ver Detalle)', () => {
    it('debe lanzar NotFoundException si el espacio no existe', async () => {
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe retornar el espacio físico si existe', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);

      const result = await service.findOne('1');

      expect(result).toEqual(space);
      expect(mockPrisma.physicalSpace.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('update (Actualizar Espacio)', () => {
    it('debe lanzar ConflictException si el nuevo nombre ya está en uso por otro espacio', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.physicalSpace.findFirst.mockResolvedValue({
        id: '2',
        name: 'Aula 102',
      }); // Otro espacio

      const dto = { name: 'Aula 102' };

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
    });

    it('debe lanzar ConflictException si se intenta desactivar un espacio con horarios asignados', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.scheduleSlot.count.mockResolvedValue(3);
      mockPrisma.classroom.count.mockResolvedValue(0);

      const dto = { isActive: false };

      await expect(service.update('1', dto)).rejects.toThrow(ConflictException);
    });

    it('debe actualizar el espacio físico si los datos son válidos', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.physicalSpace.findFirst.mockResolvedValue(null);
      mockPrisma.scheduleSlot.count.mockResolvedValue(0);
      mockPrisma.classroom.count.mockResolvedValue(0);
      mockPrisma.physicalSpace.update.mockResolvedValue({
        ...space,
        name: 'Aula 101 Modificada',
        isActive: false,
      });

      const dto = { name: 'Aula 101 Modificada', isActive: false };
      const result = await service.update('1', dto);

      expect(result.name).toBe('Aula 101 Modificada');
      expect(result.isActive).toBe(false);
      expect(mockPrisma.physicalSpace.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });
  });

  describe('remove (Eliminar Espacio)', () => {
    it('debe lanzar ConflictException si el espacio está asignado a un horario', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.scheduleSlot.findFirst.mockResolvedValue({ id: 'slot-1' });
      mockPrisma.classroom.findFirst.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('debe lanzar ConflictException si el espacio es el aula base de algún curso', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.scheduleSlot.findFirst.mockResolvedValue(null);
      mockPrisma.classroom.findFirst.mockResolvedValue({ id: 'class-1' });

      await expect(service.remove('1')).rejects.toThrow(ConflictException);
    });

    it('debe eliminar el espacio físico si no está siendo usado', async () => {
      const space = {
        id: '1',
        name: 'Aula 101',
        type: 'SALON',
        isActive: true,
      };
      mockPrisma.physicalSpace.findUnique.mockResolvedValue(space);
      mockPrisma.scheduleSlot.findFirst.mockResolvedValue(null);
      mockPrisma.classroom.findFirst.mockResolvedValue(null);
      mockPrisma.physicalSpace.delete.mockResolvedValue(space);

      const result = await service.remove('1');

      expect(result).toEqual(space);
      expect(mockPrisma.physicalSpace.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
