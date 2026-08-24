import { Injectable, Logger } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';

import { OnEvent } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service';

import { PaginationDto } from '../common/dto/pagination.dto';

import type { AuditEvent } from './interfaces/audit-event.interface';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ======================================================
  // ASYNC AUDIT LISTENER
  // ======================================================

  @OnEvent('system.audit.log', {
    async: true,
  })
  async handleAuditLog(event: AuditEvent) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: event.userId,

          method: event.method,

          route: event.route,

          statusCode: event.statusCode,

          ipAddress: event.ipAddress,

          userAgent: event.userAgent,
        },
      });
    } catch (error) {
      this.logger.error('❌ Error escribiendo audit log', error);
    }
  }

  @OnEvent('institution.*', {
    async: true,
  })
  async handleInstitutionAuditEvent(payload: any) {
    this.logger.log('🛡️ Auditoría de Dominio: Evento de institución capturado');
    if (payload?.userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            userId: payload.userId,
            method: 'EVENT',
            route: `/institutions/${payload.institutionId || ''}`,
            statusCode: 200,
            userAgent: 'EventEmitter2 (Domain Event)',
          },
        });
      } catch (err) {
        this.logger.warn(
          'No se pudo registrar log de auditoría del evento institucional',
          err,
        );
      }
    }
  }

  // ======================================================
  // PAGINATED LOGS
  // ======================================================

  async getLogs(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query;

    const skip = (page - 1) * limit;

    // Búsqueda inteligente multi-campo: busca coincidencia parcial (contains)
    // en ruta, actor (fullName, email) y coincidencia exacta en método HTTP.
    const whereCondition = search
      ? {
          OR: [
            {
              route: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              method: {
                equals: search.toUpperCase(),
              },
            },
            {
              user: {
                fullName: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where: whereCondition,

        skip,

        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        include: {
          user: {
            select: {
              fullName: true,

              email: true,

              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      this.prisma.auditLog.count({
        where: whereCondition,
      }),
    ]);

    return {
      data,

      meta: {
        total,

        page,

        limit,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======================================================
  // AUTO PURGE
  // ======================================================

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleLogPurge() {
    this.logger.log('🧹 Iniciando purga de auditoría...');

    const retentionDays = Number(process.env.AUDIT_RETENTION_DAYS || 180);

    const retentionDate = new Date();

    retentionDate.setDate(retentionDate.getDate() - retentionDays);

    try {
      const { count } = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: retentionDate,
          },
        },
      });

      this.logger.log(`✅ ${count} logs eliminados`);
    } catch (error) {
      this.logger.error('❌ Error purgando auditoría', error);
    }
  }
}
