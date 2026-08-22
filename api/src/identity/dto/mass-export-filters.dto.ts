import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MassExportFiltersDto {
  @ApiPropertyOptional({
    description: 'Nivel educativo para filtrar (INICIAL, PRIMARIA, SECUNDARIA)',
    example: 'SECUNDARIA',
  })
  @IsString()
  @IsOptional()
  level?: string;

  @ApiPropertyOptional({
    description: 'UUID del curso específico para filtrar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El classroomId debe ser un UUID válido.' })
  @IsOptional()
  classroomId?: string;
}
