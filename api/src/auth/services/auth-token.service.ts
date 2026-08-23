import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface SessionMetadata {
  deviceType?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

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
  // JWT & MULTI-DEVICE SESSION GENERATION
  // ======================================================

  async generateTokens(
    userId: string,
    email: string,
    roleName: string,
    permissions: string[],
    sessionMetadata?: SessionMetadata,
  ) {
    const basePayload = {
      sub: userId,
      email,
      roleName,
      permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          ...basePayload,
          type: 'access',
          jti: crypto.randomUUID(),
        },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        {
          ...basePayload,
          type: 'refresh',
          jti: crypto.randomUUID(),
        },
        { expiresIn: '7d' },
      ),
    ]);

    const hashedRefreshToken = await this.hashPassword(refreshToken);

    // Si ya existe sessionId (rotación de tokens), actualizamos esa sesión
    if (sessionMetadata?.sessionId) {
      await this.prisma.userSession.update({
        where: { id: sessionMetadata.sessionId },
        data: {
          hashedRefreshToken,
          lastActiveAt: new Date(),
          ipAddress: sessionMetadata.ipAddress,
          userAgent: sessionMetadata.userAgent,
        },
      });
    } else {
      // Limpieza preventiva: mantener un máximo de 10 sesiones concurrentes por usuario
      const activeSessions = await this.prisma.userSession.findMany({
        where: { userId },
        orderBy: { lastActiveAt: 'asc' },
      });

      if (activeSessions.length >= 10) {
        const oldestSessions = activeSessions.slice(0, activeSessions.length - 9);
        await this.prisma.userSession.deleteMany({
          where: { id: { in: oldestSessions.map((s) => s.id) } },
        });
      }

      // Crear nueva sesión multidispositivo
      await this.prisma.userSession.create({
        data: {
          userId,
          hashedRefreshToken,
          deviceType: sessionMetadata?.deviceType || 'UNKNOWN',
          deviceName: sessionMetadata?.deviceName || 'Dispositivo Desconocido',
          ipAddress: sessionMetadata?.ipAddress,
          userAgent: sessionMetadata?.userAgent,
        },
      });
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  // ======================================================
  // REFRESH TOKEN VALIDATION & SESSION MATCHING
  // ======================================================

  async validateRefreshToken(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new Error('Wrong token type');
      }
      return decoded;
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  async findMatchingSession(userId: string, refreshToken: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
    });

    for (const session of sessions) {
      const isMatch = await this.verifyPassword(refreshToken, session.hashedRefreshToken);
      if (isMatch) {
        return session;
      }
    }

    return null;
  }

  // ======================================================
  // MULTI-DEVICE SESSION MANAGEMENT
  // ======================================================

  async getUserSessions(userId: string, currentRefreshToken?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    });

    let currentSessionId: string | null = null;
    if (currentRefreshToken) {
      for (const session of sessions) {
        const isMatch = await this.verifyPassword(currentRefreshToken, session.hashedRefreshToken);
        if (isMatch) {
          currentSessionId = session.id;
          break;
        }
      }
    }

    return sessions.map((s) => ({
      id: s.id,
      deviceType: s.deviceType,
      deviceName: s.deviceName,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.createdAt,
      isCurrent: s.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    return this.prisma.userSession.deleteMany({
      where: { id: sessionId, userId },
    });
  }

  async revokeAllOtherSessions(userId: string, currentRefreshToken: string) {
    const matchedSession = await this.findMatchingSession(userId, currentRefreshToken);
    if (!matchedSession) {
      throw new UnauthorizedException('Sesión actual no identificada');
    }

    return this.prisma.userSession.deleteMany({
      where: {
        userId,
        id: { not: matchedSession.id },
      },
    });
  }

  async revokeSessionByToken(userId: string, refreshToken: string) {
    const session = await this.findMatchingSession(userId, refreshToken);
    if (session) {
      await this.prisma.userSession.delete({
        where: { id: session.id },
      });
    }
  }
}
