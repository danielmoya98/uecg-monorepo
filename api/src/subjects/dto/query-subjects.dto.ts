import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EducationLevel } from '../../../prisma/generated/client';

export class QuerySubjectsDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: EducationLevel,
    description:
      'Filtrar materias por nivel educativo (INICIAL, PRIMARIA, SECUNDARIA)',
    example: 'SECUNDARIA',
  })
  @IsEnum(EducationLevel, { message: 'Nivel educativo inválido' })
  @IsOptional()
  level?: EducationLevel;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado activo/inactivo (true = solo activas, false = solo inactivas)',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1')
      return true;
    if (value === 'false' || value === false || value === 0 || value === '0')
      return false;
    return undefined;
  })
  @IsBoolean({ message: 'isActive debe ser un booleano' })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Si es true, devuelve todas las materias coincidentes sin paginar (ideal para dropdowns / selectores)',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1')
      return true;
    return false;
  })
  @IsBoolean({ message: 'all debe ser un booleano' })
  @IsOptional()
  all?: boolean;
}

