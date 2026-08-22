import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Carlos Mendoza',
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío si se proporciona' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  fullName?: string;

  @ApiPropertyOptional({
    example: '1234567',
    description: 'Cédula de Identidad',
  })
  @IsOptional()
  @IsString()
  ci?: string;

  @ApiPropertyOptional({
    example: '70012345',
    description: 'Teléfono o Celular',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección de domicilio',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Matemáticas',
    description: 'Especialidad profesional',
  })
  @IsOptional()
  @IsString()
  specialty?: string;
}
