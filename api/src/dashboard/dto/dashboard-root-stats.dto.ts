import { ApiProperty } from '@nestjs/swagger';

export class DashboardRootStatsDto {
  @ApiProperty({
    example: 100,
    description: 'Número total de cuentas registradas',
  })
  accounts: number;

  @ApiProperty({ example: 4, description: 'Número total de roles activos' })
  roles: number;

  @ApiProperty({
    example: '45 MB',
    description: 'Tamaño usado en base de datos PostgreSQL',
  })
  dbSize: string;

  @ApiProperty({
    example: 'ONLINE',
    description: 'Estado general del servidor backend',
  })
  status: string;
}
