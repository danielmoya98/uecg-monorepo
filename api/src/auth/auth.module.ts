import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { PermissionsSyncService } from './services/permissions-sync.service';
import { AuthListener } from './auth.listener';
import { AuthTokenService } from './services/auth-token.service';
import { AuthPasswordService } from './services/auth-password.service';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthMobileService } from './services/auth-mobile.service';
import { MailModule } from '../mail/mail.module';
import { MailQueueModule } from '../queues/mail/mail.queue.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
    MailQueueModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          issuer: 'uecg-backend',
          audience: 'uecg-client',
        },
      }),
    }),
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
    RolesService,
    PermissionsSyncService,
    AuthListener,
    AuthTokenService,
    AuthPasswordService,
    AuthRecoveryService,
    AuthMobileService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    PermissionsGuard,
    JwtModule,
  ],
})
export class AuthModule {}

