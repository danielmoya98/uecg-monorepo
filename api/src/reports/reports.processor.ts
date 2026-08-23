import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Logger } from '@nestjs/common';

// 🔥 FIX 1: Importación correcta para librerías CommonJS en NestJS
const archiver = require('archiver');

// Importamos tu componente React-PDF
import { EventEmitter2 } from '@nestjs/event-emitter';

import { InstitutionConfigService } from '../institutions/institution-config.service';
import { BolivianLibreta } from './templates/BolivianLibreta';

@Processor('reports-queue')
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
    private readonly institutionConfig: InstitutionConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'generate-massive-bulletins') {
      return this.handleMassiveBulletins(job.data);
    }
  }

  private async handleMassiveBulletins(data: {
    academicYearId: string;
    classroomId?: string;
    level?: string; // 🔥 INCLUIMOS EL NIVEL
    userId: string;
  }) {
    this.logger.log(
      '👷‍♂️ [WORKER] Iniciando generación masiva de Libretas (Ley 070)...',
    );
    const { academicYearId, classroomId, level, userId } = data;

    // 🔥 1. QUERY DINÁMICO: Filtramos inteligentemente según lo que pidió el usuario
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        academicYearId,
        status: 'INSCRITO',
        ...(classroomId ? { classroomId } : {}), // Si enviaron curso, filtramos por curso
        ...(level && !classroomId
          ? { classroom: { level: level as any } }
          : {}), // Si enviaron nivel (y no curso), filtramos por nivel
      },
      include: {
        classroom: true,
        student: true,
      },
    });

    if (enrollments.length === 0) {
      this.logger.warn('⚠️ [WORKER] No hay inscritos para procesar.');
      // Opcional: Podrías emitir un evento de error al socket si quieres avisar al cliente
      return;
    }

    // 2. Preparamos el Archiver (ZIP)
    const exportsDir = path.join(process.cwd(), 'temp-exports');
    if (!fs.existsSync(exportsDir))
      fs.mkdirSync(exportsDir, { recursive: true });

    // 🔥 Nombre inteligente para el archivo ZIP
    let scopeName = 'Colegio';
    if (classroomId) scopeName = 'Curso';
    else if (level) scopeName = `Nivel_${level}`;

    const zipFileName = `Libretas_070_${scopeName}_${Date.now()}.zip`;
    const zipFilePath = path.join(exportsDir, zipFileName);

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // Preparamos la institución una sola vez para evitar consultas N+1 en la base de datos
    const institution = await this.institutionConfig.getOrNull();

    // 3. Generamos PDFs en Bucle
    for (const enrollment of enrollments) {
      try {
        // Obtenemos los datos pivoteados pasando la institución precargada
        const bulletinData =
          await this.reportsService.getIndividualBulletinData(
            enrollment.id,
            institution,
          );

        // 🔥 FIX 2: Añadimos 'as any' para bypasear la restricción estricta de React-PDF
        const pdfBuffer = await renderToBuffer(
          React.createElement(BolivianLibreta, { data: bulletinData }) as any,
        );

        // Limpiamos el nombre para que los archivos no fallen en Windows/Linux
        const safeName =
          `${enrollment.student.lastNamePaterno}_${enrollment.student.names}`.replace(
            /[^a-zA-Z0-9]/g,
            '_',
          );
        const folderName = `${enrollment.classroom.grade}_${enrollment.classroom.section}`;
        const fileName = `Libreta_${safeName}.pdf`;

        // Agrupamos por carpetas dentro del ZIP (Ej: Segundo_A / Libreta_Moya_Daniel.pdf)
        archive.append(pdfBuffer, { name: `${folderName}/${fileName}` });
      } catch (error) {
        this.logger.error(
          `❌ Error procesando libreta para matrícula ${enrollment.id}:`,
          error instanceof Error ? error.stack : error,
        );
      }
    }

    await archive.finalize();
    await archivePromise;

    this.logger.log(
      `✅ [WORKER] ZIP de Libretas generado con éxito: ${zipFileName}`,
    );

    // 4. Avisar al Director/Admin vía local event
    this.eventEmitter.emit('reports.massive.completed', {
      userId,
      fileName: zipFileName,
    });
  }
}
