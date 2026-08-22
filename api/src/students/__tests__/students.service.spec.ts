import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from '../students.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as xlsx from 'xlsx';

jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  })),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe('StudentsService - Pruebas Unitarias', () => {
  let service: StudentsService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $queryRaw: jest.fn(),
    enrollment: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    guardian: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    studentGuardian: {
      upsert: jest.fn(),
    },
    academicYear: {
      findFirst: jest.fn(),
    },
    rudeRecord: {
      create: jest.fn(),
    },
  };

  const mockEncryptionService = {
    generateBlindIndex: jest.fn((val) => `hash_${val}`),
    encrypt: jest.fn((val) => `encrypted_${val}`),
    decrypt: jest.fn((val) => (val ? val.replace('encrypted_', '') : val)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);

    jest.clearAllMocks();
  });

  describe('registerFullRude (Registro Completo RUDE)', () => {
    const validDto = {
      classroomId: 'classroom-1',
      academicYearId: 'year-2026',
      enrollmentType: 'NUEVO' as const,
      names: 'Carlos',
      lastNamePaterno: 'Salazar',
      lastNameMaterno: 'Miranda',
      birthDate: '2012-04-15',
      gender: 'MASCULINO' as const,
      birthCountry: 'BOLIVIA',
      documentType: 'CI',
      ci: '8765432',
      guardians: [
        {
          relationship: 'MADRE',
          ci: '2345678',
          lastNamePaterno: 'Gomez',
          names: 'Maria',
          phone: '67890123',
        },
      ],
      rudeData: {
        department: 'LA_PAZ',
        province: 'Murillo',
        municipality: 'La Paz',
        street: 'Calle 15',
        cellphone: '71234567',
        transportType: 'A pie',
        transportTime: '15 minutos',
        livesWith: 'PADRE Y MADRE',
        nativeLanguage: 'Castellano',
      },
    };

    it('debe lanzar BadRequestException si el curso no existe', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]); // curso no existe

      await expect(service.registerFullRude(validDto)).rejects.toThrow(
        new BadRequestException('El curso no existe'),
      );
    });

    it('debe lanzar ConflictException si el curso ha alcanzado el límite de cupos', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'classroom-1', capacity: 35, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(35); // cupos llenos

      await expect(service.registerFullRude(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si el estudiante ya está inscrito en la gestión', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'classroom-1', capacity: 35, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(20);
      mockPrisma.student.findUnique.mockResolvedValue({ id: 'student-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'enroll-99' }); // ya inscrito

      await expect(service.registerFullRude(validDto)).rejects.toThrow(
        new ConflictException(
          'Este estudiante ya se encuentra inscrito en la gestión actual.',
        ),
      );
    });

    it('debe registrar el estudiante, tutores, matrícula y RUDE correctamente', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'classroom-1', capacity: 35, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(20);
      mockPrisma.student.findUnique.mockResolvedValue(null); // nuevo estudiante
      mockPrisma.student.create.mockResolvedValue({ id: 'student-123' });
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.guardian.findUnique.mockResolvedValue(null);
      mockPrisma.guardian.create.mockResolvedValue({ id: 'guardian-456' });
      mockPrisma.studentGuardian.upsert.mockResolvedValue({});
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'enroll-789' });
      mockPrisma.rudeRecord.create.mockResolvedValue({});

      const result = await service.registerFullRude(validDto);

      expect(result).toEqual({
        message: 'Inscripción y Formulario RUDE procesados con éxito',
        studentId: 'student-123',
        enrollmentId: 'enroll-789',
      });

      expect(mockPrisma.student.create).toHaveBeenCalled();
      expect(mockPrisma.guardian.create).toHaveBeenCalled();
      expect(mockPrisma.enrollment.create).toHaveBeenCalled();
      expect(mockPrisma.rudeRecord.create).toHaveBeenCalled();
    });
  });

  describe('importStudentsFromExcel (Importación por Excel)', () => {
    const mockFile = {
      buffer: Buffer.from('mockexceldata'),
    } as Express.Multer.File;

    it('debe lanzar BadRequestException si el archivo no se proporciona', async () => {
      await expect(
        service.importStudentsFromExcel(
          null as unknown as Express.Multer.File,
          'year-1',
          'INSCRITO',
          'class-1',
        ),
      ).rejects.toThrow(
        new BadRequestException('No se proporcionó ningún archivo'),
      );
    });

    it('debe lanzar BadRequestException si el classroomId no se proporciona', async () => {
      await expect(
        service.importStudentsFromExcel(
          mockFile,
          'year-1',
          'INSCRITO',
          null as unknown as string,
        ),
      ).rejects.toThrow(
        new BadRequestException('Debe seleccionar un curso destino'),
      );
    });

    it('debe lanzar BadRequestException si el Excel está vacío', async () => {
      (xlsx.utils.sheet_to_json as any).mockReturnValueOnce([]); // vacío

      await expect(
        service.importStudentsFromExcel(
          mockFile,
          'year-1',
          'INSCRITO',
          'class-1',
        ),
      ).rejects.toThrow(new BadRequestException('El archivo Excel está vacío'));
    });

    it('debe procesar e importar estudiantes exitosamente desde el Excel', async () => {
      const mockRows = [
        {
          CI_Estudiante: '9988776',
          Nombres: 'Pedro',
          Apellido_Paterno: 'Mamani',
          Apellido_Materno: 'Chavez',
          Fecha_Nacimiento: '2014-06-20',
          Genero: 'M',
          RUDE: 'RUDE12345',
          CI_Tutor: '1122334',
          Nombres_Tutor: 'Javier Mamani',
          Celular_Tutor: '76543210',
          Parentesco: 'PADRE',
        },
      ];

      (xlsx.utils.sheet_to_json as any).mockReturnValueOnce(mockRows);

      mockPrisma.student.findUnique.mockResolvedValue(null);
      mockPrisma.student.create.mockResolvedValue({ id: 'student-99' });
      mockPrisma.guardian.findUnique.mockResolvedValue(null);
      mockPrisma.guardian.create.mockResolvedValue({ id: 'guardian-99' });
      mockPrisma.studentGuardian.upsert.mockResolvedValue({});

      // Bloqueo de cupo de aula destino
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'class-1', capacity: 30, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(10);
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'enroll-99' });
      mockPrisma.rudeRecord.create.mockResolvedValue({});

      const result = await service.importStudentsFromExcel(
        mockFile,
        'year-2026',
        'INSCRITO',
        'class-1',
      );

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.errors.length).toBe(0);
      expect(mockPrisma.student.create).toHaveBeenCalled();
      expect(mockPrisma.guardian.create).toHaveBeenCalled();
      expect(mockPrisma.enrollment.create).toHaveBeenCalled();
    });

    it('debe manejar errores en filas individuales del Excel e incluirlas en el reporte', async () => {
      const mockRows = [
        {
          CI_Estudiante: '9988776',
          // Nombres falta, lo que generará error en esta fila
          Apellido_Paterno: 'Mamani',
        },
      ];

      (xlsx.utils.sheet_to_json as any).mockReturnValueOnce(mockRows);

      const result = await service.importStudentsFromExcel(
        mockFile,
        'year-2026',
        'INSCRITO',
        'class-1',
      );

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0]).toContain('Faltan datos obligatorios');
    });
  });
});
