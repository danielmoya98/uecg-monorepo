import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UpdateRequestStatus } from '../../../prisma/generated/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResolveChangeRequestDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(UpdateRequestStatus)
  status!: UpdateRequestStatus;

  @ApiPropertyOptional({
    description: 'Motivo del rechazo en caso de no aprobarse la solicitud',
    example: 'No se adjuntaron las evidencias del examen de recuperación.',
  })
  @IsOptional()
  @IsString({ message: 'El motivo de rechazo debe ser una cadena de texto.' })
  rejectionReason?: string;
}
