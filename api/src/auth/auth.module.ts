import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';

import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';

import { RolesController } from './controllers/roles.controller';

import { RolesService } from './services/roles.service';

import { PermissionsSyncService } from './services/permissions-sync.service';

import { AuthListener } from './auth.listener';

import { AuthTokenService } from './services/auth-token.service';

import { AuthPasswordService } from './services/auth-password.service';

import { AuthRecoveryService } from './services/auth-recovery.service';

import { AuthMobileService } from './services/auth-mobile.service';

import { EncryptionService } from '../common/services/encryption.service';

import { PrismaModule } from '../prisma/prisma.module';

import { MailModule } from '../mail/mail.module';

import { MailQueueModule } from '../queues/mail/mail.queue.module';

// ======================================================
// ENV VALIDATION
// ======================================================

if (!process.env.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET no definido');
}

@Module({
  imports: [
    PrismaModule,

    PassportModule,

    MailModule,

    MailQueueModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET,

      signOptions: {
        issuer: 'uecg-backend',

        audience: 'uecg-client',
      },
    }),
  ],

  controllers: [AuthController, RolesController],

  providers: [
    AuthService,

    JwtStrategy,

    RolesService,

    PermissionsSyncService,

    AuthListener,

    EncryptionService,

    AuthTokenService,

    AuthPasswordService,

    AuthRecoveryService,

    AuthMobileService,
  ],

  exports: [AuthService],
})
export class AuthModule {}
