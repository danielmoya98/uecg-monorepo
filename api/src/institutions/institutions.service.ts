import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationChannel } from '../../prisma/generated/client';
import { InstitutionConfigService } from './institution-config.service';
import {
  INSTITUTION_EVENTS,
  InstitutionCreatedEvent,
  InstitutionUpdatedEvent,
  InstitutionCampaignSettingsUpdatedEvent,
  InstitutionAttendanceSettingsUpdatedEvent,
} from './events/institution-events';

@Injectable()
export class InstitutionsService {
  constructor(
    private prisma: PrismaService,
    private institutionConfig: InstitutionConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  private async validateDirectorRole(directorId?: string) {
    if (!directorId) return;
    const user = await this.prisma.user.findUnique({
      where: { id: directorId },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException(
        'El usuario especificado como Director no existe.',
      );
    }
    const allowedRoles = ['DIRECTOR', 'SUPER_ADMIN', 'ADMIN'];
    if (!allowedRoles.includes(user.role.name)) {
      throw new BadRequestException(
        `El usuario asignado como Director debe tener un rol administrativo (Actual: ${user.role.name}).`,
      );
    }
  }

  async create(data: CreateInstitutionDto, userId?: string) {
    // 🛡️ BLINDAJE 1: Singleton Enforcement
    const count = await this.prisma.institution.count();
    if (count > 0) {
      throw new ConflictException(
        'Ya existe una institución registrada en el sistema. Utilice el endpoint de actualización para modificar sus datos.',
      );
    }

    const existing = await this.prisma.institution.findUnique({
      where: { rueCode: data.rueCode },
    });
    if (existing)
      throw new ConflictException('El Código RUE ya está registrado');

    // 🛡️ BLINDAJE 2: Validación de Rol Administrativo del Director
    await this.validateDirectorRole(data.directorId);

    const institution = await this.prisma.institution.create({ data });
    this.institutionConfig.invalidate();

    this.eventEmitter.emit(
      INSTITUTION_EVENTS.CREATED,
      new InstitutionCreatedEvent(
        institution.id,
        institution.rueCode,
        institution.name,
        userId,
      ),
    );

    return {
      data: institution,
      message: 'Institución registrada exitosamente',
    };
  }

  async getCurrent() {
    const institution = await this.institutionConfig.getOrNull();
    return { data: institution };
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search, sort } = query;
    const skip = (page - 1) * limit;

    const whereCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { rueCode: { contains: search } },
          ],
        }
      : {};

    let orderBy = {};
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [total, data] = await Promise.all([
      this.prisma.institution.count({ where: whereCondition }),
      this.prisma.institution.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy,
        include: { director: { select: { fullName: true, email: true } } },
      }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: { director: { select: { fullName: true, email: true } } },
    });
    if (!institution) throw new NotFoundException('Institución no encontrada');
    return { data: institution };
  }

  async update(id: string, updateData: UpdateInstitutionDto, userId?: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });
    if (!institution) throw new NotFoundException('Institución no encontrada');

    // 🛡️ BLINDAJE 2: Validación de Rol Administrativo del Director si se actualiza
    if (updateData.directorId) {
      await this.validateDirectorRole(updateData.directorId);
    }

    const updated = await this.prisma.institution.update({
      where: { id },
      data: updateData,
    });
    this.institutionConfig.invalidate();

    this.eventEmitter.emit(
      INSTITUTION_EVENTS.UPDATED,
      new InstitutionUpdatedEvent(updated.id, updateData, userId),
    );

    return { data: updated, message: 'Datos institucionales actualizados' };
  }

  // ==========================================
  // 🔥 CAMPAÑA RUDE DIGITAL (OMNICANAL)
  // ==========================================

  async getCampaignSettings() {
    const institution = await this.institutionConfig.get();

    return {
      enableDigitalRudeUpdates: institution.enableDigitalRudeUpdates,
      maxRudeUpdatesPerYear: institution.maxRudeUpdatesPerYear,
      activeNotificationChannels: institution.activeNotificationChannels,
    };
  }

  async updateCampaignSettings(
    data: {
      enableDigitalRudeUpdates?: boolean;
      maxRudeUpdatesPerYear?: number;
      activeNotificationChannels?: string[];
    },
    userId?: string,
  ) {
    const institution = await this.institutionConfig.get();

    let channels;
    if (data.activeNotificationChannels) {
      channels = data.activeNotificationChannels.map(
        (channel) =>
          NotificationChannel[channel as keyof typeof NotificationChannel],
      );
    }

    const updated = await this.prisma.institution.update({
      where: { id: institution.id },
      data: {
        enableDigitalRudeUpdates: data.enableDigitalRudeUpdates,
        maxRudeUpdatesPerYear: data.maxRudeUpdatesPerYear,
        activeNotificationChannels: channels,
      },
      select: {
        enableDigitalRudeUpdates: true,
        maxRudeUpdatesPerYear: true,
        activeNotificationChannels: true,
      },
    });

    this.institutionConfig.invalidate();

    this.eventEmitter.emit(
      INSTITUTION_EVENTS.CAMPAIGN_UPDATED,
      new InstitutionCampaignSettingsUpdatedEvent(
        institution.id,
        data,
        userId,
      ),
    );

    return {
      data: updated,
      message: 'Configuración de la Campaña RUDE actualizada exitosamente',
    };
  }

  // ==========================================
  // 🔥 MOTOR DE ASISTENCIA Y NOTIFICACIONES
  // ==========================================

  async getAttendanceSettings() {
    const institution = await this.institutionConfig.get();
    return {
      enableQrAttendance: institution.enableQrAttendance,
      enableBiometricAttendance: institution.enableBiometricAttendance,
      lateToleranceMinutes: institution.lateToleranceMinutes,
      absentToleranceMinutes: institution.absentToleranceMinutes,
      notificationFrequency: institution.notificationFrequency,
    };
  }

  async updateAttendanceSettings(
    data: {
      enableQrAttendance?: boolean;
      enableBiometricAttendance?: boolean;
      lateToleranceMinutes?: number;
      absentToleranceMinutes?: number;
      notificationFrequency?: string;
    },
    userId?: string,
  ) {
    const institution = await this.institutionConfig.get();

    // 🛡️ BLINDAJE 3: Validación Cruzada de Tolerancias de Asistencia
    const lateTolerance =
      data.lateToleranceMinutes ?? institution.lateToleranceMinutes;
    const absentTolerance =
      data.absentToleranceMinutes ?? institution.absentToleranceMinutes;

    if (absentTolerance < lateTolerance) {
      throw new BadRequestException(
        `La tolerancia para Falta Injustificada (${absentTolerance} min) no puede ser menor a la tolerancia de Atraso (${lateTolerance} min).`,
      );
    }

    const updated = await this.prisma.institution.update({
      where: { id: institution.id },
      data: {
        enableQrAttendance: data.enableQrAttendance,
        enableBiometricAttendance: data.enableBiometricAttendance,
        lateToleranceMinutes: data.lateToleranceMinutes,
        absentToleranceMinutes: data.absentToleranceMinutes,
        notificationFrequency: data.notificationFrequency as any,
      },
      select: {
        enableQrAttendance: true,
        enableBiometricAttendance: true,
        lateToleranceMinutes: true,
        absentToleranceMinutes: true,
        notificationFrequency: true,
      },
    });

    this.institutionConfig.invalidate();

    this.eventEmitter.emit(
      INSTITUTION_EVENTS.ATTENDANCE_UPDATED,
      new InstitutionAttendanceSettingsUpdatedEvent(
        institution.id,
        data,
        userId,
      ),
    );

    return { data: updated, message: 'Configuración de Asistencia guardada.' };
  }
}
