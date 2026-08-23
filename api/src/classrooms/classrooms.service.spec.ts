import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomsService } from './classrooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AcademicStatus } from '../../prisma/generated/client';

describe('ClassroomsService - Pruebas Unitarias', () => {
  let service: ClassroomsService;

  const mockPrisma = {
    academicYear: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    physicalSpace: {
      findUnique: jest.fn(),
    },
    enrollment: {
      count: jest.fn(),
    },
    classroom: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockUsersService = {
    validateTeacherAdvisor: jest.fn().mockResolvedValue(undefined),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ClassroomsService>(ClassroomsService);

    jest.clearAllMocks();
  });

  describe('create (Crear Aula)', () => {
    it('debe lanzar NotFoundException si la gestión académica no existe', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue(null);

      const dto = {
        academicYearId: 'non-existent-year',
        level: 'SECUNDARIA' as any,
        shift: 'MANANA' as any,
        grade: 'Primero',
        section: 'A',
        capacity: 30,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si la gestión académica está cerrada', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue({
        id: 'closed-year',
        status: AcademicStatus.CLOSED,
      });

      const dto = {
        academicYearId: 'closed-year',
        level: 'SECUNDARIA' as any,
        shift: 'MANANA' as any,
        grade: 'Primero',
        section: 'A',
        capacity: 30,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('debe crear un curso exitosamente si la gestión está activa', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue({
        id: 'active-year',
        status: AcademicStatus.ACTIVE,
      });

      const createdClassroom = {
        id: 'classroom-1',
        academicYearId: 'active-year',
        level: 'SECUNDARIA',
        shift: 'MANANA',
        grade: 'Primero',
        section: 'A',
        capacity: 30,
      };

      mockPrisma.classroom.create.mockResolvedValue(createdClassroom);

      const dto = {
        academicYearId: 'active-year',
        level: 'SECUNDARIA' as any,
        shift: 'MANANA' as any,
        grade: 'Primero',
        section: 'A',
        capacity: 30,
      };

      const result = await service.create(dto);

      expect(result).toEqual(createdClassroom);
      expect(mockPrisma.classroom.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('classroom.created', {
        classroomId: 'classroom-1',
      });
    });

    it('debe validar el docente asesor si se envía advisorId', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue({
        id: 'active-year',
        status: AcademicStatus.ACTIVE,
      });

      const createdClassroom = {
        id: 'classroom-1',
        academicYearId: 'active-year',
        level: 'SECUNDARIA',
        shift: 'MANANA',
        grade: 'Primero',
        section: 'A',
        capacity: 30,
        advisorId: 'teacher-1',
      };

      mockPrisma.classroom.create.mockResolvedValue(createdClassroom);

      const dto = {
        academicYearId: 'active-year',
        level: 'SECUNDARIA' as any,
        shift: 'MANANA' as any,
        grade: 'Primero',
        section: 'A',
        capacity: 30,
        advisorId: 'teacher-1',
      };

      await service.create(dto);

      expect(mockUsersService.validateTeacherAdvisor).toHaveBeenCalledWith('teacher-1');
    });

    it('debe lanzar ConflictException si ocurre un error P2002 (clave única duplicada)', async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue({
        id: 'active-year',
        status: AcademicStatus.ACTIVE,
      });

      const error = new Error('Unique constraint failed');
      (error as any).code = 'P2002';
      mockPrisma.classroom.create.mockRejectedValue(error);

      const dto = {
        academicYearId: 'active-year',
        level: 'SECUNDARIA' as any,
        shift: 'MANANA' as any,
        grade: 'Primero',
        section: 'A',
        capacity: 30,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update (Actualizar Aula)', () => {
    it('debe rechazar reducción de capacidad si es menor que los alumnos inscritos activos', async () => {
      mockPrisma.classroom.findFirst.mockResolvedValue({
        id: 'classroom-1',
        academicYear: { id: 'year-1' },
        shift: 'MANANA',
        grade: 'Primero',
        section: 'A',
        capacity: 35,
      });

      // 30 alumnos activos
      mockPrisma.enrollment.count.mockResolvedValue(30);

      await expect(
        service.update('classroom-1', { capacity: 20 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar exitosamente si la capacidad es suficiente', async () => {
      const existing = {
        id: 'classroom-1',
        academicYear: { id: 'year-1' },
        shift: 'MANANA',
        grade: 'Primero',
        section: 'A',
        capacity: 35,
      };
      mockPrisma.classroom.findFirst.mockResolvedValue(existing);
      mockPrisma.enrollment.count.mockResolvedValue(20);
      mockPrisma.classroom.update.mockResolvedValue({
        ...existing,
        capacity: 25,
      });

      const result = await service.update('classroom-1', { capacity: 25 });
      expect(result.capacity).toBe(25);
    });
  });
});

