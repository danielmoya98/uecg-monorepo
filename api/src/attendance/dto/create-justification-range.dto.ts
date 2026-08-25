import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateJustificationRangeDto {
  @ApiProperty({
    description: 'UUID de la inscripción del estudiante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El enrollmentId debe ser un UUID válido.' })
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    description: 'Fecha inicial de la licencia/justificación (YYYY-MM-DD)',
    example: '2026-05-20',
  })
  @IsDateString(
    {},
    { message: 'La fecha inicial debe ser un formato de fecha válido (YYYY-MM-DD).' },
  )
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Fecha final de la licencia/justificación (YYYY-MM-DD)',
    example: '2026-05-22',
  })
  @IsDateString(
    {},
    { message: 'La fecha final debe ser un formato de fecha válido (YYYY-MM-DD).' },
  )
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Motivo o justificación de la ausencia',
    example: 'Licencia por motivo de salud con certificado médico adjunto',
  })
  @IsString()
  @IsNotEmpty({ message: 'El motivo no puede estar vacío.' })
  @MinLength(5, { message: 'El motivo debe tener al menos 5 caracteres.' })
  reason: string;

  @ApiPropertyOptional({
    description: 'URL del comprobante o certificado digital adjunto',
    example: 'https://storage.googleapis.com/uecg/certificados/medico-123.pdf',
  })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}
