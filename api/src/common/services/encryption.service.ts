import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  private readonly logger = new Logger(EncryptionService.name);

  // ======================================================
  // SECURE KEY
  // ======================================================

  private get key(): Buffer {
    const secret =
      process.env.ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      process.env.SESSION_SECRET ||
      'uecg-school-platform-encryption-salt-2026';

    if (!process.env.ENCRYPTION_KEY) {
      this.logger.debug(
        'ℹ️ ENCRYPTION_KEY no configurada expresamente; utilizando clave derivada del entorno',
      );
    }

    return crypto.createHash('sha256').update(secret).digest();
  }

  // ======================================================
  // ENCRYPT
  // ======================================================

  encrypt(text: string | null): string | null {
    if (!text) return null;

    try {
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');

      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag().toString('hex');

      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      this.logger.error('❌ Error encriptando', error);

      throw new InternalServerErrorException('Error de seguridad interno.');
    }
  }

  // ======================================================
  // DECRYPT
  // ======================================================

  decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return null;

    try {
      const parts = encryptedText.split(':');

      // 🔥 compatibilidad legacy
      if (parts.length !== 3) {
        return encryptedText;
      }

      const [ivHex, authTagHex, encryptedData] = parts;

      const iv = Buffer.from(ivHex, 'hex');

      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');

      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.warn('⚠️ Falló decrypt legacy', error);

      return encryptedText;
    }
  }

  // ======================================================
  // BLIND INDEX
  // ======================================================

  generateBlindIndex(text: string | null): string | null {
    if (!text) return null;

    return crypto
      .createHmac('sha256', this.key)
      .update(text.toLowerCase().trim())
      .digest('hex');
  }
}
