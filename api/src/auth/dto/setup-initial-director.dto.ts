import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  DependencyType,
  Department,
  Shift,
  EducationLevel,
  SchedulingMode,
} from '../../../prisma/generated/client';

export class SetupInitialDirectorDto {
  // ==========================================
  // 1. DATOS DEL USUARIO DIRECTOR
  // ==========================================
  @ApiProperty({ example: 'directora@uecg.edu.bo', description: 'Correo electrónico de la Directora' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Lic. María Elena Ramos', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Contraseña de acceso' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: '1234567', description: 'Cédula de Identidad' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  ci?: string;

  @ApiPropertyOptional({ example: '78901234', description: 'Teléfono celular' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  phone?: string;

  // ==========================================
  // 2. DATOS DE LA INSTITUCIÓN
  // ==========================================
  @ApiProperty({ example: '80730145', description: 'Código RUE / SIE' })
  @IsString()
  @IsNotEmpty({ message: 'El código RUE es obligatorio' })
  rueCode: string;

  @ApiProperty({ example: 'Unidad Educativa Colegio Che Guevara', description: 'Nombre oficial' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la institución es obligatorio' })
  institutionName: string;

  @ApiProperty({ enum: DependencyType, example: DependencyType.FISCAL })
  @IsEnum(DependencyType, { message: 'Tipo de dependencia inválido' })
  dependencyType: DependencyType;

  @ApiProperty({ enum: Department, example: Department.CHUQUISACA })
  @IsEnum(Department, { message: 'Departamento inválido' })
  department: Department;

  @ApiProperty({ example: 'Sucre', description: 'Municipio' })
  @IsString()
  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  municipality: string;

  @ApiProperty({ example: 'Sucre 1', description: 'Distrito Educativo' })
  @IsString()
  @IsNotEmpty({ message: 'El distrito educativo es obligatorio' })
  district: string;

  @ApiProperty({ example: 'Zona Villa Armonía, Calle Principal #123', description: 'Dirección física' })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiPropertyOptional({ example: '46452311', description: 'Teléfono institucional' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  institutionPhone?: string;

  @ApiPropertyOptional({ example: 'contacto@uecg.edu.bo', description: 'Correo institucional' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf((o) => !!o.institutionEmail)
  @IsEmail({}, { message: 'El correo institucional no es válido' })
  institutionEmail?: string;

  @ApiPropertyOptional({ example: 2005, description: 'Año de fundación' })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined ? undefined : Number(value),
  )
  @IsInt({ message: 'El año de fundación debe ser un número entero' })
  foundedYear?: number;

  @ApiProperty({ enum: Shift, isArray: true, example: [Shift.MANANA, Shift.TARDE] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe especificar al menos un turno' })
  @IsEnum(Shift, { each: true, message: 'Turno inválido en el arreglo' })
  shifts: Shift[];

  @ApiProperty({ enum: EducationLevel, isArray: true, example: [EducationLevel.PRIMARIA, EducationLevel.SECUNDARIA] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debe especificar al menos un nivel educativo' })
  @IsEnum(EducationLevel, { each: true, message: 'Nivel educativo inválido en el arreglo' })
  levels: EducationLevel[];

  @ApiPropertyOptional({ enum: SchedulingMode, default: SchedulingMode.FIXED_BASE })
  @IsOptional()
  @IsEnum(SchedulingMode)
  schedulingMode?: SchedulingMode;

  @ApiPropertyOptional({ default: true, description: 'Habilitar asistencia QR' })
  @IsOptional()
  @IsBoolean()
  enableQrAttendance?: boolean;

  @ApiPropertyOptional({ default: 5, description: 'Minutos de tolerancia para atraso' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  @Max(180)
  lateToleranceMinutes?: number;

  @ApiPropertyOptional({ default: 15, description: 'Minutos de tolerancia para falta' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  @Max(180)
  absentToleranceMinutes?: number;
}

