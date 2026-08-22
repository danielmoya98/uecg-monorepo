import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EducationLevel, Shift } from '../../../prisma/generated/client';

export class QueryClassroomsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'UUID de la gestión académica',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'El academicYearId debe ser un UUID válido.' })
  @IsOptional()
  academicYearId?: string;

  @ApiPropertyOptional({
    enum: EducationLevel,
    description: 'Filtrar por nivel educativo (INICIAL, PRIMARIA, SECUNDARIA)',
    example: 'SECUNDARIA',
  })
  @IsEnum(EducationLevel, { message: 'Nivel educativo inválido' })
  @IsOptional()
  level?: EducationLevel;

  @ApiPropertyOptional({
    enum: Shift,
    description: 'Filtrar por turno (MANANA, TARDE, NOCHE)',
    example: 'MANANA',
  })
  @IsEnum(Shift, { message: 'Turno inválido' })
  @IsOptional()
  shift?: Shift;
}
