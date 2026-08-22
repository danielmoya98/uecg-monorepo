import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GuardianUpdateDto {
  @ApiProperty()
  @IsString()
  relationship: string;

  @ApiProperty()
  @IsString()
  names: string;

  @ApiProperty()
  @IsString()
  lastNamePaterno: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastNameMaterno?: string;

  @ApiProperty()
  @IsString()
  ci: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expedition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  institution?: string;
}

export class SubmitDataUpdateDto {
  // --- IDENTIDAD ---
  @ApiProperty()
  @IsString()
  names: string;

  @ApiProperty()
  @IsString()
  lastNamePaterno: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastNameMaterno?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthDepartment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthProvince?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  birthLocality?: string;

  @ApiProperty()
  @IsString()
  birthDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certOficialia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certLibro?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certPartida?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certFolio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ci?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expedition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasDisability?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disabilityRegistry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disabilityCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disabilityType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  disabilityDegree?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disabilityOrigin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasAutism?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  autismType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  learningDisabilityStatus?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningDisabilityTypes?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningSupportLocation?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hasExtraordinaryTalent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  talentType?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  talentSpecifics?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  talentIQ?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  talentModality?: string[];

  // --- DIRECCIÓN Y CONTACTO ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  locality?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  houseNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cellphone?: string;

  // --- IDIOMAS ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  frequentLanguages?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  culturalIdentity?: string;

  // --- SALUD ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nearestHealthCenter?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthCareLocations?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  healthCenterVisits?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  healthInsurance?: string;

  // --- SERVICIOS BÁSICOS ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  water?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bathroom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sewage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  electricity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  garbage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  housingType?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  internetAccess?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  internetFrequency?: string;

  // --- TRABAJO ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  didWork?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workedMonths?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workType?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workShift?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workFrequency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  gotPaid?: boolean;

  // --- TRANSPORTE Y ABANDONO ---
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transportType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transportTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  abandonedLastYear?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  abandonReasons?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  livesWith?: string;

  // --- TUTORES ---
  @ApiProperty({ type: [GuardianUpdateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuardianUpdateDto)
  guardians: GuardianUpdateDto[];
}
