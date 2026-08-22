import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { SpaceType } from '../../../prisma/generated/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePhysicalSpaceDto {
  @ApiProperty({
    description: 'Nombre del espacio físico',
    example: 'Aula 101',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del espacio es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiProperty({ description: 'Tipo de espacio', enum: SpaceType })
  @IsEnum(SpaceType, { message: 'El tipo de espacio no es válido' })
  @IsNotEmpty()
  type: SpaceType;

  // 🗑️ ELIMINAMOS EL CAMPO CAPACITY DE AQUÍ

  @ApiProperty({ description: 'Si el espacio está habilitado para su uso' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
