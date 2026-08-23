import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataUpdatesBroadcastService } from './data-updates-broadcast.service';
import { DataUpdatesTransactionService } from './data-updates-transaction.service';
import { SubmitDataUpdateDto } from './dto/submit-data-update.dto';
import { Prisma } from '../../prisma/generated/client';

import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class DataUpdatesService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private broadcastService: DataUpdatesBroadcastService,
    private transactionService: DataUpdatesTransactionService,
    private eventEmitter: EventEmitter2,
    private institutionConfig: InstitutionConfigService,
  ) {}

  private async validateCampaignAndLimits(enrollmentId: string) {
    const institution = await this.institutionConfig.getOrNull();

    if (!institution || !institution.enableDigitalRudeUpdates) {
      throw new BadRequestException(
        'El periodo de actualización digital se encuentra cerrado.',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: { include: { guardians: { include: { guardian: true } } } },
        rudeRecord: true,
        academicYear: true,
      },
    });

    if (!enrollment) throw new NotFoundException('Inscripción no encontrada.');

    if (enrollment.academicYear.status !== 'ACTIVE') {
      throw new BadRequestException(
        'No se permite actualizar datos de una gestión pasada.',
      );
    }

    if (enrollment.status === 'RETIRADO' || enrollment.status === 'TRASLADO') {
      throw new BadRequestException(
        'No se pueden actualizar datos de un estudiante inactivo.',
      );
    }

    if (enrollment.rudeUpdateCount >= institution.maxRudeUpdatesPerYear) {
      throw new BadRequestException(
        `Ha superado el límite de ${institution.maxRudeUpdatesPerYear} actualizaciones. Acuda a Secretaría.`,
      );
    }

    return enrollment;
  }

  async verifyTokenAndGetData(token: string) {
    let payload: {
      enrollmentId: string;

      purpose: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('El enlace es inválido o ha expirado.');
    }

    // ======================================================
    // VALIDACIÓN PURPOSE
    // ======================================================

    if (payload.purpose !== 'RUDE_UPDATE') {
      throw new UnauthorizedException('Token inválido.');
    }

    const enrollment = await this.validateCampaignAndLimits(
      payload.enrollmentId,
    );

    // ======================================================
    // PENDING CHECK
    // ======================================================

    const pendingRequest = await this.prisma.dataUpdateRequest.findFirst({
      where: {
        enrollmentId: payload.enrollmentId,

        status: 'PENDING',
      },
    });

    if (pendingRequest) {
      throw new BadRequestException(
        'Sus datos ya fueron enviados y se encuentran en revisión.',
      );
    }

    return {
      message: 'Enlace verificado',

      data: {
        enrollmentId: enrollment.id,

        rudeCode: enrollment.student.rudeCode,

        student: {
          names: enrollment.student.names,

          lastNamePaterno: enrollment.student.lastNamePaterno,

          lastNameMaterno: enrollment.student.lastNameMaterno,

          ci: enrollment.student.ci,
        },

        guardians: enrollment.student.guardians.map((g) => ({
          relationship: g.relationship,

          ...g.guardian,
        })),

        rudeRecord: enrollment.rudeRecord,
      },
    };
  }

  async submitUpdate(
    token: string,

    proposedData: SubmitDataUpdateDto,
  ) {
    let payload: {
      enrollmentId: string;

      purpose: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('El enlace es inválido o expiró.');
    }

    // ======================================================
    // VALIDACIÓN PURPOSE
    // ======================================================

    if (payload.purpose !== 'RUDE_UPDATE') {
      throw new UnauthorizedException('Token inválido.');
    }

    await this.validateCampaignAndLimits(payload.enrollmentId);

    // ======================================================
    // EXISTING PENDING
    // ======================================================

    const existingPending = await this.prisma.dataUpdateRequest.findFirst({
      where: {
        enrollmentId: payload.enrollmentId,

        status: 'PENDING',
      },
    });

    // ======================================================
    // UPDATE EXISTING
    // ======================================================

    if (existingPending) {
      await this.prisma.dataUpdateRequest.update({
        where: {
          id: existingPending.id,
        },

        data: {
          proposedData: proposedData as unknown as Prisma.InputJsonValue,
        },
      });

      return {
        message: 'Solicitud actualizada.',

        requestId: existingPending.id,
      };
    }

    // ======================================================
    // CREATE NEW REQUEST
    // ======================================================

    const requestRecord = await this.prisma.dataUpdateRequest.create({
      data: {
        enrollmentId: payload.enrollmentId,

        proposedData: proposedData as unknown as Prisma.InputJsonValue,

        status: 'PENDING',
      },
    });

    return {
      message: 'Enviado a revisión.',

      requestId: requestRecord.id,
    };
  }

  async approveUpdate(requestId: string) {
    const request = await this.prisma.dataUpdateRequest.findUnique({
      where: { id: requestId },
      include: { enrollment: { include: { student: true } } },
    });

    if (!request || request.status !== 'PENDING')
      throw new BadRequestException('Solicitud inválida o ya procesada.');

    await this.transactionService.executeApprovalTransaction(
      requestId,
      request.enrollment.studentId,
      request.enrollmentId,
      request.proposedData,
    );

    // 🔥 EMITIMOS EVENTO: El Listener se encargará de notificar al padre
    this.eventEmitter.emit('data.update.approved', {
      enrollmentId: request.enrollmentId,
      studentId: request.enrollment.studentId,
      studentName: request.enrollment.student.names,
    });

    return { message: 'Fusión exitosa.', status: 'APPROVED' };
  }

  async rejectUpdate(requestId: string, reason: string) {
    const request = await this.prisma.dataUpdateRequest.findUnique({
      where: { id: requestId },
      include: { enrollment: true },
    });

    if (!request || request.status !== 'PENDING')
      throw new NotFoundException('Solicitud no encontrada.');

    await this.prisma.dataUpdateRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    // 🔥 EMITIMOS EVENTO
    this.eventEmitter.emit('data.update.rejected', {
      studentId: request.enrollment.studentId,
      reason: reason,
    });

    return { message: 'Solicitud rechazada.' };
  }

  async markPhysicalDelivery(enrollmentId: string) {
    const institution = await this.institutionConfig.getOrNull();
    const maxUpdates = institution?.maxRudeUpdatesPerYear || 5;

    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { rudeUpdateCount: maxUpdates + 1 }, // 🔥 Dinámico, no hardcoded
    });

    return { message: 'Entrega física registrada.' };
  }

  // Delegadores de Broadcast (se mantienen para el controller)
  async generateUpdateToken(id: string) {
    return this.broadcastService.generateUpdateToken(id);
  }
  async broadcastUpdateCampaign(id: string) {
    return this.broadcastService.broadcastUpdateCampaign(id);
  }
  async broadcastToClassroom(id: string) {
    return this.broadcastService.broadcastToClassroom(id);
  }
  async broadcastToAll() {
    return this.broadcastService.broadcastToAll();
  }
  async previewClassroomBroadcast(id: string) {
    return this.broadcastService.previewClassroomBroadcast(id);
  }
  async getPendingRequests() {
    return this.prisma.dataUpdateRequest.findMany({
      where: {
        status: 'PENDING',
        enrollment: { academicYear: { status: 'ACTIVE' } },
      },
      include: { enrollment: { include: { student: true, classroom: true } } },
    });
  }
}
