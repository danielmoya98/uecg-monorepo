import { Test, TestingModule } from '@nestjs/testing';
import { DataUpdatesService } from './data-updates.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataUpdatesBroadcastService } from './data-updates-broadcast.service';
import { DataUpdatesTransactionService } from './data-updates-transaction.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('DataUpdatesService - Pruebas Unitarias', () => {
  let service: DataUpdatesService;
  let eventEmitter: EventEmitter2;

  const mockPrisma = {
    institution: {
      findFirst: jest.fn(),
    },
    enrollment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    dataUpdateRequest: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockBroadcastService = {
    generateUpdateToken: jest.fn(),
    broadcastUpdateCampaign: jest.fn(),
    broadcastToClassroom: jest.fn(),
    broadcastToAll: jest.fn(),
    previewClassroomBroadcast: jest.fn(),
  };

  const mockTransactionService = {
    executeApprovalTransaction: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataUpdatesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: DataUpdatesBroadcastService,
          useValue: mockBroadcastService,
        },
        {
          provide: DataUpdatesTransactionService,
          useValue: mockTransactionService,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<DataUpdatesService>(DataUpdatesService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('verifyTokenAndGetData (Verificación de Token Público)', () => {
    it('debe lanzar UnauthorizedException si la verificación del JWT falla', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyTokenAndGetData('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException si el propósito del token es incorrecto', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        enrollmentId: 'enroll-1',
        purpose: 'WRONG_PURPOSE',
      });

      await expect(service.verifyTokenAndGetData('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar BadRequestException si el periodo digital de la institución está cerrado', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        enrollmentId: 'enroll-1',
        purpose: 'RUDE_UPDATE',
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        enableDigitalRudeUpdates: false,
      });

      await expect(service.verifyTokenAndGetData('token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe retornar datos correctamente si el token es válido y los límites son correctos', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        enrollmentId: 'enroll-1',
        purpose: 'RUDE_UPDATE',
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 5,
      });
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
        status: 'INSCRITO',
        rudeUpdateCount: 2,
        academicYear: { status: 'ACTIVE' },
        student: {
          names: 'DANIEL',
          lastNamePaterno: 'MAMANI',
          ci: '1234567',
          rudeCode: '807301',
          guardians: [],
        },
        rudeRecord: null,
      });
      mockPrisma.dataUpdateRequest.findFirst.mockResolvedValue(null);

      const result = await service.verifyTokenAndGetData('valid-token');

      expect(result.message).toBe('Enlace verificado');
      expect(result.data.student.names).toBe('DANIEL');
    });
  });

  describe('submitUpdate (Enviar Actualización RUDE)', () => {
    it('debe crear un nuevo dataUpdateRequest si no existe una solicitud pendiente previa', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        enrollmentId: 'enroll-1',
        purpose: 'RUDE_UPDATE',
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 5,
      });
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
        status: 'INSCRITO',
        rudeUpdateCount: 2,
        academicYear: { status: 'ACTIVE' },
        student: { guardians: [] },
      });
      mockPrisma.dataUpdateRequest.findFirst.mockResolvedValue(null);
      mockPrisma.dataUpdateRequest.create.mockResolvedValue({
        id: 'request-1',
      });

      const dto = {
        names: 'DANIEL',
        lastNamePaterno: 'MAMANI',
        birthDate: '2010-05-15',
        guardians: [],
      };

      const result = await service.submitUpdate('token', dto);

      expect(result.message).toBe('Enviado a revisión.');
      expect(result.requestId).toBe('request-1');
      expect(mockPrisma.dataUpdateRequest.create).toHaveBeenCalled();
    });

    it('debe actualizar la solicitud existente si ya hay un dataUpdateRequest PENDING', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        enrollmentId: 'enroll-1',
        purpose: 'RUDE_UPDATE',
      });
      mockPrisma.institution.findFirst.mockResolvedValue({
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: 5,
      });
      mockPrisma.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
        status: 'INSCRITO',
        rudeUpdateCount: 2,
        academicYear: { status: 'ACTIVE' },
        student: { guardians: [] },
      });
      mockPrisma.dataUpdateRequest.findFirst.mockResolvedValue({
        id: 'request-1',
        status: 'PENDING',
      });

      const dto = {
        names: 'DANIEL',
        lastNamePaterno: 'MAMANI',
        birthDate: '2010-05-15',
        guardians: [],
      };

      const result = await service.submitUpdate('token', dto);

      expect(result.message).toBe('Solicitud actualizada.');
      expect(result.requestId).toBe('request-1');
      expect(mockPrisma.dataUpdateRequest.update).toHaveBeenCalled();
    });
  });

  describe('approveUpdate (Aprobar Fusión RUDE)', () => {
    it('debe lanzar BadRequestException si la solicitud no existe o no está PENDING', async () => {
      mockPrisma.dataUpdateRequest.findUnique.mockResolvedValue(null);

      await expect(service.approveUpdate('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe ejecutar la transacción de aprobación y emitir el evento en caso de éxito', async () => {
      const pendingRequest = {
        id: 'req-1',
        status: 'PENDING',
        enrollmentId: 'enroll-1',
        proposedData: { names: 'DANIEL M' },
        enrollment: {
          studentId: 'student-1',
          student: { names: 'DANIEL' },
        },
      };
      mockPrisma.dataUpdateRequest.findUnique.mockResolvedValue(pendingRequest);
      mockTransactionService.executeApprovalTransaction.mockResolvedValue({});

      const result = await service.approveUpdate('req-1');

      expect(result.status).toBe('APPROVED');
      expect(
        mockTransactionService.executeApprovalTransaction,
      ).toHaveBeenCalledWith(
        'req-1',
        'student-1',
        'enroll-1',
        pendingRequest.proposedData,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('data.update.approved', {
        enrollmentId: 'enroll-1',
        studentId: 'student-1',
        studentName: 'DANIEL',
      });
    });
  });

  describe('rejectUpdate (Rechazar Solicitud RUDE)', () => {
    it('debe rechazar la solicitud, archivarla y emitir el evento correspondiente', async () => {
      const pendingRequest = {
        id: 'req-1',
        status: 'PENDING',
        enrollment: {
          studentId: 'student-1',
        },
      };
      mockPrisma.dataUpdateRequest.findUnique.mockResolvedValue(pendingRequest);

      const result = await service.rejectUpdate(
        'req-1',
        'Documentos ilegibles',
      );

      expect(result.message).toBe('Solicitud rechazada.');
      expect(mockPrisma.dataUpdateRequest.update).toHaveBeenCalledWith({
        where: { id: 'req-1' },
        data: {
          status: 'REJECTED',
          reviewedAt: expect.any(Date),
          rejectionReason: 'Documentos ilegibles',
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('data.update.rejected', {
        studentId: 'student-1',
        reason: 'Documentos ilegibles',
      });
    });
  });

  describe('markPhysicalDelivery (Registrar Carpeta Física)', () => {
    it('debe actualizar el contador de actualizaciones superando el maxUpdates configurado', async () => {
      mockPrisma.institution.findFirst.mockResolvedValue({
        maxRudeUpdatesPerYear: 5,
      });

      const result = await service.markPhysicalDelivery('enroll-1');

      expect(result.message).toBe('Entrega física registrada.');
      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith({
        where: { id: 'enroll-1' },
        data: { rudeUpdateCount: 6 },
      });
    });
  });
});
