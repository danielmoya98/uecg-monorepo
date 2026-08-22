import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { Classroom, ClassPeriod } from '../../prisma/generated/client';
const archiver = require('archiver');

// 🔥 1. Importaciones de React-PDF
import { renderToBuffer } from '@react-pdf/renderer';
import { TimetableTemplate } from './templates/timetable.template';
import React from 'react';

@Processor('export-queue')
export class TimetablesProcessor extends WorkerHost {
  private readonly logger = new Logger(TimetablesProcessor.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'generate-massive-zip') {
      return this.handleMassiveZip(job.data);
    }
  }

  private async handleMassiveZip(data: {
    academicYearId: string;
    userId: string;
  }) {
    this.logger.log(
      '👷‍♂️ [WORKER] Iniciando generación masiva de PDFs de forma nativa...',
    );
    const { academicYearId, userId } = data;

    // 🚀 PRECARGA DE DATOS: Obtenemos todas las aulas con su año escolar en una sola consulta
    const classrooms = await this.prisma.classroom.findMany({
      where: { academicYearId },
      include: { academicYear: true },
    });

    // 🚀 OPTIMIZACIÓN N+1: Cargamos todos los bloques horarios una vez y los agrupamos en memoria
    const allPeriods = await this.prisma.classPeriod.findMany({
      orderBy: { order: 'asc' },
    });

    const periodsByShift = {
      MANANA: allPeriods.filter((p) => p.shift === 'MANANA'),
      TARDE: allPeriods.filter((p) => p.shift === 'TARDE'),
      NOCHE: allPeriods.filter((p) => p.shift === 'NOCHE'),
    };

    const exportsDir = path.join(process.cwd(), 'temp-exports');
    if (!fs.existsSync(exportsDir))
      fs.mkdirSync(exportsDir, { recursive: true });

    const zipFileName = `Horarios_${academicYearId}_${Date.now()}.zip`;
    const zipFilePath = path.join(exportsDir, zipFileName);

    const output = fs.createWriteStream(zipFilePath);
    const createArchive = archiver.default || archiver;
    const archive = createArchive('zip', { zlib: { level: 9 } });

    const archivePromise = new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
    });

    archive.pipe(output);

    // 🚀 Bucle limpio y optimizado a O(1) consultas repetitivas de aulas y periodos
    for (const classroom of classrooms) {
      const periods = periodsByShift[classroom.shift] || [];
      const pdfBuffer = await this.generatePdfBuffer(classroom, periods);
      const fileName = `${classroom.level}/${classroom.grade}_${classroom.section}.pdf`;
      archive.append(pdfBuffer, { name: fileName });
    }

    await archive.finalize();
    await archivePromise;

    this.logger.log(`✅ [WORKER] ZIP generado con éxito: ${zipFileName}`);
    this.eventEmitter.emit('timetables.massive.completed', {
      userId,
      academicYearId,
      fileName: zipFileName,
    });
  }

  // 🔥 3. Generador optimizado sin N+1 query a base de datos de aulas y bloques
  private async generatePdfBuffer(
    classroom: Classroom,
    periods: ClassPeriod[],
  ): Promise<Buffer> {
    const slots = await this.prisma.scheduleSlot.findMany({
      where: { classroomId: classroom.id },
      include: {
        teacherAssignment: { include: { subject: true, teacher: true } },
        physicalSpace: true,
      },
    });

    // Renderizamos el componente de React directamente a Buffer de memoria
    return await renderToBuffer(
      React.createElement(TimetableTemplate, { classroom, periods, slots }),
    );
  }
}
