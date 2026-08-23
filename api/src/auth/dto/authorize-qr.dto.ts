import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AuthorizeQrDto {
  @ApiProperty({
    description: 'Identificador único del desafío QR generado por la interfaz Web',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El challengeId debe ser una cadena de texto' })
  @IsUUID('4', { message: 'El challengeId debe tener un formato UUID válido' })
  @IsNotEmpty({ message: 'El challengeId es obligatorio' })
  challengeId: string;
}
