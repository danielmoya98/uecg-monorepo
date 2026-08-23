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
import { Prisma, TrimesterName } from '../../prisma/generated/client';
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
          startDate: new Date(startDate),
          endDate: t1End,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.SEGUNDO_TRIMESTRE,
          startDate: t2Start,
          endDate: t2End,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.TERCER_TRIMESTRE,
          startDate: t3Start,
          endDate: new Date(endDate),
          isOpen: false,
        },
      ],
    });
  }

  // ==========================================
  // API PÚBLICA (Controladores)
  // ==========================================

  async getByAcademicYear(academicYearId: string) {
    return this.prisma.trimester.findMany({
      where: { academicYearId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: UpdateTrimesterDto) {
    // 1. Obtener el trimestre y el Agregado Padre (AcademicYear)
    const trimester = await this.prisma.trimester.findUnique({
      where: { id },
      include: { academicYear: true }, // 🔥 Necesario para la validación de fronteras
    });

    if (!trimester) throw new NotFoundException('Trimestre no encontrado');

    const newStartDate = data.startDate
      ? new Date(data.startDate)
      : trimester.startDate;
    const newEndDate = data.endDate
      ? new Date(data.endDate)
      : trimester.endDate;

    // 2. Validaciones Lógicas
    if (newStartDate >= newEndDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha de fin',
      );
    }

    // 🔥 Boundary Validation: El trimestre no puede salirse de la gestión
    if (
      newStartDate < trimester.academicYear.startDate ||
      newEndDate > trimester.academicYear.endDate
    ) {
      throw new BadRequestException(
        `Las fechas del trimestre deben estar dentro del rango de la gestión ${trimester.academicYear.year}.`,
      );
    }

    // 3. Captura de Evento de Dominio
    const isClosing = trimester.isOpen === true && data.isOpen === false;

    // 4. Actualización
    const updatedTrimester = await this.prisma.trimester.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: newStartDate }), // Usamos las fechas ya procesadas
        ...(data.endDate && { endDate: newEndDate }),
        ...(data.isOpen !== undefined && { isOpen: data.isOpen }),
      },
    });

    // 5. Side-effects (Desacoplados) e invalidación de caché
    await this.cacheManager.del(this.CURRENT_ACTIVE_CACHE_KEY);

    if (isClosing) {
      // Notifica al sistema. Luego puedes tener un listener que encole un Job en BullMQ
      // para calcular promedios finales o bloquear la subida de notas.
      this.eventEmitter.emit('trimester.closed', {
        trimesterId: updatedTrimester.id,
        academicYearId: updatedTrimester.academicYearId,
      });
    }

    return updatedTrimester;
  }
}
