import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthTokenService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // ======================================================
  // PASSWORD HASHING
  // ======================================================

  async hashPassword(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(plainText, salt);
  }

  async verifyPassword(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }

  // ======================================================
  // JWT GENERATION
  // ======================================================

  async generateTokens(
    userId: string,
    email: string,
    roleName: string,
    permissions: string[],
  ) {
    const basePayload = {
      sub: userId,
      email,
      roleName,
      permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // Access token: short-lived, carries `type: access` + unique jti
      this.jwtService.signAsync(
        {
          ...basePayload,
          type: 'access',
          jti: crypto.randomUUID(),
        },
        { expiresIn: '15m' },
      ),

      // Refresh token: long-lived, carries `type: refresh` only
      this.jwtService.signAsync(
        {
          ...basePayload,
          type: 'refresh',
        },
        { expiresIn: '7d' },
      ),
    ]);

    const hashedRefreshToken = await this.hashPassword(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },

      data: {
        hashedRefreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // ======================================================
  // REFRESH TOKEN VALIDATION
  // ======================================================

  async validateRefreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);

      // Explicitly reject access tokens presented as refresh tokens
      if (decoded.type !== 'refresh') {
        throw new Error('Wrong token type');
      }

      return decoded;
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
