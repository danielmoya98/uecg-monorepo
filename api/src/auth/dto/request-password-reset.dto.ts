import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Correo institucional o CI',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  identifier: string;
}
