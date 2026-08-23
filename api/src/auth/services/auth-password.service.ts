import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../../prisma/prisma.service';

import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthPasswordService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private authTokenService: AuthTokenService,
  ) {}

  async setupNewPassword(setupToken: string, newPasswordRaw: string) {
    let userId: string;

    try {
      const decoded = await this.jwtService.verifyAsync(setupToken);

      if (decoded.type !== 'setup_password') {
        throw new UnauthorizedException('Token inválido');
      }

      userId = decoded.sub;
    } catch {
      throw new UnauthorizedException('Token expirado o inválido');
    }

    const hashedPassword =
      await this.authTokenService.hashPassword(newPasswordRaw);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },

      data: {
        password: hashedPassword,
        requiresPasswordChange: false,
      },

      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const userPermissions =
      updatedUser.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    const tokens = await this.authTokenService.generateTokens(
      updatedUser.id,
      updatedUser.email,
      updatedUser.role?.name || 'GUEST',
      userPermissions,
    );

    return {
      status: 'SUCCESS',
      message: 'Contraseña actualizada correctamente',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role?.name || 'GUEST',
        permissions: userPermissions,
      },
    };
  }
}

