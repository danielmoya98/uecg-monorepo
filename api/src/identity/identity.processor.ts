import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityService } from './identity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { renderToBuffer } from '@react-pdf/renderer';
import { CarnetTemplate } from './templates/carnet.template';
import React from 'react';
import { Logger } from '@nestjs/common';
import archiver from 'archiver';

@Processor('export-queue')
export class IdentityProcessor extends WorkerHost {
  private readonly logger = new Logger(IdentityProcessor.name);

  constructor(
    private prisma: PrismaService,
    private identityService: IdentityService,
    private eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'generate-massive-carnets') {
      return this.handleMassiveCarnets(job.data);
    }
  }

  private async handleMassiveCarnets(data: {
    academicYearId: string;
    level?: any;
    classroomId?: string;
    userId: string;
  }) {
    this.logger.log('🪪 [WORKER] Iniciando generación de Carnets PVC...');
    const { academicYearId, level, classroomId, userId } = data;

    // Obtenemos solo los inscritos activos
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        academicYearId,
        status: 'INSCRITO',
        classroom: {
          id: classroomId || undefined,
          level: level || undefined,
        },
      },
      include: { student: true, classroom: true, academicYear: true },
    });

    const exportsDir = path.join(process.cwd(), 'temp-exports');
    if (!fs.existsSync(exportsDir))
      fs.mkdirSync(exportsDir, { recursive: true });

    const zipFileName = `Lote_Carnets_${Date.now()}.zip`;
    const zipFilePath = path.join(exportsDir, zipFileName);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // 🔥 OPTIMIZACIÓN: Procesamiento por lotes concurrentes para liberar el Event Loop de Node
    const chunkArray = <T>(array: T[], size: number): T[][] => {
      const chunked: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
      }
      return chunked;
    };

    const batches = chunkArray(enrollments, 10);
    for (const batch of batches) {
      await Promise.all(
        batch.map(async (enrollment) => {
          try {
            let qrResponse = await this.identityService.getStudentQR(
              enrollment.student.id,
            );

            // Si el alumno no tiene carnet activo, se genera automáticamente para el lote
            if (!qrResponse.isActive) {
              qrResponse = await this.identityService.generateNewQR(
                enrollment.student.id,
              );
            }

            const qrBase64 = qrResponse.qr;

            const pdfBuffer = await renderToBuffer(
              React.createElement(CarnetTemplate, {
                student: enrollment.student,
                enrollment,
                qrBase64,
              }),
            );

            // Carpeta interna en el ZIP: Nivel / Curso_Paralelo / Apellido_Nombre.pdf
            const folderName = `${enrollment.classroom.level}/${enrollment.classroom.grade}_${enrollment.classroom.section}`;
            const fileName = `${enrollment.student.lastNamePaterno}_${enrollment.student.names}_${enrollment.student.ci || 'SN'}.pdf`;

            archive.append(pdfBuffer, { name: `${folderName}/${fileName}` });
          } catch (error) {
            this.logger.error(
              `Error generando carnet para ${enrollment.student.id}`,
              error instanceof Error ? error.stack : error,
            );
          }
        }),
      );
    }

    await archive.finalize();
    await archivePromise;

    this.logger.log(`✅ [WORKER] Lote de Carnets ZIP generado: ${zipFileName}`);
    this.eventEmitter.emit('identity.massive.completed', {
      userId,
      academicYearId,
      fileName: zipFileName,
    });
  }
}
