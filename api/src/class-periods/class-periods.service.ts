import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service';

import { CreateClassPeriodDto } from './dto/create-class-period.dto';

import { UpdateClassPeriodDto } from './dto/update-class-period.dto';

import { Shift } from '../../prisma/generated/client';

@Injectable()
export class ClassPeriodsService {
  private readonly logger = new Logger(ClassPeriodsService.name);

  constructor(
    private readonly prisma: PrismaService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ======================================================
  // CACHE HELPERS
  // ======================================================

  private getShiftCacheKey(shift: Shift) {
    return `class_periods_${shift}`;
  }

  private getAllCacheKey() {
    return 'class_periods_all';
  }

  private async invalidateCaches(shift?: Shift) {
    if (shift) {
      await this.cacheManager.del(this.getShiftCacheKey(shift));
    }

    await this.cacheManager.del(this.getAllCacheKey());

    this.logger.log('🧹 Cache invalidado: ClassPeriods');
  }

  // ======================================================
  // VALIDATE TIME LOGIC
  // ======================================================

  private validateTimeLogic(startTime: string, endTime: string) {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor a la hora de fin.',
      );
    }
  }

  // ======================================================
  // VALIDATE OVERLAP
  // ======================================================

  private async validateOverlap(
    shift: Shift,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) {
    const overlappingPeriod = await this.prisma.classPeriod.findFirst({
      where: {
        shift,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
    });

    if (overlappingPeriod) {
      throw new ConflictException(
        `Las horas se solapan con "${overlappingPeriod.name}" (${overlappingPeriod.startTime} - ${overlappingPeriod.endTime}).`,
      );
    }
  }

  // ======================================================
  // VALIDATE ORDER
  // ======================================================

  private async validateOrder(shift: Shift, order: number, excludeId?: string) {
    const existingOrder = await this.prisma.classPeriod.findFirst({
      where: {
        shift,

        order,

        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
    });

    if (existingOrder) {
      throw new ConflictException(
        `El orden ${order} ya está en uso en el turno ${shift}.`,
      );
    }
  }

  // ======================================================
  // CREATE
  // ======================================================

  async create(data: CreateClassPeriodDto) {
    this.validateTimeLogic(data.startTime, data.endTime);

    await this.validateOrder(data.shift, data.order);

    await this.validateOverlap(data.shift, data.startTime, data.endTime);

    const newPeriod = await this.prisma.classPeriod.create({
      data,
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCaches(data.shift);

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit('class-period.created', {
      classPeriodId: newPeriod.id,

      shift: newPeriod.shift,
    });

    this.logger.log(`🕒 Periodo creado: ${newPeriod.name}`);

    return newPeriod;
  }

  // ======================================================
  // FIND ALL
  // ======================================================

  async findAll(shift?: Shift) {
    // ======================================================
    // SHIFT CACHE
    // ======================================================

    if (shift) {
      const cacheKey = this.getShiftCacheKey(shift);

      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        return cached;
      }

      const periods = await this.prisma.classPeriod.findMany({
        where: {
          shift,
        },

        orderBy: {
          order: 'asc',
        },
      });

      // 🔥 FIX TTL
      await this.cacheManager.set(cacheKey, periods, 60 * 60 * 24);

      return periods;
    }

    // ======================================================
    // GLOBAL CACHE
    // ======================================================

    const globalCacheKey = this.getAllCacheKey();

    const cached = await this.cacheManager.get(globalCacheKey);

    if (cached) {
      return cached;
    }

    const periods = await this.prisma.classPeriod.findMany({
      orderBy: [
        {
          shift: 'asc',
        },

        {
          order: 'asc',
        },
      ],
    });

    await this.cacheManager.set(globalCacheKey, periods, 60 * 60 * 24);

    return periods;
  }

  // ======================================================
  // UPDATE
  // ======================================================

  async update(id: string, data: UpdateClassPeriodDto) {
    const period = await this.prisma.classPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException('Periodo no encontrado');
    }

    const checkStartTime = data.startTime || period.startTime;

    const checkEndTime = data.endTime || period.endTime;

    const checkShift = data.shift || period.shift;

    const checkOrder = data.order || period.order;

    if (data.startTime || data.endTime) {
      this.validateTimeLogic(checkStartTime, checkEndTime);

      await this.validateOverlap(checkShift, checkStartTime, checkEndTime, id);
    }

    // 🔥 FIX IMPORTANTE
    if (data.order || data.shift) {
      await this.validateOrder(checkShift, checkOrder, id);
    }

    const updated = await this.prisma.classPeriod.update({
      where: { id },

      data,
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCaches(period.shift);

    if (data.shift && data.shift !== period.shift) {
      await this.invalidateCaches(data.shift);
    }

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit('class-period.updated', {
      classPeriodId: updated.id,

      shift: updated.shift,
    });

    this.logger.log(`✏️ Periodo actualizado: ${updated.name}`);

    return updated;
  }

  // ======================================================
  // REMOVE
  // ======================================================

  async remove(id: string) {
    const period = await this.prisma.classPeriod.findUnique({
      where: { id },
    });

    if (!period) {
      throw new NotFoundException('Periodo no encontrado');
    }

    try {
      await this.prisma.classPeriod.delete({
        where: { id },
      });

      // ======================================================
      // CACHE INVALIDATION
      // ======================================================

      await this.invalidateCaches(period.shift);

      // ======================================================
      // EVENTS
      // ======================================================

      this.eventEmitter.emit('class-period.deleted', {
        classPeriodId: id,

        shift: period.shift,
      });

      this.logger.log(`🗑️ Periodo eliminado: ${period.name}`);

      return {
        message: 'Periodo eliminado correctamente',
      };
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'No puedes eliminar este periodo porque está siendo utilizado.',
        );
      }

      throw error;
    }
  }
}
