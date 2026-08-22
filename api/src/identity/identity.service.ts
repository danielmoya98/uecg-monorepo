import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Injectable()
export class IdentityService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('export-queue') private exportQueue: Queue,
  ) {}

  private getSecretKey(): string {
    const secret = this.configService.get<string>('QR_SECRET');
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException(
          'Falta configurar la variable de entorno QR_SECRET en producción.',
        );
      }
      return 'dev_qr_secret_key_fallback_uecg';
    }
    return secret;
  }

  generateSignedToken(studentId: string, version: number): string {
    const payload = `${studentId}:${version}`;
    const hash = crypto
      .createHmac('sha256', this.getSecretKey())
      .update(payload)
      .digest('hex')
      .slice(0, 10);
    return `${payload}:${hash}`;
  }

  async getStudentQR(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    if (!student.hasActiveQr) return { isActive: false, qr: null };

    try {
      const signedToken = this.generateSignedToken(
        student.id,
        student.qrTokenVersion,
      );
      const qr = await QRCode.toDataURL(signedToken, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      return { isActive: true, qr };
    } catch {
      throw new InternalServerErrorException('Error al generar el QR');
    }
  }

  async generateNewQR(studentId: string) {
    const student = await this.prisma.student.update({
      where: { id: studentId },
      data: { hasActiveQr: true },
    });
    const signedToken = this.generateSignedToken(
      student.id,
      student.qrTokenVersion,
    );
    const qr = await QRCode.toDataURL(signedToken, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
    });
    return {
      message: 'Carnet activado y generado exitosamente',
      isActive: true,
      qr,
    };
  }

  async revokeQR(studentId: string) {
    await this.prisma.student.update({
      where: { id: studentId },
      data: { qrTokenVersion: { increment: 1 }, hasActiveQr: false },
    });
    return {
      message:
        'Carnet revocado. El estudiante no podrá ingresar hasta emitir uno nuevo.',
    };
  }

  async requestMassiveCarnets(
    academicYearId: string,
    filters: { level?: any; classroomId?: string },
    userId: string,
  ) {
    await this.exportQueue.add('generate-massive-carnets', {
      academicYearId,
      ...filters,
      userId,
    });
    return {
      message: 'Generación de carnets iniciada en segundo plano.',
      status: 'processing',
    };
  }

  async validateQrToken(scannedToken: string): Promise<string> {
    const parts = scannedToken.split(':');
    if (parts.length !== 3)
      throw new BadRequestException('Formato de QR inválido o corrupto.'); // 🔥 400 No 500

    const [studentId, versionStr, hash] = parts;

    const payload = `${studentId}:${versionStr}`;
    const expectedHash = crypto
      .createHmac('sha256', this.getSecretKey())
      .update(payload)
      .digest('hex')
      .slice(0, 10);

    const hashBuffer = Buffer.from(hash, 'utf-8');
    const expectedBuffer = Buffer.from(expectedHash, 'utf-8');

    if (
      hashBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Firma de QR adulterada (Posible Fraude).'); // 🔥 400
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { qrTokenVersion: true, hasActiveQr: true },
    });

    if (!student) throw new NotFoundException('Estudiante no encontrado.');

    if (
      !student.hasActiveQr ||
      student.qrTokenVersion !== parseInt(versionStr, 10)
    ) {
      // 🔥 401 Unauthorized para carnets revocados
      throw new ForbiddenException(
        'Este Carnet ha sido REVOCADO o está INACTIVO. Retenga el carnet.',
      );
    }

    return studentId;
  }

  async downloadZip(fileName: string, res: Response) {
    const filePath = path.join(process.cwd(), 'temp-exports', fileName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('El archivo ya no existe o expiró.');
    }
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
