import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Nombre único del rol', example: 'COORDINATOR' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del rol',
    example: 'Coordinador pedagógico con acceso a reportes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
