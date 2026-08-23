jest.mock('@react-pdf/renderer', () => ({
  renderToStream: jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
  })),
  renderToBuffer: jest.fn(),
  StyleSheet: { create: jest.fn() },
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { TimetablesService } from '../timetables.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Shift, SchedulingMode } from '../../../prisma/generated/client';

describe('TimetablesService - Pruebas Unitarias', () => {
  let service: TimetablesService;

  const mockPrisma = {
    classPeriod: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    scheduleSlot: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    teacherAssignment: {
      findUnique: jest.fn(),
    },
    classroom: {
      findUnique: jest.fn(),
    },
    institution: {
      findFirst: jest.fn(),
    },
    physicalSpace: {
      findUnique: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken('export-queue'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<TimetablesService>(TimetablesService);

    jest.clearAllMocks();
    mockPrisma.physicalSpace.findUnique.mockResolvedValue({
      id: 'space-id',
      name: 'Aula 101',
      isActive: true,
    });
  });

  describe('getPeriods', () => {
    it('debe consultar los periodos por el turno correcto ordenados por orden', async () => {
      mockPrisma.classPeriod.findMany.mockResolvedValue([
        { id: '1', name: '1er Periodo' },
      ]);

      const result = await service.getPeriods(Shift.MANANA);

      expect(result).toEqual([{ id: '1', name: '1er Periodo' }]);
      expect(mockPrisma.classPeriod.findMany).toHaveBeenCalledWith({
        where: { shift: Shift.MANANA },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('getClassroomSchedule', () => {
    it('debe obtener la grilla horaria vinculando subject, teacher y physicalSpace', async () => {
      mockPrisma.scheduleSlot.findMany.mockResolvedValue([]);

      const result = await service.getClassroomSchedule('classroom-id-123');

      expect(result).toEqual([]);
      expect(mockPrisma.scheduleSlot.findMany).toHaveBeenCalledWith({
        where: { classroomId: 'classroom-id-123' },
        include: {
          teacherAssignment: {
            include: {
              subject: { select: { id: true, name: true } },
              teacher: { select: { id: true, fullName: true } },
            },
          },
          physicalSpace: { select: { id: true, name: true } },
        },
      });
    });
  });

  describe('createSlot', () => {
    const defaultDto = {
      dayOfWeek: 1,
      classPeriodId: 'period-id',
      teacherAssignmentId: 'assignment-id',
      classroomId: 'classroom-id',
      teacherId: 'teacher-id',
      physicalSpaceId: 'space-id',
    };

    it('debe lanzar NotFoundException si la asignación docente no existe', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue(null);
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({ id: 'inst-id' });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si el periodo es un recreo / descanso', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: true,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el periodo está inactivo / descontinuado', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: false,
        isActive: false,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar ConflictException si el turno de la asignación no coincide con el del periodo', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.TARDE,
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar BadRequestException si el espacio físico está inactivo', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA, baseRoomId: 'space-id' },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.FIXED_BASE,
      });
      mockPrisma.physicalSpace.findUnique.mockResolvedValue({
        id: 'space-id',
        name: 'Aula 101',
        isActive: false,
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar ConflictException si el espacio físico ya está ocupado en ese periodo y día', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      // Conflicto de espacio
      mockPrisma.scheduleSlot.findFirst.mockResolvedValueOnce({
        id: 'other-slot',
        physicalSpace: { name: 'Aula 101' },
        classroom: { grade: 'Segundo', section: 'A' },
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si el docente ya tiene otra clase a la misma hora', async () => {
      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      // Sin conflicto de espacio
      mockPrisma.scheduleSlot.findFirst.mockResolvedValueOnce(null);
      // Con conflicto de docente
      mockPrisma.scheduleSlot.findFirst.mockResolvedValueOnce({
        id: 'other-slot-teacher',
        classroom: { grade: 'Tercero', section: 'B' },
      });

      await expect(service.createSlot(defaultDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe crear el casillero correctamente si no hay ningún choque horario', async () => {
      const createdSlot = {
        id: 'slot-created-id',
        dayOfWeek: 1,
        classPeriodId: 'period-id',
        teacherAssignmentId: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        physicalSpaceId: 'space-id',
      };

      mockPrisma.teacherAssignment.findUnique.mockResolvedValue({
        id: 'assignment-id',
        classroomId: 'classroom-id',
        teacherId: 'teacher-id',
        classroom: { shift: Shift.MANANA },
        subject: { name: 'Matemáticas' },
        teacher: { fullName: 'Juan Perez' },
      });
      mockPrisma.classPeriod.findUnique.mockResolvedValue({
        id: 'period-id',
        shift: Shift.MANANA,
        isBreak: false,
        isActive: true,
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        id: 'inst-id',
        schedulingMode: SchedulingMode.DYNAMIC,
      });

      mockPrisma.scheduleSlot.findFirst.mockResolvedValue(null); // Sin choques de espacio ni docente
      mockPrisma.scheduleSlot.create.mockResolvedValue(createdSlot);

      const result = await service.createSlot(defaultDto);

      expect(result).toEqual(createdSlot);
      expect(mockPrisma.scheduleSlot.create).toHaveBeenCalled();
    });
  });

  describe('removeSlot', () => {
    it('debe eliminar el casillero si existe en la base de datos', async () => {
      mockPrisma.scheduleSlot.findUnique.mockResolvedValue({ id: 'slot-1' });
      mockPrisma.scheduleSlot.delete.mockResolvedValue({});

      const result = await service.removeSlot('slot-1');

      expect(result).toEqual({ message: 'Casillero liberado exitosamente' });
      expect(mockPrisma.scheduleSlot.delete).toHaveBeenCalledWith({
        where: { id: 'slot-1' },
      });
    });

    it('debe lanzar NotFoundException si el casillero no existe', async () => {
      mockPrisma.scheduleSlot.findUnique.mockResolvedValue(null);

      await expect(service.removeSlot('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateSlotSpace', () => {
    it('debe lanzar ConflictException si está en FIXED_BASE y se intenta cambiar el aula a una materia normal', async () => {
      mockPrisma.scheduleSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        teacherAssignment: { subject: { name: 'Matemáticas' } },
        classroom: { id: 'classroom-id' },
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        schedulingMode: SchedulingMode.FIXED_BASE,
      });

      await expect(
        service.updateSlotSpace('slot-1', 'new-space'),
      ).rejects.toThrow(ConflictException);
    });

    it('debe permitir cambiar de aula en FIXED_BASE si la asignatura es Educación Física', async () => {
      mockPrisma.scheduleSlot.findUnique.mockResolvedValue({
        id: 'slot-1',
        teacherAssignment: { subject: { name: 'Educación Física' } },
        classroom: { id: 'classroom-id' },
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        schedulingMode: SchedulingMode.FIXED_BASE,
      });
      mockPrisma.scheduleSlot.findFirst.mockResolvedValue(null); // Sin choques
      mockPrisma.scheduleSlot.update.mockResolvedValue({
        id: 'slot-1',
        physicalSpaceId: 'new-space',
      });

      const result = await service.updateSlotSpace('slot-1', 'new-space');

      expect(result).toEqual({ id: 'slot-1', physicalSpaceId: 'new-space' });
      expect(mockPrisma.scheduleSlot.update).toHaveBeenCalled();
    });
  });
});
