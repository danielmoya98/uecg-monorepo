import { Injectable, Logger } from '@nestjs/common';

import { OnEvent } from '@nestjs/event-emitter';

import { DataUpdatesBroadcastService } from './data-updates-broadcast.service';

interface ApprovedPayload {
  enrollmentId: string;

  studentId: string;

  studentName: string;
}

interface RejectedPayload {
  studentId: string;

  reason: string;
}

@Injectable()
export class DataUpdatesListener {
  private readonly logger = new Logger(DataUpdatesListener.name);

  constructor(private readonly broadcastService: DataUpdatesBroadcastService) {}

  // ======================================================
  // APPROVED
  // ======================================================

  @OnEvent('data.update.approved', {
    async: true,
  })
  async handleApproved(payload: ApprovedPayload) {
    this.logger.log(`✅ RUDE aprobado -> ${payload.studentName}`);

    await this.broadcastService.notifyGuardiansByStudentId(
      payload.studentId,

      '✅ Actualización RUDE Aprobada',

      `Los datos de ${payload.studentName} fueron fusionados exitosamente.`,
    );
  }

  // ======================================================
  // REJECTED
  // ======================================================

  @OnEvent('data.update.rejected', {
    async: true,
  })
  async handleRejected(payload: RejectedPayload) {
    this.logger.warn(`❌ RUDE rechazado`);

    await this.broadcastService.notifyGuardiansByStudentId(
      payload.studentId,

      '❌ Formulario RUDE Observado',

      `La solicitud fue rechazada. Motivo: ${payload.reason}`,
    );
  }
}
