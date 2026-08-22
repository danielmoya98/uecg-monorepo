import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSlotSpaceDto {
  @ApiPropertyOptional({
    description:
      'UUID del espacio físico (salón, cancha, laboratorio) o null si se libera',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  @IsUUID('4', {
    message: 'El physicalSpaceId debe ser un UUID válido si se proporciona.',
  })
  @IsOptional()
  physicalSpaceId?: string | null;
}
