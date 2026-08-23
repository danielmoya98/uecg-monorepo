import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthRecoveryService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private eventEmitter: EventEmitter2,
    private authTokenService: AuthTokenService,
  ) {}

  // ======================================================
  // REQUEST PASSWORD RESET
  // ======================================================

  async requestPasswordReset(ciOrEmail: string) {
    const isEmail = ciOrEmail.includes('@');

    const searchHash = !isEmail
      ? this.encryptionService.generateBlindIndex(ciOrEmail)
      : null;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: ciOrEmail.trim().toLowerCase() },
          ...(searchHash
            ? [
                { ciHash: searchHash as string },
                {
                  student: {
                    ciHash: searchHash as string,
                  },
                },
                {
                  guardian: {
                    ciHash: searchHash as string,
                  },
                },
              ]
            : []),
        ],
      },
    });

    // ======================================================
    // ANTI ENUMERACIÓN
    // ======================================================

    const targetEmail = user?.recoveryEmail || user?.email;

    if (!user || !targetEmail) {
      return {
        status: 'SUCCESS',
        message: 'Si la cuenta existe, se ha enviado un código.',
      };
    }

    // ======================================================
    // OTP SEGURO
    // ======================================================

    const resetCode = crypto.randomInt(100000, 999999).toString();

    // ======================================================
    // HASH OTP
    // ======================================================

    const hashedResetCode = await bcrypt.hash(resetCode, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: hashedResetCode,
        resetCodeExpiresAt: expiresAt,
      },
    });

    // ======================================================
    // DEEP LINK & MAGIC LINK GENERATION
    // ======================================================

    const webMagicLink = `https://uecg.edu.bo/reset-password?code=${resetCode}&email=${encodeURIComponent(user.email)}`;
    const mobileDeepLink = `uecg://reset-password?code=${resetCode}&email=${encodeURIComponent(user.email)}`;

    // ======================================================
    // EVENT DRIVEN
    // ======================================================

    this.eventEmitter.emit('auth.password_reset.requested', {
      email: targetEmail,
      fullName: user.fullName,
      code: resetCode,
      magicLink: webMagicLink,
      deepLink: mobileDeepLink,
    });

    return {
      status: 'SUCCESS',
      message: 'Si la cuenta existe, se ha enviado un código.',
    };
  }

  // ======================================================
  // RESET PASSWORD WITH OTP
  // ======================================================

  async resetPasswordWithCode(
    ciOrEmail: string,
    code: string,
    newPassword: string,
  ) {
    const isEmail = ciOrEmail.includes('@');

    const searchHash = !isEmail
      ? this.encryptionService.generateBlindIndex(ciOrEmail)
      : null;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: ciOrEmail.trim().toLowerCase() },
          ...(searchHash
            ? [
                { ciHash: searchHash as string },
                {
                  student: {
                    ciHash: searchHash as string,
                  },
                },
                {
                  guardian: {
                    ciHash: searchHash as string,
                  },
                },
              ]
            : []),
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Código o identificador inválido');
    }

    // ======================================================
    // EXPIRACIÓN Y VALIDACIÓN OTP
    // ======================================================

    if (
      !user.resetCodeExpiresAt ||
      !user.resetCode ||
      new Date() > (user.resetCodeExpiresAt as Date)
    ) {
      throw new UnauthorizedException('Código expirado o inválido');
    }

    const isCodeValid = await bcrypt.compare(code, user.resetCode);

    if (!isCodeValid) {
      throw new UnauthorizedException('Código expirado o inválido');
    }

    // ======================================================
    // NUEVA PASSWORD
    // ======================================================

    const hashedPassword =
      await this.authTokenService.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpiresAt: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    return {
      status: 'SUCCESS',
      message: 'Contraseña actualizada correctamente',
    };
  }
}
