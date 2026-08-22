import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { redisStore } from 'cache-manager-redis-yet';

import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

function getRedisConfig(configService: ConfigService) {
  const redisUrl = configService.get<string>('REDIS_URL');
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      const isTls = parsed.protocol === 'rediss:' || parsed.hostname.includes('upstash.io');
      return {
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : 6379,
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        tls: isTls,
      };
    } catch {
      // fallback if URL parsing fails
    }
  }

  const rawHost = configService.get<string>('REDIS_HOST', 'localhost');
  const cleanHost = rawHost
    .replace(/^https?:\/\//i, '')
    .replace(/^rediss?:\/\//i, '')
    .split('/')[0]
    .split(':')[0];

  const port = Number(configService.get<number>('REDIS_PORT', 6379));
  const password = configService.get<string>('REDIS_PASSWORD') || undefined;
  const isTls =
    configService.get<string>('REDIS_TLS') === 'true' ||
    cleanHost.includes('upstash.io') ||
    rawHost.includes('upstash.io');

  return { host: cleanHost, port, password, tls: isTls };
}

@Global()
@Module({
  imports: [
    // 1. Variables de Entorno (Globales)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Bus de Eventos de Dominio
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),

    // 3. Tareas Programadas (Cron Jobs)
    ScheduleModule.forRoot(),

    // 4. Rate Limiting (Protección contra DDoS/Spam - Límite relajado para SPAs)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }]),

    // 5. Módulos Core Internos
    PrismaModule,
    FirebaseModule,

    // 6. Caché con Redis (Usando DB 0)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, password, tls } = getRedisConfig(configService);
        return {
          store: await redisStore({
            socket: {
              host,
              port,
              tls,
            },
            password,
            database: 0, // 🔥 DB 0 para Caché
            ttl: 60000,
          }),
        };
      },
    }),

    // 7. Colas Asíncronas con BullMQ (Usando DB 0 / prefijo y Auto-limpieza)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { host, port, password, tls } = getRedisConfig(configService);
        return {
          connection: {
            host,
            port,
            password,
            tls: tls ? {} : undefined,
          },
          defaultJobOptions: {
            removeOnComplete: true, // Salva la memoria de tu Redis
            removeOnFail: { age: 24 * 3600 },
          },
          prefix: '{uecg-bull}', // Agrupa las llaves limpiamente
        };
      },
    }),
  ],
  // Exportamos lo que otros módulos necesitarán inyectar directamente
  exports: [PrismaModule, FirebaseModule, CacheModule, BullModule],
})
export class InfrastructureModule {}
