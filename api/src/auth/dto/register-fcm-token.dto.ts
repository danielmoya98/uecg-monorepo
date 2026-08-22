import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging Token',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(500)
  fcmToken: string;
}
