import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAcademicYearDto } from './dto/create-academic-year.dto';

import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

import { TrimestersService } from '../trimesters/trimesters.service';

import { PaginationDto } from '../common/dto/pagination.dto';

import { AcademicStatus } from '../../prisma/generated/client';

@Injectable()
export class AcademicYearsService {
  private readonly logger = new Logger(AcademicYearsService.name);

  private readonly CURRENT_ACTIVE_CACHE_KEY = 'academic-year:current-active';

  constructor(
    private readonly prisma: PrismaService,

    private readonly trimestersService: TrimestersService,

    private readonly eventEmitter: EventEmitter2,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ======================================================
  // INTERNAL RULES
  // ======================================================

  private async deactivateOtherActiveYears(tx: any, excludeId?: string) {
    await tx.academicYear.updateMany({
      where: {
        status: AcademicStatus.ACTIVE,

        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },

      data: {
        status: AcademicStatus.CLOSED,
      },
    });
  }

  // ======================================================
  // CACHE INVALIDATION
  // ======================================================

  private async invalidateCurrentAcademicYearCache() {
    await this.cacheManager.del(this.CURRENT_ACTIVE_CACHE_KEY);

    this.logger.log('🧹 Cache invalidado: Current Academic Year');
  }

  // ======================================================
  // CREATE
  // ======================================================

  async create(data: CreateAcademicYearDto) {
    const existingYear = await this.prisma.academicYear.findUnique({
      where: {
        year: data.year,
      },
    });

    if (existingYear) {
      throw new ConflictException(
        `La gestión ${data.year} ya está registrada.`,
      );
    }

    if (data.startDate >= data.endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha de fin.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // ======================================================
      // ONLY ONE ACTIVE YEAR
      // ======================================================

      if (data.status === AcademicStatus.ACTIVE) {
        await this.deactivateOtherActiveYears(tx);
      }

      // ======================================================
      // CREATE YEAR
      // ======================================================

      const newYear = await tx.academicYear.create({
        data,
      });

      // ======================================================
      // DEFAULT TRIMESTERS
      // ======================================================

      await this.trimestersService.createDefaultTrimesters(
        newYear.id,
        data.startDate,
        data.endDate,
        tx,
      );

      return newYear;
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit('academic-year.created', {
      academicYearId: result.id,

      year: result.year,
    });

    this.logger.log(`📚 Gestión académica creada: ${result.year}`);

    return result;
  }

  // ======================================================
  // FIND ALL
  // ======================================================

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search, sort } = query;

    const skip = (page - 1) * limit;

    const whereCondition: any = search
      ? {
          name: {
            contains: search,

            mode: 'insensitive',
          },
        }
      : {};

    let orderBy = {};

    if (sort) {
      const isDesc = sort.startsWith('-');

      const field = isDesc ? sort.substring(1) : sort;

      orderBy = {
        [field]: isDesc ? 'desc' : 'asc',
      };
    } else {
      orderBy = {
        year: 'desc',
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.academicYear.count({
        where: whereCondition,
      }),

      this.prisma.academicYear.findMany({
        where: whereCondition,

        skip,

        take: limit,

        orderBy,

        include: {
          _count: {
            select: {
              classrooms: true,
            },
          },
        },
      }),
    ]);

    return {
      data,

      meta: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======================================================
  // FIND ONE
  // ======================================================

  async findOne(id: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },

      include: {
        trimesters: {
          orderBy: {
            name: 'asc',
          },
        },

        _count: {
          select: {
            classrooms: true,
          },
        },
      },
    });

    if (!academicYear) {
      throw new NotFoundException('Gestión académica no encontrada');
    }

    return academicYear;
  }

  // ======================================================
  // CURRENT ACTIVE
  // ======================================================

  async findCurrentActive() {
    // ======================================================
    // CACHE HIT
    // ======================================================

    const cached = await this.cacheManager.get(this.CURRENT_ACTIVE_CACHE_KEY);

    if (cached) {
      this.logger.log('⚡ Current Academic Year desde cache');

      return cached;
    }

    // ======================================================
    // DB QUERY
    // ======================================================

    const current = await this.prisma.academicYear.findFirst({
      where: {
        status: AcademicStatus.ACTIVE,
      },

      include: {
        trimesters: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    // ======================================================
    // CACHE STORE
    // ======================================================

    if (current) {
      await this.cacheManager.set(
        this.CURRENT_ACTIVE_CACHE_KEY,
        current,
        60 * 5,
      );
    }

    return current;
  }

  // ======================================================
  // UPDATE
  // ======================================================

  async update(id: string, data: UpdateAcademicYearDto) {
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser menor a la fecha de fin.',
      );
    }

    const updatedYear = await this.prisma.$transaction(async (tx) => {
      const currentYear = await tx.academicYear.findUnique({
        where: { id },
      });

      if (!currentYear) {
        throw new NotFoundException('Gestión académica no encontrada');
      }

      if (data.year) {
        const existingYear = await tx.academicYear.findUnique({
          where: {
            year: data.year,
          },
        });

        if (existingYear && existingYear.id !== id) {
          throw new ConflictException(`La gestión ${data.year} ya existe.`);
        }
      }

      // ======================================================
      // ONLY ONE ACTIVE YEAR
      // ======================================================

      if (
        data.status === AcademicStatus.ACTIVE &&
        currentYear.status !== AcademicStatus.ACTIVE
      ) {
        await this.deactivateOtherActiveYears(tx, id);
      }

      return tx.academicYear.update({
        where: { id },

        data,
      });
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit('academic-year.updated', {
      academicYearId: updatedYear.id,

      year: updatedYear.year,
    });

    this.logger.log(`✏️ Gestión académica actualizada: ${updatedYear.year}`);

    return updatedYear;
  }

  // ======================================================
  // REMOVE
  // ======================================================

  async remove(id: string) {
    const year = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      const classroomsCount = await tx.classroom.count({
        where: {
          academicYearId: id,
        },
      });

      if (classroomsCount > 0) {
        throw new ConflictException(
          'No se puede eliminar la gestión porque tiene cursos y paralelos asignados. Cámbiela a estado CLOSED.',
        );
      }

      await tx.trimester.deleteMany({
        where: {
          academicYearId: id,
        },
      });

      await tx.academicYear.delete({
        where: { id },
      });
    });

    // ======================================================
    // CACHE INVALIDATION
    // ======================================================

    await this.invalidateCurrentAcademicYearCache();

    // ======================================================
    // EVENTS
    // ======================================================

    this.eventEmitter.emit('academic-year.deleted', {
      academicYearId: id,

      year: year.year,
    });

    this.logger.log(`🗑️ Gestión académica eliminada: ${year.year}`);

    return {
      message: `Gestión ${year.year} eliminada correctamente.`,
    };
  }
}
