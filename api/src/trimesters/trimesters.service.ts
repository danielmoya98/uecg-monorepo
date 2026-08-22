import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrimesterDto } from './dto/update-trimester.dto';
import { Prisma, TrimesterName } from '../../prisma/generated/client'; //
import { EventEmitter2 } from '@nestjs/event-emitter'; // 🔥 Para Domain Events

@Injectable()
export class TrimestersService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2, // 🔥 Inyectamos el emisor de eventos
  ) {}

  async createDefaultTrimesters(
    academicYearId: string,
    startDate: Date,
    endDate: Date,
    tx: Prisma.TransactionClient, // 🔥 Recibe la transacción para no romper la atomicidad
  ) {
    return tx.trimester.createMany({
      data: [
        {
          academicYearId,
          name: TrimesterName.PRIMER_TRIMESTRE,
          startDate,
          endDate,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.SEGUNDO_TRIMESTRE,
          startDate,
          endDate,
          isOpen: false,
        },
        {
          academicYearId,
          name: TrimesterName.TERCER_TRIMESTRE,
          startDate,
          endDate,
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

    // 5. Side-effects (Desacoplados)
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
