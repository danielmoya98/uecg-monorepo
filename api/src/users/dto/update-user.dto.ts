import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Carlos Mendoza',
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({
    message: 'El nombre completo no puede estar vacío si se proporciona',
  })
  @MinLength(3, {
    message: 'El nombre completo debe tener al menos 3 caracteres',
  })
  fullName?: string;

  @ApiPropertyOptional({
    example: 'SECRETARIA',
    description: 'Nombre exacto del nuevo rol (ej. ADMIN, DOCENTE, SECRETARIA)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El rol no puede estar vacío si se proporciona' })
  role?: string;
}
