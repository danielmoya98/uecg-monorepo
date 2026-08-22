import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500, {
    message: 'El límite máximo permitido es 500',
  })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Término de búsqueda',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Campo de ordenamiento',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sort?: string;
}
