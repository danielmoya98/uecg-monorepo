import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
}
