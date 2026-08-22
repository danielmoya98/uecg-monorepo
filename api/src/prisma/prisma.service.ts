import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/client';
import { envs } from 'src/config/envs';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: envs.DATABASE_URL });
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }
}
