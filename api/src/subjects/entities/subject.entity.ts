import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel } from '../../../prisma/generated/client';

export class SubjectEntity {
  @ApiProperty({
    example: 'd3b07384-d113-4ec2-a5d6-848484848484',
    description: 'Identificador único de la materia',
  })
  id: string;

  @ApiProperty({
    example: 'Matemáticas',
    description: 'Nombre oficial de la asignatura',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'MAT',
    description: 'Sigla o código corto oficial de la materia',
  })
  code?: string;

  @ApiProperty({
    enum: EducationLevel,
    example: 'SECUNDARIA',
    description: 'Nivel educativo en el que se dicta la materia',
  })
  level: EducationLevel;

  @ApiPropertyOptional({
    example: 'Ciencia, Tecnología y Producción',
    description: 'Área o Campo de Saberes al que pertenece',
  })
  area?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la materia está activa en el catálogo',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2026-05-27T19:12:44.000Z',
    description: 'Fecha de creación del registro',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-27T19:12:44.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;
}

