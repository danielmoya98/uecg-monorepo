import { Injectable, Logger, Inject } from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

import { OnEvent } from '@nestjs/event-emitter';

import { PrismaService } from '../prisma/prisma.service';
import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly institutionConfig: InstitutionConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ======================================================
  // CACHE HELPERS
  // ======================================================

  private getRootCacheKey() {
    return 'dashboard:root';
  }

  private getGlobalCacheKey() {
    return 'dashboard:global';
  }

  private getTeacherCacheKey(userId: string) {
    return `dashboard:teacher:${userId}`;
  }

  // ======================================================
  // INVALIDATE CACHE
  // ======================================================

  async invalidateDashboardCaches() {
    await this.cacheManager.del(this.getRootCacheKey());

    await this.cacheManager.del(this.getGlobalCacheKey());

    this.logger.log('🧹 Dashboard cache invalidado');
  }

  @OnEvent('classroom.*')
  @OnEvent('class-period.*')
  @OnEvent('academic-year.*')
  @OnEvent('trimester.*')
  @OnEvent('attendance.*')
  @OnEvent('enrollment.*')
  @OnEvent('user.*')
  @OnEvent('data.update.*')
  async handleDataChange() {
    await this.invalidateDashboardCaches();
  }

  // ======================================================
  // BOLIVIA TIME
  // ======================================================

  private getBoliviaTime() {
    const now = new Date();

    const boliviaOffset = -4 * 60;

    const utc = now.getTime() + now.getTimezoneOffset() * 60000;

    const boliviaDate = new Date(utc + boliviaOffset * 60000);

    let dayOfWeek = boliviaDate.getDay();

    if (dayOfWeek === 0) {
      dayOfWeek = 7;
    }

    const currentHourMin = `${String(boliviaDate.getHours()).padStart(
      2,
      '0',
    )}:${String(boliviaDate.getMinutes()).padStart(2, '0')}`;

    return {
      dayOfWeek,

      currentHourMin,

      boliviaDate,
    };
  }

  // ======================================================
  // ROOT DASHBOARD
  // ======================================================

  async getRootStats() {
    const cacheKey = this.getRootCacheKey();

    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const [totalUsers, totalRoles] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.role.count(),
    ]);

    let dbSize = 'Desconocido';

    try {
      const result: any = await this.prisma.$queryRaw`
          SELECT pg_size_pretty(
            pg_database_size(current_database())
          ) as size;
        `;

      dbSize = result[0]?.size || '0 MB';
    } catch {
      this.logger.warn('⚠️ No se pudo obtener tamaño BD');
    }

    const payload = {
      accounts: totalUsers,

      roles: totalRoles,

      dbSize,

      status: 'ONLINE',
    };

    // 🔥 FIX TTL
    await this.cacheManager.set(cacheKey, payload, 60 * 15);

    return payload;
  }

  // ======================================================
  // GLOBAL DASHBOARD
  // ======================================================

  async getGlobalStats() {
    const cacheKey = this.getGlobalCacheKey();

    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const [activeStudents, activeClassrooms, totalTeachers, institution] =
      await Promise.all([
        this.prisma.enrollment.count({
          where: {
            academicYear: {
              status: 'ACTIVE',
            },

            status: 'INSCRITO',
          },
        }),

        this.prisma.classroom.count({
          where: {
            academicYear: {
              status: 'ACTIVE',
            },
          },
        }),

        this.prisma.user.count({
          where: {
            status: 'ACTIVE',

            teacherAssignments: {
              some: {
                classroom: {
                  academicYear: {
                    status: 'ACTIVE',
                  },
                },
              },
            },
          },
        }),

        this.institutionConfig.getOrNull(),
      ]);

    const payload = {
      students: activeStudents,

      teachers: totalTeachers,

      classrooms: activeClassrooms,

      lastSync: institution?.updatedAt
        ? new Date(institution.updatedAt).toLocaleDateString('es-BO')
        : 'Hoy',
    };

    // 🔥 FIX TTL
    await this.cacheManager.set(cacheKey, payload, 60 * 5);

    return payload;
  }

  // ======================================================
  // TEACHER DASHBOARD
  // ======================================================

  async getTeacherStats(userId: string) {
    const cacheKey = this.getTeacherCacheKey(userId);

    // 🔥 SHORT CACHE
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const { dayOfWeek, currentHourMin } = this.getBoliviaTime();

    const nextSlotPromise = this.prisma.scheduleSlot.findFirst({
      where: {
        teacherAssignment: {
          teacherId: userId,
        },

        dayOfWeek,

        classPeriod: {
          startTime: {
            gte: currentHourMin,
          },
        },
      },

      include: {
        classPeriod: true,

        teacherAssignment: {
          include: {
            subject: true,
          },
        },

        classroom: true,
      },

      orderBy: {
        classPeriod: {
          startTime: 'asc',
        },
      },
    });

    const studentsCountPromise = this.prisma.enrollment.count({
      where: {
        status: 'INSCRITO',

        academicYear: {
          status: 'ACTIVE',
        },

        classroom: {
          subjectAssignments: {
            some: {
              teacherId: userId,
            },
          },
        },
      },
    });

    const activeTrimesterPromise = this.prisma.trimester.findFirst({
      where: {
        isOpen: true,

        academicYear: {
          status: 'ACTIVE',
        },
      },
    });

    const classesTodayPromise = this.prisma.scheduleSlot.count({
      where: {
        teacherAssignment: {
          teacherId: userId,
        },

        dayOfWeek,
      },
    });

    const [nextSlot, studentsCount, activeTrimester, classesToday] =
      await Promise.all([
        nextSlotPromise,

        studentsCountPromise,

        activeTrimesterPromise,

        classesTodayPromise,
      ]);

    const payload = {
      nextClassTime: nextSlot ? nextSlot.classPeriod.startTime : '--:--',

      nextSubject: nextSlot
        ? nextSlot.teacherAssignment.subject.name
        : 'SIN CLASES',

      nextGroup: nextSlot
        ? `${nextSlot.classroom.grade} "${nextSlot.classroom.section}"`
        : 'LIBRE',

      studentsCount,

      attendanceStatus: classesToday > 0 ? 'Pendiente hoy' : 'Al día',

      currentTrimester: activeTrimester
        ? activeTrimester.name.replace('_', ' ')
        : 'Cerrado',
    };

    // 🔥 SHORT CACHE
    await this.cacheManager.set(cacheKey, payload, 60);

    return payload;
  }
}
