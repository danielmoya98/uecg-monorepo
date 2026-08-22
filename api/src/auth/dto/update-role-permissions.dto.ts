import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: 'Lista de IDs de permisos a asignar al rol',
    type: [String],
    example: ['uuid-perm-1', 'uuid-perm-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
