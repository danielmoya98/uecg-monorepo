import { Test, TestingModule } from '@nestjs/testing';
import { TeacherAssignmentsService } from '../teacher-assignments.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EducationLevel } from '../../../prisma/generated/client';

describe('TeacherAssignmentsService - Pruebas Unitarias', () => {
  let service: TeacherAssignmentsService;

  const mockPrisma = {
    classroom: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    subject: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    teacherAssignment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createMany: jest.fn(),
    },
    scheduleSlot: {
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    grade: {
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherAssignmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TeacherAssignmentsService>(TeacherAssignmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe lanzar NotFoundException si el aula no existe', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          classroomId: 'class-1',
          subjectId: 'subj-1',
          teacherId: 'teacher-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si la gestión académica está CERRADA (CLOSED)', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        id: 'class-1',
        level: EducationLevel.SECUNDARIA,
        academicYear: { status: 'CLOSED' },
      });

      await expect(
        service.create({
          classroomId: 'class-1',
          subjectId: 'subj-1',
          teacherId: 'teacher-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si el nivel de la materia no coincide con el del curso', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        id: 'class-1',
        level: EducationLevel.PRIMARIA,
        academicYear: { status: 'ACTIVE' },
      });
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subj-1',
        name: 'Física',
        level: EducationLevel.SECUNDARIA,
      });

      await expect(
        service.create({
          classroomId: 'class-1',
          subjectId: 'subj-1',
          teacherId: 'teacher-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el usuario no tiene rol de DOCENTE o está inactivo', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        id: 'class-1',
        level: EducationLevel.SECUNDARIA,
        academicYear: { status: 'ACTIVE' },
      });
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subj-1',
        name: 'Matemática',
        level: EducationLevel.SECUNDARIA,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        status: 'ACTIVE',
        role: { name: 'ADMINISTRATIVO' },
      });

      await expect(
        service.create({
          classroomId: 'class-1',
          subjectId: 'subj-1',
          teacherId: 'teacher-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear la asignación con éxito si las validaciones pasan', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        id: 'class-1',
        level: EducationLevel.SECUNDARIA,
        academicYear: { status: 'ACTIVE' },
      });
      mockPrisma.subject.findUnique.mockResolvedValue({
        id: 'subj-1',
        name: 'Matemática',
        level: EducationLevel.SECUNDARIA,
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'teacher-1',
        status: 'ACTIVE',
        role: { name: 'DOCENTE' },
      });
      const created = {
        id: 'assign-1',
        classroomId: 'class-1',
        subjectId: 'subj-1',
        teacherId: 'teacher-1',
      };
      mockPrisma.teacherAssignment.create.mockResolvedValue(created);

      const result = await service.create({
        classroomId: 'class-1',
        subjectId: 'subj-1',
        teacherId: 'teacher-1',
      });

      expect(result).toEqual(created);
    });
  });

  describe('update (Reasignar Docente)', () => {
    it('debe reasignar docente y sincronizar scheduleSlots dentro de una transacción', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assign-1',
        teacherId: 'old-teacher',
        classroom: { academicYear: { status: 'ACTIVE' } },
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'new-teacher',
        status: 'ACTIVE',
        role: { name: 'DOCENTE' },
      });
      mockPrisma.teacherAssignment.update.mockResolvedValue({
        id: 'assign-1',
        teacherId: 'new-teacher',
      });

      const result = await service.update('assign-1', {
        teacherId: 'new-teacher',
      });

      expect(mockPrisma.teacherAssignment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'assign-1' },
          data: { teacherId: 'new-teacher' },
        }),
      );
      expect(mockPrisma.scheduleSlot.updateMany).toHaveBeenCalledWith({
        where: { teacherAssignmentId: 'assign-1' },
        data: { teacherId: 'new-teacher' },
      });
      expect(result).toEqual({ id: 'assign-1', teacherId: 'new-teacher' });
    });
  });

  describe('remove', () => {
    it('debe bloquear eliminación si existen calificaciones registradas', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assign-1',
        classroom: { academicYear: { status: 'ACTIVE' } },
      });
      mockPrisma.grade.count.mockResolvedValue(5);

      await expect(service.remove('assign-1')).rejects.toThrow(ConflictException);
    });

    it('debe bloquear eliminación si la materia está distribuida en horarios', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assign-1',
        classroom: { academicYear: { status: 'ACTIVE' } },
      });
      mockPrisma.grade.count.mockResolvedValue(0);
      mockPrisma.scheduleSlot.count.mockResolvedValue(2);

      await expect(service.remove('assign-1')).rejects.toThrow(ConflictException);
    });
  });
});
