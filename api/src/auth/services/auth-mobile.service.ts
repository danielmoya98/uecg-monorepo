import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { RegisterStudentDto } from '../dto/register-student.dto';

import { RegisterGuardianDto } from '../dto/register-guardian.dto';

import { EncryptionService } from '../../common/services/encryption.service';

import { AuthTokenService } from './auth-token.service';

@Injectable()
export class AuthMobileService {
  constructor(
    private prisma: PrismaService,

    private encryptionService: EncryptionService,

    private authTokenService: AuthTokenService,
  ) {}

  async registerGuardian(dto: RegisterGuardianDto) {
    const ciHash = this.encryptionService.generateBlindIndex(dto.ci);

    const guardian = await this.prisma.guardian.findUnique({
      where: {
        ciHash: ciHash as string,
      },
    });

    if (!guardian) {
      throw new NotFoundException('CI no registrado');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        guardianId: guardian.id,
      },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta');
    }

    const rolePadre = await this.prisma.role.findUnique({
      where: { name: 'PADRE' },
    });

    if (!rolePadre) {
      throw new NotFoundException('Rol PADRE no encontrado');
    }

    const institutionalEmail = this.generateInstitutionalEmail(
      guardian.names,
      guardian.lastNamePaterno || '',
      dto.ci,
      'familia',
    );

    const hashedPassword = await this.authTokenService.hashPassword(
      dto.password,
    );

    const newUser = await this.prisma.user.create({
      data: {
        email: institutionalEmail,

        password: hashedPassword,

        fullName: `${guardian.names} ${guardian.lastNamePaterno || ''}`.trim(),

        roleId: rolePadre.id,

        guardianId: guardian.id,

        recoveryEmail: dto.recoveryEmail,

        requiresPasswordChange: false,
      },
    });

    return {
      status: 'SUCCESS',

      user: {
        id: newUser.id,

        fullName: newUser.fullName,

        role: 'PADRE',

        email: newUser.email,
      },
    };
  }

  async registerStudent(dto: RegisterStudentDto) {
    const startDate = new Date(dto.birthDate);

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + 1);

    const ciHash = this.encryptionService.generateBlindIndex(dto.ci);

    const student = await this.prisma.student.findFirst({
      where: {
        ciHash: ciHash as string,

        birthDate: {
          gte: startDate,

          lt: endDate,
        },
      },
    });

    if (!student) {
      throw new UnauthorizedException('Datos inválidos');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        studentId: student.id,
      },
    });

    if (existingUser) {
      throw new ConflictException('Cuenta ya existente');
    }

    const roleStudent = await this.prisma.role.findUnique({
      where: {
        name: 'ESTUDIANTE',
      },
    });

    if (!roleStudent) {
      throw new NotFoundException('Rol ESTUDIANTE no encontrado');
    }

    const institutionalEmail = this.generateInstitutionalEmail(
      student.names,
      student.lastNamePaterno || '',
      dto.ci,
    );

    const hashedPassword = await this.authTokenService.hashPassword(
      dto.password,
    );

    const newUser = await this.prisma.user.create({
      data: {
        email: institutionalEmail,

        password: hashedPassword,

        fullName: `${student.names} ${student.lastNamePaterno || ''}`.trim(),

        roleId: roleStudent.id,

        studentId: student.id,

        recoveryEmail: dto.recoveryEmail,

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
      newUser.role?.permissions.map(
        (rp) => `${rp.permission.action}:${rp.permission.subject}`,
      ) || [];

    const tokens = await this.authTokenService.generateTokens(
      newUser.id,
      newUser.email,
      newUser.role?.name || 'GUEST',
      userPermissions,
    );

    return {
      status: 'SUCCESS',

      // Tokens are returned separately so the controller can set httpOnly cookies.
      // They are NOT included in the final JSON response to the client.
      _tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },

      user: {
        id: newUser.id,

        fullName: newUser.fullName,

        role: newUser.role?.name,

        email: newUser.email,
      },
    };
  }

  private generateInstitutionalEmail(
    names: string,
    lastName: string,
    ci: string | null,
    prefix: string = '',
  ): string {
    const cleanName = names
      .split(' ')[0]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const cleanLastName = lastName
      ? lastName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      : '';

    const ciSuffix = ci ? ci.slice(-3) : '000';

    return prefix === 'familia'
      ? `familia.${cleanLastName}.${ciSuffix}@uecg.edu.bo`
      : `${cleanName}.${cleanLastName}.${ciSuffix}@uecg.edu.bo`;
  }
}
