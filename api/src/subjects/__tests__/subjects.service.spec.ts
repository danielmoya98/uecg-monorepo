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
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencias Naturales',
      };
      mockPrisma.subject.create.mockResolvedValue(newSubject);

      const dto = {
        name: 'Química',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencias Naturales',
      };

      const result = await service.create(dto);

      expect(result).toEqual(newSubject);
      expect(mockPrisma.subject.findFirst).toHaveBeenCalled();
      expect(mockPrisma.subject.create).toHaveBeenCalledWith({ data: dto });
    });

    it('debe lanzar ConflictException si la materia ya existe en el mismo nivel', async () => {
      mockPrisma.subject.findFirst.mockResolvedValue({ id: 'subj-1' });

      const dto = {
        name: 'Química',
        level: EducationLevel.SECUNDARIA,
        area: 'Ciencias Naturales',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.subject.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll (Buscar y Listar)', () => {
    it('debe listar materias paginadas correctamente', async () => {
      const mockList = [
        { id: '1', name: 'Materia 1', level: 'PRIMARIA', area: 'Ciencias' },
      ];
      mockPrisma.subject.count.mockResolvedValue(1);
      mockPrisma.subject.findMany.mockResolvedValue(mockList);

      const query = { page: 1, limit: 10, search: 'Materia' };

      const result = await service.findAll(query);

      expect(result.data).toEqual(mockList);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOne (Detalle por ID)', () => {
    it('debe devolver la materia si existe', async () => {
      const subject = { id: 'subj-1', name: 'Física', level: 'SECUNDARIA' };
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
    it('debe actualizar los datos de la materia exitosamente', async () => {
      const existing = { id: 'subj-1', name: 'Física', level: 'SECUNDARIA' };
      mockPrisma.subject.findUnique.mockResolvedValue(existing);
      mockPrisma.subject.findFirst.mockResolvedValue(null);
      mockPrisma.subject.update.mockResolvedValue({
        ...existing,
        area: 'Exactas',
      });

      const dto = {
        name: 'Física',
        level: EducationLevel.SECUNDARIA,
        area: 'Exactas',
      };

      const result = await service.update('subj-1', dto);

      expect(result.area).toBe('Exactas');
    });
  });

  describe('remove (Eliminar Materia)', () => {
    it('debe eliminar la materia si no tiene asignaciones de carga horaria', async () => {
      mockPrisma.subject.findUnique.mockResolvedValue({ id: 'subj-1' });
      mockPrisma.teacherAssignment.count.mockResolvedValue(0);
      mockPrisma.subject.delete.mockResolvedValue({});

      const result = await service.remove('subj-1');

      expect(result).toEqual({ message: 'Materia eliminada correctamente' });
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
