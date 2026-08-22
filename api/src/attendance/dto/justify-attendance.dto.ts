import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JustifyAttendanceDto {
  @ApiProperty({
    description: 'Razón o justificativo de la falta/atraso',
    example: 'Falta por motivos médicos con certificado',
  })
  @IsString()
  @IsNotEmpty({ message: 'El justificativo no puede estar vacío.' })
  @MinLength(5, {
    message: 'El justificativo debe tener al menos 5 caracteres.',
  })
  justification: string;
}
