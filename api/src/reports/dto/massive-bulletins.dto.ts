import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MassiveBulletinsDto {
  @ApiProperty({
    description: 'UUID de la gestión académica',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El academicYearId debe ser un UUID válido.' })
  @IsNotEmpty()
  academicYearId: string;

  @ApiPropertyOptional({
    description: 'UUID de un curso específico para generar libretas masivas',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsOptional()
  classroomId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel educativo (INICIAL, PRIMARIA, SECUNDARIA)',
    example: 'PRIMARIA',
  })
  @IsString()
  @IsOptional()
  level?: string;
}
