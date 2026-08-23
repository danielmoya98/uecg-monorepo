import { Test, TestingModule } from '@nestjs/testing';
import { SubjectsService } from '../subjects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EducationLevel } from '../../../prisma/generated/client';

describe('SubjectsService - Pruebas Unitarias', () => {
  let service: SubjectsService;

  const mockPrisma = {
    subject: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacherAssignment: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);

    jest.clearAllMocks();
  });

  describe('create (Registrar Materia)', () => {
    it('debe registrar una nueva materia con éxito si no hay duplicados', async () => {
      mockPrisma.subject.findFirst.mockResolvedValue(null);
      const newSubject = {
        id: 'subj-1',
        name: 'Química',
        code: 'QUI',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencia, Tecnología y Producción',
        isActive: true,
      };
      mockPrisma.subject.create.mockResolvedValue(newSubject);

      const dto = {
        name: '  Química  ',
        code: 'QUI',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencia, Tecnología y Producción',
      };

      const result = await service.create(dto);

      expect(result).toEqual(newSubject);
      expect(mockPrisma.subject.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: 'Química', mode: 'insensitive' },
          level: EducationLevel.SECUNDARIA,
        },
      });
      expect(mockPrisma.subject.create).toHaveBeenCalledWith({
        data: {
          name: 'Química',
          code: 'QUI',
          level: EducationLevel.SECUNDARIA,
          area: 'Ciencia, Tecnología y Producción',
          isActive: true,
        },
      });
    });

    it('debe lanzar ConflictException si la materia ya existe en el mismo nivel', async () => {
      mockPrisma.subject.findFirst.mockResolvedValue({ id: 'subj-1' });

      const dto = {
        name: 'Química',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencia, Tecnología y Producción',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.subject.create).not.toHaveBeenCalled();
    });

    it('debe capturar error P2002 de Prisma y lanzar ConflictException', async () => {
      mockPrisma.subject.findFirst.mockResolvedValue(null);
      mockPrisma.subject.create.mockRejectedValue({ code: 'P2002' });

      const dto = {
        name: 'Física',
        level: EducationLevel.SECUNDARIA,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll (Buscar y Listar)', () => {
    it('debe listar materias paginadas correctamente', async () => {
      const mockList = [
        {
          id: '1',
          name: 'Materia 1',
          code: 'MAT1',
          level: 'PRIMARIA',
          area: 'Ciencias',
          isActive: true,
        },
      ];
      mockPrisma.subject.count.mockResolvedValue(1);
      mockPrisma.subject.findMany.mockResolvedValue(mockList);

      const query = { page: 1, limit: 10, search: 'Materia' };

      const result = await service.findAll(query);

      expect(result.data).toEqual(mockList);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('debe retornar todas las materias sin paginar cuando all es true', async () => {
      const mockList = [
        { id: '1', name: 'Materia 1', level: 'PRIMARIA', isActive: true },
        { id: '2', name: 'Materia 2', level: 'SECUNDARIA', isActive: true },
      ];
      mockPrisma.subject.findMany.mockResolvedValue(mockList);

      const query = { all: true, isActive: true };
      const result = await service.findAll(query);

      expect(result.data).toEqual(mockList);
      expect(result.meta.total).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(mockPrisma.subject.count).not.toHaveBeenCalled();
    });
  });

  describe('findOne (Detalle por ID)', () => {
    it('debe devolver la materia si existe', async () => {
      const subject = {
        id: 'subj-1',
        name: 'Física',
        code: 'FIS',
        level: 'SECUNDARIA',
        isActive: true,
      };
      mockPrisma.subject.findUnique.mockResolvedValue(subject);

      const result = await service.findOne('subj-1');

      expect(result).toEqual(subject);
    });

    it('debe lanzar NotFoundException si la materia no existe', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue(null);

      await expect(service.findOne('subj-nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update (Actualizar Datos)', () => {
    it('debe actualizar los datos de la materia exitosamente usando los valores existentes para validar duplicados', async () => {
      const existing = {
        id: 'subj-1',
        name: 'Física',
        code: 'FIS',
        level: EducationLevel.SECUNDARIA,
        area: 'Exactas',
        isActive: true,
      };
      mockPrisma.subject.findUnique.mockResolvedValue(existing);
      mockPrisma.subject.findFirst.mockResolvedValue(null);
      mockPrisma.subject.update.mockResolvedValue({
        ...existing,
        name: 'Física Moderna',
      });

      const dto = {
        name: 'Física Moderna',
      };

      const result = await service.update('subj-1', dto);

      expect(result.name).toBe('Física Moderna');
      expect(mockPrisma.subject.findFirst).toHaveBeenCalledWith({
        where: {
          name: { equals: 'Física Moderna', mode: 'insensitive' },
          level: EducationLevel.SECUNDARIA,
          id: { not: 'subj-1' },
        },
      });
    });

    it('debe lanzar ConflictException si ya existe otra materia con el mismo nombre en ese nivel', async () => {
      const existing = {
        id: 'subj-1',
        name: 'Física',
        level: EducationLevel.SECUNDARIA,
      };
      mockPrisma.subject.findUnique.mockResolvedValue(existing);
      mockPrisma.subject.findFirst.mockResolvedValue({ id: 'subj-2' });

      const dto = { name: 'Química' };

      await expect(service.update('subj-1', dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('toggleStatus (Activar/Desactivar Materia)', () => {
    it('debe alternar el estado isActive correctamente', async () => {
      const existing = {
        id: 'subj-1',
        name: 'Física',
        level: EducationLevel.SECUNDARIA,
        isActive: true,
      };
      mockPrisma.subject.findUnique.mockResolvedValue(existing);
      mockPrisma.subject.update.mockResolvedValue({
        ...existing,
        isActive: false,
      });

      const result = await service.toggleStatus('subj-1', false);

      expect(result.isActive).toBe(false);
      expect(mockPrisma.subject.update).toHaveBeenCalledWith({
        where: { id: 'subj-1' },
        data: { isActive: false },
      });
    });
  });

  describe('remove (Eliminar Materia)', () => {
    it('debe eliminar la materia si no tiene asignaciones de carga horaria', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'subj-1' });
      mockPrisma.teacherAssignment.count.mockResolvedValue(0);
      mockPrisma.subject.delete.mockResolvedValue({});

      const result = await service.remove('subj-1');

      expect(result).toEqual({
        message: 'Materia eliminada correctamente del catálogo.',
      });
      expect(mockPrisma.subject.delete).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si la materia está asignada en carga horaria', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'subj-1' });
      mockPrisma.teacherAssignment.count.mockResolvedValue(2);

      await expect(service.remove('subj-1')).rejects.toThrow(ConflictException);
      expect(mockPrisma.subject.delete).not.toHaveBeenCalled();
    });
  });
});

