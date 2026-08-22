import {
  IsBoolean,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationChannel } from '../../../prisma/generated/client';

export class UpdateCampaignSettingsDto {
  @ApiPropertyOptional({
    description: 'Activa o desactiva la recepción de datos web',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  enableDigitalRudeUpdates?: boolean;

  @ApiPropertyOptional({
    description: 'Límite de solicitudes por estudiante',
    minimum: 1,
    maximum: 5,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRudeUpdatesPerYear?: number;

  @ApiPropertyOptional({
    enum: NotificationChannel,
    isArray: true,
    description: 'Canales activos para notificar',
    example: ['PUSH_APP'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, {
    each: true,
    message: 'Canal de notificación inválido',
  })
  activeNotificationChannels?: NotificationChannel[];
}
