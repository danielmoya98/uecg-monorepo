import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Correo institucional o CI',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'Código OTP enviado por correo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  code: string;

  @ApiProperty({
    description: 'Nueva contraseña',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
