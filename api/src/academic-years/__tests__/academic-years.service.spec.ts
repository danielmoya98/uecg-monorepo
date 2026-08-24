import { Test, TestingModule } from "@nestjs/testing";
import { AcademicYearsService } from "../academic-years.service";
import { PrismaService } from "../../prisma/prisma.service";
import { TrimestersService } from "../../trimesters/trimesters.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { AcademicStatus } from "../../../prisma/generated/client";

describe("AcademicYearsService - Pruebas Unitarias", () => {
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
    mockPrisma.enrollment = { count: jest.fn() };
    mockPrisma.trimester.deleteMany.mockReset();
    mockTrimesters.createDefaultTrimesters.mockReset();
    mockEventEmitter.emit.mockReset();
    mockCache.del.mockReset();

    jest.clearAllMocks();
  });

  describe("create (Creación de Gestión)", () => {
    it("debe crear una nueva gestión escolar y generar los trimestres correspondientes", async () => {
      const dto = {
        year: 2026,
        name: "Gestión Académica 2026",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(null);
      mockPrisma.academicYear.create.mockResolvedValue({
        id: "year-uuid",
        ...dto,
      });

      const result = await service.create(dto);

      expect(result.id).toBe("year-uuid");
      expect(mockPrisma.academicYear.create).toHaveBeenCalled();
      expect(trimestersService.createDefaultTrimesters).toHaveBeenCalledWith(
        "year-uuid",
        dto.startDate,
        dto.endDate,
        mockPrisma,
      );
      expect(mockCache.del).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "academic-year.created",
        expect.any(Object),
      );
    });

    it("debe lanzar ConflictException si la gestión ya existe", async () => {
      const dto = {
        year: 2026,
        name: "Gestión Académica 2026",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue({ id: "exists" });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.academicYear.create).not.toHaveBeenCalled();
    });

    it("debe lanzar BadRequestException si la fecha de inicio es posterior a la de fin", async () => {
      const dto = {
        year: 2026,
        name: "Gestión Académica 2026",
        startDate: new Date("2026-12-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("update (Actualización de Gestión)", () => {
    it("debe lanzar NotFoundException si la gestión no existe", async () => {
      mockPrisma.academicYear.findUnique.mockResolvedValue(null);

      await expect(
        service.update("invalid-id", { name: "New Name" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("debe actualizar los datos de la gestión y limpiar el caché", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Old Name",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
        trimesters: [],
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear); // find in tx
      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(null); // find duplicate year
      mockPrisma.academicYear.update.mockResolvedValue({
        ...mockYear,
        name: "New Name",
      });

      const result = await service.update("year-uuid", { name: "New Name" });

      expect(result.name).toBe("New Name");
      expect(mockCache.del).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        "academic-year.updated",
        expect.any(Object),
      );
    });

    it("debe validar fechas efectivas cuando solo se actualiza startDate", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
        trimesters: [],
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear);

      // Enviar startDate posterior a endDate existente
      await expect(
        service.update("year-uuid", {
          startDate: new Date("2026-12-15"),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("debe lanzar BadRequestException si el nuevo rango deja trimestres fuera", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.PLANNING,
        trimesters: [
          {
            name: "TERCER_TRIMESTRE",
            startDate: new Date("2026-09-01"),
            endDate: new Date("2026-11-20"),
          },
        ],
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear);

      // Acortar endDate a julio, dejando al tercer trimestre fuera
      await expect(
        service.update("year-uuid", {
          endDate: new Date("2026-07-30"),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("remove (Eliminación de Gestión)", () => {
    it("debe lanzar ConflictException si la gestión tiene cursos/classrooms asociados", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.classroom.count.mockResolvedValue(3); // 3 classrooms associated

      await expect(service.remove("year-uuid")).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });

    it("debe lanzar ConflictException si la gestión tiene inscripciones asociadas", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.classroom.count.mockResolvedValue(0);
      mockPrisma.enrollment.count.mockResolvedValue(5); // 5 enrollments

      await expect(service.remove("year-uuid")).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.academicYear.delete).not.toHaveBeenCalled();
    });

    it("debe eliminar la gestión y sus trimestres asociados si no tiene cursos ni inscripciones", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.classroom.count.mockResolvedValue(0);
      mockPrisma.enrollment.count.mockResolvedValue(0);

      await service.remove("year-uuid");

      expect(mockPrisma.trimester.deleteMany).toHaveBeenCalledWith({
        where: { academicYearId: "year-uuid" },
      });
      expect(mockPrisma.academicYear.delete).toHaveBeenCalledWith({
        where: { id: "year-uuid" },
      });
      expect(mockCache.del).toHaveBeenCalled();
    });
  });

  describe("Integrity Guard y Cierre de Gestión", () => {
    it("debe rechazar clausurar la gestión (CLOSED) si existen trimestres aún abiertos", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-11-30"),
        status: AcademicStatus.ACTIVE,
        trimesters: [{ id: "t1", name: "1er Trimestre", isOpen: true, startDate: new Date("2026-02-01"), endDate: new Date("2026-05-01") }],
      };

      mockPrisma.academicYear.findUnique.mockResolvedValueOnce(mockYear);
      mockPrisma.trimester.findMany = jest.fn().mockResolvedValue([
        { id: "t1", name: "1er Trimestre", isOpen: true },
      ]);
      mockPrisma.dataUpdateRequest = { count: jest.fn().mockResolvedValue(0) };

      await expect(
        service.update("year-uuid", { status: AcademicStatus.CLOSED }),
      ).rejects.toThrow(ConflictException);
    });

    it("checkCanClose debe devolver canClose=true cuando todos los trimestres están cerrados y sin rectificaciones pendientes", async () => {
      const mockYear = {
        id: "year-uuid",
        year: 2026,
        name: "Gestión 2026",
        status: AcademicStatus.ACTIVE,
      };

      mockPrisma.academicYear.findUnique.mockResolvedValue(mockYear);
      mockPrisma.trimester.findMany = jest.fn().mockResolvedValue([
        { id: "t1", name: "1er Trimestre", isOpen: false },
        { id: "t2", name: "2do Trimestre", isOpen: false },
        { id: "t3", name: "3er Trimestre", isOpen: false },
      ]);
      mockPrisma.dataUpdateRequest = { count: jest.fn().mockResolvedValue(0) };

      const result = await service.checkCanClose("year-uuid");

      expect(result.canClose).toBe(true);
      expect(result.openTrimesters).toEqual([]);
      expect(result.pendingDataUpdatesCount).toBe(0);
      expect(result.reasons).toEqual([]);
    });
  });

  describe("cloneStructure (Clonación Atómica de Estructura)", () => {
    it("debe rechazar clonar si la gestión origen y destino son iguales", async () => {
      await expect(
        service.cloneStructure("same-id", { sourceYearId: "same-id" }),
      ).rejects.toThrow(BadRequestException);
    });

    it("debe clonar aulas y asignaciones de una gestión a otra", async () => {
      const targetYear = { id: "target-id", year: 2027, status: AcademicStatus.PLANNING };
      const sourceYear = {
        id: "source-id",
        year: 2026,
        status: AcademicStatus.ACTIVE,
        classrooms: [
          {
            id: "source-c1",
            level: "SECUNDARIA",
            grade: "1",
            section: "A",
            shift: "MANANA",
            capacity: 35,
            baseRoomId: "room-1",
            subjectAssignments: [
              { subjectId: "sub-1", teacherId: "teach-1" },
            ],
          },
        ],
      };

      mockPrisma.academicYear.findUnique
        .mockResolvedValueOnce(targetYear)
        .mockResolvedValueOnce(sourceYear);

      mockPrisma.classroom.findMany = jest.fn().mockResolvedValue([]);
      mockPrisma.classroom.create = jest.fn().mockResolvedValue({ id: "new-c1" });
      mockPrisma.teacherAssignment = {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: "new-ta1" }),
      };

      const result = await service.cloneStructure("target-id", {
        sourceYearId: "source-id",
        cloneAssignments: true,
        cloneBaseRooms: true,
      });

      expect(result.clonedClassroomsCount).toBe(1);
      expect(result.clonedAssignmentsCount).toBe(1);
      expect(mockPrisma.classroom.create).toHaveBeenCalled();
      expect(mockPrisma.teacherAssignment.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("academic-year.updated", expect.any(Object));
    });
  });
});
