import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Institution } from '../../prisma/generated/client';

@Injectable()
export class InstitutionConfigService {
  private readonly logger = new Logger(InstitutionConfigService.name);
  private cache: Institution | null = null;
  private cacheExpiry = 0;
  private readonly TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<Institution> {
    const institution = await this.getOrNull();
    if (!institution) {
      throw new NotFoundException(
        'No se encontró la configuración de la Institución.',
      );
    }
    return institution;
  }

  async getOrNull(): Promise<Institution | null> {
    if (this.cache && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    const institution = await this.prisma.institution.findFirst({
      orderBy: { createdAt: 'asc' },
      include: { director: { select: { fullName: true, email: true } } },
    });

    if (institution) {
      this.cache = institution;
      this.cacheExpiry = Date.now() + this.TTL;
    }

    return institution;
  }

  async getAttendanceSettings() {
    const inst = await this.get();
    return {
      enableQrAttendance: inst.enableQrAttendance,
      enableBiometricAttendance: inst.enableBiometricAttendance,
      lateToleranceMinutes: inst.lateToleranceMinutes,
      absentToleranceMinutes: inst.absentToleranceMinutes,
      notificationFrequency: inst.notificationFrequency,
    };
  }

  async getCampaignSettings() {
    const inst = await this.get();
    return {
      enableDigitalRudeUpdates: inst.enableDigitalRudeUpdates,
      maxRudeUpdatesPerYear: inst.maxRudeUpdatesPerYear,
      activeNotificationChannels: inst.activeNotificationChannels,
    };
  }

  @OnEvent('institution.*')
  handleInstitutionEvent() {
    this.logger.log('🔄 Evento de institución recibido: Purgando caché en memoria');
    this.invalidate();
  }

  invalidate() {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

