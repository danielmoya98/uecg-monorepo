import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { InstitutionConfigService } from '../institutions/institution-config.service';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private institutionConfig: InstitutionConfigService,
    @InjectQueue('reports-queue') private reportsQueue: Queue, // Inyectamos BullMQ
  ) {}

  // 1. Obtener Datos Estructurados para una Sola Libreta
  async getIndividualBulletinData(
    enrollmentId: string,
    preloadedInstitution?: any,
  ) {
    // 1. Obtenemos la inscripción + EL PLAN DE ESTUDIOS DEL CURSO + Las Notas
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        academicYear: true,
        classroom: {
          include: {
            // 🔥 CLAVE: Traemos todas las materias asignadas a este curso
            subjectAssignments: {
              include: { subject: true },
            },
          },
        },
        grades: {
          include: {
            teacherAssignment: { include: { subject: true } },
            trimester: true,
          },
        },
      },
    });

    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');

    const institution =
      preloadedInstitution || (await this.institutionConfig.getOrNull());

    const camposMap = new Map<string, any>();

    // 2. PASO A: DIBUJAR EL "ESQUELETO" DE MATERIAS
    // Iteramos sobre las materias del curso para crear las filas vacías
    for (const assignment of enrollment.classroom.subjectAssignments) {
      const areaName = assignment.subject.area || 'OTROS CAMPOS';
      const subjectName = assignment.subject.name;

      if (!camposMap.has(areaName)) {
        camposMap.set(areaName, { areaName, asignaturasMap: new Map() });
      }

      const campo = camposMap.get(areaName);

      if (!campo.asignaturasMap.has(subjectName)) {
        campo.asignaturasMap.set(subjectName, {
          name: subjectName,
          t1: null,
          t2: null,
          t3: null,
        });
      }
    }

    // 3. PASO B: RELLENAR CON LAS NOTAS (SI EXISTEN)
    for (const grade of enrollment.grades) {
      if (grade.status === 'DRAFT') continue;

      const areaName = grade.teacherAssignment.subject.area || 'OTROS CAMPOS';
      const subjectName = grade.teacherAssignment.subject.name;

      // Buscamos si la materia está en nuestro esqueleto
      if (
        camposMap.has(areaName) &&
        camposMap.get(areaName).asignaturasMap.has(subjectName)
      ) {
        const asignatura = camposMap
          .get(areaName)
          .asignaturasMap.get(subjectName);

        if (grade.trimester.name === 'PRIMER_TRIMESTRE')
          asignatura.t1 = grade.finalScore;
        if (grade.trimester.name === 'SEGUNDO_TRIMESTRE')
          asignatura.t2 = grade.finalScore;
        if (grade.trimester.name === 'TERCER_TRIMESTRE')
          asignatura.t3 = grade.finalScore;
      }
    }

    // 4. PASO C: CALCULAR PROMEDIOS Y RETORNAR
    const camposArray = Array.from(camposMap.values()).map((campo) => {
      const asignaturasArray = Array.from(campo.asignaturasMap.values()).map(
        (asig: any) => {
          let suma = 0;
          let divisor = 0;
          if (asig.t1) {
            suma += asig.t1;
            divisor++;
          }
          if (asig.t2) {
            suma += asig.t2;
            divisor++;
          }
          if (asig.t3) {
            suma += asig.t3;
            divisor++;
          }

          asig.promedioAnual = divisor > 0 ? Math.round(suma / divisor) : null;
          return asig;
        },
      );

      return {
        areaName: campo.areaName,
        asignaturas: asignaturasArray,
      };
    });

    return {
      student: enrollment.student,
      institution,
      academicYear: enrollment.academicYear,
      classroom: enrollment.classroom,
      campos: camposArray,
    };
  }
  // 2. Encolar la petición masiva (Se ejecutará en segundo plano)

  async queueMassiveBulletins(payload: {
    academicYearId: string;
    classroomId?: string;
    level?: string; // 🔥 NUEVO
    userId: string;
  }) {
    const job = await this.reportsQueue.add('generate-massive-bulletins', {
      academicYearId: payload.academicYearId,
      classroomId: payload.classroomId,
      level: payload.level, // Pasamos el nivel a la cola
      userId: payload.userId,
    });

    return {
      success: true,
      message: 'La generación masiva ha comenzado en segundo plano.',
      jobId: job.id,
    };
  }

  // 3. Descargar el archivo ZIP generado por el Worker
  async downloadZip(fileName: string, res: Response) {
    const filePath = path.join(process.cwd(), 'temp-exports', fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo ya no existe o expiró.');
    }
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
