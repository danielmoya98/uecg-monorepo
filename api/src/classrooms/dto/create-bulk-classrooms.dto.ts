import { ApiProperty } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';

import { EducationLevel, Shift } from '../../../prisma/generated/client';

class ClassroomItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  grade: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  section: string;

  @ApiProperty()
  @IsInt()
  @Min(10)
  @Max(50)
  capacity: number;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => o.baseRoomId !== null && o.baseRoomId !== '')
  baseRoomId?: string | null;
}

export class CreateBulkClassroomsDto {
  @ApiProperty()
  @IsUUID()
  academicYearId: string;

  @ApiProperty({
    enum: EducationLevel,
  })
  @IsEnum(EducationLevel)
  level: EducationLevel;

  @ApiProperty({
    enum: Shift,
  })
  @IsEnum(Shift)
  shift: Shift;

  @ApiProperty({
    type: [ClassroomItemDto],
  })
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ClassroomItemDto)
  classrooms: ClassroomItemDto[];
}
