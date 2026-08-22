import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, EnrollmentType } from '../../../prisma/generated/client';

export class GuardianDto {
  @ApiProperty({ description: 'Relación con el estudiante', example: 'MADRE' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ description: 'Cédula de Identidad', example: '2345678' })
  @IsString()
  @IsNotEmpty()
  ci: string;

  @ApiPropertyOptional({ description: 'Complemento de CI', example: '1F' })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiPropertyOptional({ description: 'Lugar de expedición', example: 'LP' })
  @IsString()
  @IsOptional()
  expedition?: string;

  @ApiProperty({ description: 'Apellido Paterno', example: 'Gomez' })
  @IsString()
  @IsNotEmpty()
  lastNamePaterno: string;

  @ApiPropertyOptional({ description: 'Apellido Materno', example: 'Salas' })
  @IsString()
  @IsOptional()
  lastNameMaterno?: string;

  @ApiProperty({ description: 'Nombres', example: 'Maria' })
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiPropertyOptional({ description: 'Idioma habitual', example: 'Aymara' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Ocupación actual',
    example: 'Comerciante',
  })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Nivel de instrucción',
    example: 'Técnico Medio',
  })
  @IsString()
  @IsOptional()
  educationLevel?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del tutor',
    example: '1985-10-12',
  })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    description: 'Teléfono o Celular de contacto',
    example: '67890123',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: 'Cargo laboral', example: 'Vendedora' })
  @IsString()
  @IsOptional()
  jobTitle?: string;

  @ApiPropertyOptional({
    description: 'Institución de trabajo',
    example: 'Independiente',
  })
  @IsString()
  @IsOptional()
  institution?: string;
}

export class RudeDataDto {
  // Dirección
  @ApiProperty({ description: 'Departamento', example: 'LA_PAZ' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Provincia', example: 'Murillo' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: 'Municipio', example: 'La Paz' })
  @IsString()
  @IsNotEmpty()
  municipality: string;

  @ApiPropertyOptional({
    description: 'Localidad/Comunidad',
    example: 'Achumani',
  })
  @IsString()
  @IsOptional()
  locality?: string;

  @ApiPropertyOptional({ description: 'Zona/Barrio', example: 'Achumani' })
  @IsString()
  @IsOptional()
  zone?: string;

  @ApiProperty({ description: 'Calle o Avenida', example: 'Calle 15' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ description: 'Número de casa', example: '120' })
  @IsString()
  @IsOptional()
  houseNumber?: string;

  @ApiPropertyOptional({ description: 'Teléfono fijo', example: '2791234' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Celular', example: '71234567' })
  @IsString()
  @IsNotEmpty()
  cellphone: string;

  // Idioma y Cultura
  @ApiProperty({
    description: 'Idioma en el que aprendió a hablar',
    example: 'Castellano',
  })
  @IsString()
  @IsNotEmpty()
  nativeLanguage: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Idiomas que habla frecuentemente',
    example: ['Castellano', 'Aymara'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frequentLanguages?: string[];

  @ApiPropertyOptional({
    description: 'Autoidentificación cultural',
    example: 'Mestizo',
  })
  @IsString()
  @IsOptional()
  culturalIdentity?: string;

  // Salud
  @ApiPropertyOptional({
    description: '¿Existe centro de salud cercano?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  nearestHealthCenter?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Dónde se atiende de salud',
    example: ['Seguro Social', 'Posta'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  healthCareLocations?: string[];

  @ApiPropertyOptional({
    description: 'Frecuencia de visitas al centro de salud',
    example: '1 a 2 veces al año',
  })
  @IsString()
  @IsOptional()
  healthCenterVisits?: string;

  @ApiPropertyOptional({
    description: '¿Cuenta con seguro de salud?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  healthInsurance?: boolean;

  // Servicios Básicos
  @ApiPropertyOptional({
    description: '¿Acceso a agua potable?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  water?: boolean;

  @ApiPropertyOptional({
    description: '¿Acceso a baño/letrina?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  bathroom?: boolean;

  @ApiPropertyOptional({
    description: '¿Acceso a alcantarillado?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  sewage?: boolean;

  @ApiPropertyOptional({
    description: '¿Acceso a energía eléctrica?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  electricity?: boolean;

  @ApiPropertyOptional({
    description: '¿Acceso a servicio de basura?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  garbage?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de vivienda', example: 'Propia' })
  @IsString()
  @IsOptional()
  housingType?: string;

  // Internet
  @ApiPropertyOptional({
    type: [String],
    description: 'Medio de acceso a Internet',
    example: ['Celular', 'Domicilio'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  internetAccess?: string[];

  @ApiPropertyOptional({
    description: 'Frecuencia de uso de Internet',
    example: 'Diario',
  })
  @IsString()
  @IsOptional()
  internetFrequency?: string;

  // Trabajo
  @ApiPropertyOptional({
    description: '¿Trabajó el año pasado?',
    example: 'NO',
  })
  @IsString()
  @IsOptional()
  didWork?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Meses que trabajó',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workedMonths?: string[];

  @ApiPropertyOptional({
    description: 'Actividad/Tipo de trabajo realizado',
    example: 'Ninguno',
  })
  @IsString()
  @IsOptional()
  workType?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Turno de trabajo',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  workShift?: string[];

  @ApiPropertyOptional({ description: 'Frecuencia de trabajo', example: '' })
  @IsString()
  @IsOptional()
  workFrequency?: string;

  @ApiPropertyOptional({ description: '¿Recibió pago?', example: 'NO' })
  @IsString()
  @IsOptional()
  gotPaid?: string;

  // Transporte
  @ApiProperty({
    description: 'Medio de transporte para ir al colegio',
    example: 'A pie',
  })
  @IsString()
  @IsNotEmpty()
  transportType: string;

  @ApiProperty({
    description: 'Tiempo de traslado en minutos/horas',
    example: '15 minutos',
  })
  @IsString()
  @IsNotEmpty()
  transportTime: string;

  // Abandono
  @ApiPropertyOptional({
    description: '¿Abandonó el colegio la gestión pasada?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  abandonedLastYear?: boolean;

  @ApiPropertyOptional({
    type: [String],
    description: 'Razones de abandono escolar',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  abandonReasons?: string[];

  // Con quién vive
  @ApiProperty({
    description: 'Con quién vive habitualmente',
    example: 'PADRE Y MADRE',
  })
  @IsString()
  @IsNotEmpty()
  livesWith: string;
}

export class CreateFullRudeDto {
  @ApiProperty({
    description: 'UUID del curso destino (Classroom)',
    example: 'classroom-uuid',
  })
  @IsString()
  @IsNotEmpty()
  classroomId: string;

  @ApiProperty({
    description: 'UUID de la gestión académica (AcademicYear)',
    example: 'academic-year-uuid',
  })
  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({
    enum: EnrollmentType,
    description: 'Tipo de Inscripción',
    example: 'NUEVO',
  })
  @IsEnum(EnrollmentType)
  @IsNotEmpty()
  enrollmentType: EnrollmentType;

  @ApiPropertyOptional({
    description: 'Código RUDE (en blanco para nuevos)',
    example: '807301452026001A',
  })
  @IsString()
  @IsOptional()
  rudeCode?: string;

  // Datos del Estudiante
  @ApiPropertyOptional({
    description: 'Cédula de Identidad del Estudiante',
    example: '8765432',
  })
  @IsString()
  @IsOptional()
  ci?: string;

  @ApiPropertyOptional({
    description: 'Complemento de CI del Estudiante',
    example: '',
  })
  @IsString()
  @IsOptional()
  complement?: string;

  @ApiPropertyOptional({ description: 'Lugar de expedición', example: 'LP' })
  @IsString()
  @IsOptional()
  expedition?: string;

  @ApiProperty({
    description: 'Tipo de documento',
    default: 'CI',
    example: 'CI',
  })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    description: 'Nombres del estudiante',
    example: 'Carlos Juan',
  })
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiProperty({ description: 'Apellido Paterno', example: 'Salazar' })
  @IsString()
  @IsNotEmpty()
  lastNamePaterno: string;

  @ApiPropertyOptional({ description: 'Apellido Materno', example: 'Miranda' })
  @IsString()
  @IsOptional()
  lastNameMaterno?: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '2012-04-15' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @ApiProperty({
    enum: Gender,
    description: 'Género del estudiante',
    example: 'MASCULINO',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    description: 'País de nacimiento',
    default: 'BOLIVIA',
    example: 'BOLIVIA',
  })
  @IsString()
  @IsNotEmpty()
  birthCountry: string;

  @ApiPropertyOptional({
    description: 'Departamento de nacimiento',
    example: 'COCHABAMBA',
  })
  @IsString()
  @IsOptional()
  birthDepartment?: string;

  @ApiPropertyOptional({
    description: 'Provincia de nacimiento',
    example: 'Cercado',
  })
  @IsString()
  @IsOptional()
  birthProvince?: string;

  @ApiPropertyOptional({
    description: 'Localidad de nacimiento',
    example: 'Cercado',
  })
  @IsString()
  @IsOptional()
  birthLocality?: string;

  @ApiPropertyOptional({ description: 'Certificado Oficialía', example: '123' })
  @IsString()
  @IsOptional()
  certOficialia?: string;

  @ApiPropertyOptional({ description: 'Certificado Libro', example: '45' })
  @IsString()
  @IsOptional()
  certLibro?: string;

  @ApiPropertyOptional({ description: 'Certificado Partida', example: '67' })
  @IsString()
  @IsOptional()
  certPartida?: string;

  @ApiPropertyOptional({ description: 'Certificado Folio', example: '89' })
  @IsString()
  @IsOptional()
  certFolio?: string;

  // Capacidades Especiales
  @ApiPropertyOptional({
    description: '¿Tiene alguna discapacidad?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hasDisability?: boolean;

  @ApiPropertyOptional({ description: 'Registro de Discapacidad', example: '' })
  @IsString()
  @IsOptional()
  disabilityRegistry?: string;

  @ApiPropertyOptional({ description: 'Código de Discapacidad', example: '' })
  @IsString()
  @IsOptional()
  disabilityCode?: string;

  @ApiPropertyOptional({ description: 'Tipo de Discapacidad', example: '' })
  @IsString()
  @IsOptional()
  disabilityType?: string;

  @ApiPropertyOptional({ description: 'Grado de Discapacidad', example: '' })
  @IsString()
  @IsOptional()
  disabilityDegree?: string;

  @ApiPropertyOptional({
    description: 'Origen de la Discapacidad',
    example: '',
  })
  @IsString()
  @IsOptional()
  disabilityOrigin?: string;

  @ApiPropertyOptional({ description: '¿Tiene autismo?', example: false })
  @IsBoolean()
  @IsOptional()
  hasAutism?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de autismo', example: '' })
  @IsString()
  @IsOptional()
  autismType?: string;

  @ApiPropertyOptional({
    description: 'Estado de dificultad de aprendizaje',
    example: 'NO',
  })
  @IsString()
  @IsOptional()
  learningDisabilityStatus?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tipos de dificultad de aprendizaje',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningDisabilityTypes?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Apoyo recibido en qué centro',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningSupportLocation?: string[];

  @ApiPropertyOptional({
    description: '¿Tiene talento extraordinario?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hasExtraordinaryTalent?: boolean;

  @ApiPropertyOptional({ description: 'Tipo de talento', example: '' })
  @IsString()
  @IsOptional()
  talentType?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Detalle específico de talento',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  talentSpecifics?: string[];

  @ApiPropertyOptional({ description: 'IQ de Talento', example: '' })
  @IsString()
  @IsOptional()
  talentIQ?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Modalidad de talento',
    example: [],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  talentModality?: string[];

  // Relaciones
  @ApiProperty({ type: [GuardianDto], description: 'Tutores/padres asignados' })
  @ValidateNested({ each: true })
  @Type(() => GuardianDto)
  @IsArray()
  guardians: GuardianDto[];

  @ApiPropertyOptional({
    type: RudeDataDto,
    description: 'Datos detallados de RUDE',
  })
  @ValidateNested()
  @Type(() => RudeDataDto)
  @IsOptional()
  rudeData?: RudeDataDto;
}
