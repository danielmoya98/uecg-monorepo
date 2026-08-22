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
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          password: configService.get<string>('REDIS_PASSWORD'),
          database: 0, // 🔥 DB 0 para Caché
          ttl: 60000,
        }),
      }),
    }),

    // 7. Colas Asíncronas con BullMQ (Usando DB 1 y Auto-limpieza)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: true, // Salva la memoria de tu Redis
          removeOnFail: { age: 24 * 3600 },
        },
        prefix: '{uecg-bull}', // Agrupa las llaves limpiamente
      }),
    }),
  ],
  // Exportamos lo que otros módulos necesitarán inyectar directamente
  exports: [PrismaModule, FirebaseModule, CacheModule, BullModule],
})
export class InfrastructureModule {}
