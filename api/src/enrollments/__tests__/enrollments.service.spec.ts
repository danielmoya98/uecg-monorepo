import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsService } from '../enrollments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { SystemPermissions } from '../../auth/constants/permissions.constant';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EnrollmentsService - Pruebas Unitarias', () => {
  let service: EnrollmentsService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    $queryRaw: jest.fn(),
    enrollment: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    student: {
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    guardian: {
      upsert: jest.fn(),
    },
    studentGuardian: {
      upsert: jest.fn(),
      findMany: jest.fn(),
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
        EnrollmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);

    jest.clearAllMocks();
  });

  describe('create (Crear Inscripción)', () => {
    const validDto = {
      classroomId: 'class-1',
      ci: '12345678',
      documentType: 'CI',
      names: 'Juan',
      lastNamePaterno: 'Perez',
      lastNameMaterno: 'Gomez',
      gender: 'MASCULINO',
      birthDate: '2015-05-10',
      birthCountry: 'BOLIVIA',
      rudeCode: '8073010203',
      hasDisability: false,
      hasAutism: false,
      enrollmentType: 'REGULAR',
      department: 'LA PAZ',
      province: 'MURILLO',
      municipality: 'LA PAZ',
      street: 'Calle Principal 123',
      cellphone: '71234567',
      nativeLanguage: 'CASTELLANO',
      transportType: 'A_PIE',
      transportTime: '15_MIN',
      livesWith: 'AMBOS_PADRES',
      guardians: [
        {
          ci: '87654321',
          names: 'Maria',
          lastNamePaterno: 'Gomez',
          lastNameMaterno: 'Lopez',
          phone: '77654321',
          occupation: 'Profesora',
          educationLevel: 'LICENCIATURA',
          relationship: 'MADRE',
        },
      ],
    };

    it('debe lanzar NotFoundException si el curso no existe', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]); // No lock / classroom not found

      await expect(service.create(validDto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el curso no tiene cupos disponibles', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'class-1', capacity: 30, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(30); // 30 occupied out of 30 capacity

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrisma.enrollment.count).toHaveBeenCalledWith({
        where: {
          classroomId: 'class-1',
          status: { in: ['INSCRITO', 'REVISION_SIE'] },
        },
      });
    });

    it('debe lanzar BadRequestException si no hay una gestión académica activa', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'class-1', capacity: 30, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(15);
      mockPrisma.student.upsert.mockResolvedValue({ id: 'student-1' });
      mockPrisma.guardian.upsert.mockResolvedValue({ id: 'guardian-1' });
      mockPrisma.studentGuardian.upsert.mockResolvedValue({});
      mockPrisma.academicYear.findFirst.mockResolvedValue(null); // No active year

      await expect(service.create(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe crear exitosamente una inscripción si hay cupos y gestión activa', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'class-1', capacity: 30, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(15);
      mockPrisma.student.upsert.mockResolvedValue({ id: 'student-1' });
      mockPrisma.guardian.upsert.mockResolvedValue({ id: 'guardian-1' });
      mockPrisma.studentGuardian.upsert.mockResolvedValue({});
      mockPrisma.academicYear.findFirst.mockResolvedValue({
        id: 'year-2026',
        status: 'ACTIVE',
      });
      mockPrisma.enrollment.create.mockResolvedValue({
        id: 'enroll-123',
        studentId: 'student-1',
        classroomId: 'class-1',
      });
      mockPrisma.rudeRecord.create.mockResolvedValue({});

      const result = await service.create(validDto);

      expect(result).toEqual({
        id: 'enroll-123',
        studentId: 'student-1',
        classroomId: 'class-1',
      });
      expect(mockPrisma.student.upsert).toHaveBeenCalled();
      expect(mockPrisma.guardian.upsert).toHaveBeenCalled();
      expect(mockPrisma.studentGuardian.upsert).toHaveBeenCalled();
      expect(mockPrisma.enrollment.create).toHaveBeenCalled();
      expect(mockPrisma.rudeRecord.create).toHaveBeenCalled();
    });

    it('debe crear un estudiante sin CI usando create si el DTO no incluye CI', async () => {
      const dtoWithoutCi = { ...validDto, ci: undefined };
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'class-1', capacity: 30, grade: 'Primero', section: 'A' },
      ]);
      mockPrisma.enrollment.count.mockResolvedValue(15);
      mockPrisma.student.create.mockResolvedValue({ id: 'student-no-ci' });
      mockPrisma.academicYear.findFirst.mockResolvedValue({
        id: 'year-2026',
        status: 'ACTIVE',
      });
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'enroll-123' });
      mockPrisma.rudeRecord.create.mockResolvedValue({});

      await service.create(dtoWithoutCi);

      expect(mockPrisma.student.create).toHaveBeenCalled();
      expect(mockPrisma.student.upsert).not.toHaveBeenCalled();
    });
  });

  describe('findAll (Buscar Inscripciones con ABAC)', () => {
    const queryDto = { page: 1, limit: 10 };

    it('debe retornar todas las inscripciones sin filtrar por classroom si el usuario tiene privilegios globales', async () => {
      const adminUser: AuthenticatedUser = {
        userId: 'admin-id',
        email: 'admin@school.com',
        role: 'ADMIN',
        permissions: [SystemPermissions.MANAGE_ALL],
      };

      mockPrisma.enrollment.count.mockResolvedValue(1);
      mockPrisma.enrollment.findMany.mockResolvedValue([
        {
          id: 'enroll-1',
          student: {
            id: 'st-1',
            ci: 'encrypted_123',
            rudeCode: '80730',
            names: 'Pedro',
            lastNamePaterno: 'Camacho',
            lastNameMaterno: '',
            gender: 'MASCULINO',
            guardians: [],
          },
          classroom: {
            level: 'SECUNDARIA',
            grade: 'Primero',
            section: 'A',
            shift: 'MANANA',
          },
        },
      ]);

      const result = await service.findAll(queryDto, adminUser);

      expect(result.data.length).toBe(1);
      expect(result.data[0].student.ci).toBe('123'); // Decrypted
      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              {}, // empty abac filter for power user
            ]),
          }),
        }),
      );
    });

    it('debe aplicar filtros de asignación de curso (advisorId o teacherId) si el usuario es un docente (READ_OWN_ENROLLMENT)', async () => {
      const teacherUser: AuthenticatedUser = {
        userId: 'teacher-123',
        email: 'teacher@school.com',
        role: 'DOCENTE',
        permissions: [SystemPermissions.READ_OWN_ENROLLMENT],
      };

      mockPrisma.enrollment.count.mockResolvedValue(0);
      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      await service.findAll(queryDto, teacherUser);

      expect(mockPrisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                classroom: {
                  OR: [
                    { advisorId: 'teacher-123' },
                    {
                      subjectAssignments: {
                        some: { teacherId: 'teacher-123' },
                      },
                    },
                  ],
                },
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne (Ver Ficha de Inscripción)', () => {
    const adminUser: AuthenticatedUser = {
      userId: 'admin-id',
      email: 'admin@school.com',
      role: 'ADMIN',
      permissions: [SystemPermissions.MANAGE_ALL],
    };

    it('debe lanzar NotFoundException si la inscripción no existe o el scope ABAC la restringe', async () => {
      mockPrisma.enrollment.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent-id', adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe retornar la inscripción completa junto con los hermanos correspondientes cargados en plano', async () => {
      const dbEnrollment = {
        id: 'enroll-1',
        studentId: 'student-1',
        student: {
          id: 'student-1',
          ci: 'encrypted_123',
          guardians: [
            {
              guardianId: 'guardian-99',
              guardian: {
                id: 'guardian-99',
                names: 'Carlos',
                lastNamePaterno: 'Lopez',
                ci: 'encrypted_9999',
                phone: 'encrypted_77777777',
              },
              relationship: 'PADRE',
            },
          ],
        },
        rudeRecord: {
          street: 'encrypted_Calle A',
          cellphone: 'encrypted_71111111',
          phone: 'encrypted_22222222',
        },
      };

      mockPrisma.enrollment.findFirst.mockResolvedValue(dbEnrollment);

      // Hermano
      mockPrisma.studentGuardian.findMany.mockResolvedValue([
        {
          guardianId: 'guardian-99',
          studentId: 'student-sibling',
          guardian: { names: 'Carlos', lastNamePaterno: 'Lopez' },
          student: {
            id: 'student-sibling',
            names: 'Luis',
            lastNamePaterno: 'Lopez',
            lastNameMaterno: 'Perez',
            ci: 'encrypted_76543',
            enrollments: [
              {
                id: 'sibling-enroll',
                classroom: {
                  grade: 'Tercero',
                  section: 'B',
                  level: 'SECUNDARIA',
                },
              },
            ],
          },
        },
      ]);

      const result = await service.findOne('enroll-1', adminUser);

      expect(result.data.id).toBe('enroll-1');
      expect(result.data.student.ci).toBe('123'); // Decrypted
      expect(result.data.siblings.length).toBe(1);
      expect(result.data.siblings[0]).toEqual({
        id: 'student-sibling',
        names: 'Luis Lopez Perez',
        ci: '76543',
        classroom: 'Tercero "B" - SECUNDARIA',
        sharedTutor: 'Carlos Lopez',
      });
      expect(mockPrisma.studentGuardian.findMany).toHaveBeenCalledWith({
        where: {
          guardianId: { in: ['guardian-99'] },
          studentId: { not: 'student-1' },
        },
        include: {
          guardian: true,
          student: {
            include: {
              enrollments: {
                where: {
                  academicYear: { status: 'ACTIVE' },
                  status: 'INSCRITO',
                },
                include: { classroom: true },
              },
            },
          },
        },
      });
    });
  });

  describe('update (Actualizar Inscripción/Estado)', () => {
    it('debe lanzar NotFoundException si la inscripción a actualizar no existe', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { status: 'INSCRITO' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si se intenta marcar como INSCRITO un estudiante no-antiguo sin código RUDE', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
        enrollmentType: 'REGULAR',
        studentId: 'student-1',
        student: { rudeCode: null },
      });

      await expect(
        service.update('enroll-1', { status: 'INSCRITO' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe actualizar el estado y el código RUDE si se provee en el DTO', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
        enrollmentType: 'REGULAR',
        studentId: 'student-1',
        student: { rudeCode: null },
      });
      mockPrisma.enrollment.update.mockResolvedValue({
        id: 'enroll-1',
        status: 'INSCRITO',
        student: { id: 'student-1', rudeCode: '8073010203' },
      });
      mockPrisma.student.update.mockResolvedValue({});

      const result = await service.update('enroll-1', {
        status: 'INSCRITO',
        rudeCode: '8073010203',
      });

      expect(result.status).toBe('INSCRITO');
      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: { rudeCode: '8073010203' },
      });
    });
  });
});
