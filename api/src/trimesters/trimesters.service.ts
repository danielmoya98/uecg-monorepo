import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrimesterDto } from './dto/update-trimester.dto';
import {
  AcademicStatus,
  Prisma,
  TrimesterName,
} from '../../prisma/generated/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TrimestersService {
  private readonly CURRENT_ACTIVE_CACHE_KEY = 'academic-year:current-active';

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createDefaultTrimesters(
    academicYearId: string,
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient,
  ) {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const totalDuration = endMs - startMs;
    const oneThird = Math.floor(totalDuration / 3);

    const t1End = new Date(startMs + oneThird);
    const t2Start = new Date(startMs + oneThird + 86400000);
    const t2End = new Date(startMs + 2 * oneThird);
    const t3Start = new Date(startMs + 2 * oneThird + 86400000);

    return tx.trimester.createMany({
      data: [
        {
          academicYearId,
          name: TrimesterName.PRIMER_TRIMESTRE,
          order: 1,
          startDate: new Date(startDate),
          endDate: t1End,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.SEGUNDO_TRIMESTRE,
          order: 2,
          startDate: t2Start,
          endDate: t2End,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.TERCER_TRIMESTRE,
          order: 3,
          startDate: t3Start,
          endDate: new Date(endDate),
          isOpen: false,
        },
      ],
    });
  }

  // ==========================================
  // API PÚBLICA (Controladores / Servicios)
  // ==========================================

  async getByAcademicYear(academicYearId: string) {
    return this.prisma.trimester.findMany({
      where: { academicYearId },
      orderBy: { order: 'asc' },
    });
  }

  async getActiveTrimesterForYear(academicYearId: string) {
    return this.prisma.trimester.findFirst({
      where: {
        academicYearId,
        isOpen: true,
      },
    });
  }

  async update(id: string, data: UpdateTrimesterDto) {
    // 1. Obtener el trimestre y el Agregado Padre (AcademicYear)
    const trimester = await this.prisma.trimester.findUnique({
      where: { id },
      include: { academicYear: true },
    });

    if (!trimester) throw new NotFoundException('Trimestre no encontrado');

    const newStartDate = data.startDate
      ? new Date(data.startDate)
      : trimester.startDate;
    const newEndDate = data.endDate
      ? new Date(data.endDate)
      : trimester.endDate;

    // 2. Validaciones Lógicas Básicas
    if (newStartDate >= newEndDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha de fin',
      );
    }

    // Boundary Validation: El trimestre no puede salirse de los límites de la gestión
    if (
      newStartDate < trimester.academicYear.startDate ||
      newEndDate > trimester.academicYear.endDate
    ) {
      throw new BadRequestException(
        `Las fechas del trimestre deben estar dentro del rango de la gestión ${trimester.academicYear.year}.`,
      );
    }

    // Regla de Negocio: No se puede abrir un trimestre en una gestión no activa
    if (data.isOpen === true && trimester.academicYear.status !== AcademicStatus.ACTIVE) {
      throw new BadRequestException(
        `No se puede abrir un trimestre en una gestión con estado '${trimester.academicYear.status}'. La gestión debe estar 'ACTIVE'.`,
      );
    }

    // 3. Validación de No-Solapamiento con trimestres vecinos
    const siblingTrimesters = await this.prisma.trimester.findMany({
      where: {
        academicYearId: trimester.academicYearId,
        id: { not: id },
      },
      orderBy: { order: 'asc' },
    });

    for (const sibling of siblingTrimesters) {
      if (sibling.order < trimester.order && newStartDate < sibling.endDate) {
        throw new BadRequestException(
          `La fecha de inicio se solapa con el ${sibling.name} (finaliza el ${sibling.endDate.toISOString().split('T')[0]}).`,
        );
      }
      if (sibling.order > trimester.order && newEndDate > sibling.startDate) {
        throw new BadRequestException(
          `La fecha de fin se solapa con el ${sibling.name} (inicia el ${sibling.startDate.toISOString().split('T')[0]}).`,
        );
      }
    }

    // 4. Captura de Transición de Estados
    const isOpening = trimester.isOpen === false && data.isOpen === true;
    const isClosing = trimester.isOpen === true && data.isOpen === false;

    // 5. Actualización Atómica (Mutua Exclusión: Solo 1 trimestre abierto por gestión)
    const updatedTrimester = await this.prisma.$transaction(async (tx) => {
      if (data.isOpen === true) {
        // Cierra cualquier otro trimestre abierto de la misma gestión
        await tx.trimester.updateMany({
          where: {
            academicYearId: trimester.academicYearId,
            id: { not: id },
            isOpen: true,
          },
          data: { isOpen: false },
        });
      }

      return tx.trimester.update({
        where: { id },
        data: {
          ...(data.startDate && { startDate: newStartDate }),
          ...(data.endDate && { endDate: newEndDate }),
          ...(data.isOpen !== undefined && { isOpen: data.isOpen }),
        },
      });
    });

    // 6. Invalidación de Caché
    await this.cacheManager.del(this.CURRENT_ACTIVE_CACHE_KEY);

    // 7. Eventos de Dominio
    if (isOpening) {
      this.eventEmitter.emit('trimester.opened', {
        trimesterId: updatedTrimester.id,
        academicYearId: updatedTrimester.academicYearId,
        name: updatedTrimester.name,
        order: updatedTrimester.order,
      });
    } else if (isClosing) {
      this.eventEmitter.emit('trimester.closed', {
        trimesterId: updatedTrimester.id,
        academicYearId: updatedTrimester.academicYearId,
        name: updatedTrimester.name,
        order: updatedTrimester.order,
      });
    }

    return updatedTrimester;
  }
}
