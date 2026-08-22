import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por rol del sistema (ej. ADMIN, DOCENTE)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
