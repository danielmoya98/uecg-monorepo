import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, EnrollmentType } from '../../../prisma/generated/client';

export class EnrollmentGuardianDto {
  @ApiProperty({
    description: 'Relación con el estudiante (PADRE, MADRE, TUTOR)',
    example: 'PADRE',
  })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ description: 'Cédula de Identidad', example: '1234567' })
  @IsString()
  @IsNotEmpty()
  ci: string;

  @ApiProperty({ description: 'Nombres', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiProperty({ description: 'Apellido Paterno', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastNamePaterno: string;

  @ApiPropertyOptional({ description: 'Apellido Materno', example: 'Gómez' })
  @IsString()
  @IsOptional()
  lastNameMaterno?: string;

  @ApiPropertyOptional({
    description: 'Teléfono o Celular',
    example: '76543210',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Ocupación', example: 'Carpintero' })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Nivel de Instrucción',
    example: 'Bachiller',
  })
  @IsString()
  @IsOptional()
  educationLevel?: string;
}

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'UUID del curso (Classroom)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    enum: EnrollmentType,
    description: 'Tipo de inscripción',
    example: 'NUEVO',
  })
  @IsEnum(EnrollmentType)
  @IsNotEmpty()
  enrollmentType: EnrollmentType;

  @ApiPropertyOptional({
    description: 'Cédula de Identidad del estudiante',
    example: '9876543',
  })
  @IsString()
  @IsOptional()
  ci?: string;

  @ApiPropertyOptional({
    description: '¿Tiene alguna discapacidad?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hasDisability?: boolean;

  @ApiPropertyOptional({ description: '¿Tiene autismo?', example: false })
  @IsBoolean()
  @IsOptional()
  hasAutism?: boolean;

  @ApiProperty({
    description: 'Tipo de documento del estudiante',
    default: 'CI',
    example: 'CI',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({ description: 'Nombres del estudiante', example: 'Carlos' })
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiProperty({
    description: 'Apellido Paterno del estudiante',
    example: 'Moya',
  })
  @IsString()
  @IsNotEmpty()
  lastNamePaterno: string;

  @ApiPropertyOptional({
    description: 'Apellido Materno del estudiante',
    example: 'Rios',
  })
  @IsString()
  @IsOptional()
  lastNameMaterno?: string;

  @ApiProperty({
    enum: Gender,
    description: 'Género del estudiante',
    example: 'MASCULINO',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '2015-05-20' })
  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    description: 'País de nacimiento',
    default: 'BOLIVIA',
    example: 'BOLIVIA',
  })
  @IsString()
  @IsNotEmpty()
  birthCountry: string;

  @ApiPropertyOptional({
    description: 'Código RUDE si es antiguo',
    example: '807301452015001A',
  })
  @IsString()
  @IsOptional()
  rudeCode?: string;

  @ApiPropertyOptional({
    type: [EnrollmentGuardianDto],
    description: 'Lista de tutores/padres',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EnrollmentGuardianDto)
  guardians?: EnrollmentGuardianDto[];

  // Formulario Socioeconómico
  @ApiPropertyOptional({
    description: 'Departamento actual de residencia',
    example: 'LA_PAZ',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    description: 'Provincia actual de residencia',
    example: 'Murillo',
  })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({
    description: 'Municipio actual de residencia',
    example: 'Nuestra Señora de La Paz',
  })
  @IsString()
  @IsOptional()
  municipality?: string;

  @ApiPropertyOptional({
    description: 'Calle/Avenida de residencia',
    example: 'Av. Arce',
  })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({
    description: 'Celular de contacto del estudiante/familia',
    example: '65432109',
  })
  @IsString()
  @IsOptional()
  cellphone?: string;

  @ApiPropertyOptional({
    description: 'Idioma nativo/materno',
    example: 'Castellano',
  })
  @IsString()
  @IsOptional()
  nativeLanguage?: string;

  @ApiPropertyOptional({
    description: 'Medio de transporte principal al colegio',
    example: 'Minibus',
  })
  @IsString()
  @IsOptional()
  transportType?: string;

  @ApiPropertyOptional({
    description: 'Tiempo estimado de viaje al colegio en minutos',
    example: '20 minutos',
  })
  @IsString()
  @IsOptional()
  transportTime?: string;

  @ApiPropertyOptional({
    description: 'Con quién vive habitualmente',
    example: 'PADRE Y MADRE',
  })
  @IsString()
  @IsOptional()
  livesWith?: string;
}
