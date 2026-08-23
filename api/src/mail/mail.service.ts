import { Injectable, Logger } from '@nestjs/common';

import * as nodemailer from 'nodemailer';

import { PrismaService } from '../prisma/prisma.service';
import { InstitutionConfigService } from '../institutions/institution-config.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private institutionConfig: InstitutionConfigService,
  ) {
    // ======================================================
    // SMTP CONFIG
    // ======================================================

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('❌ SMTP_USER o SMTP_PASS no definidos');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',

      auth: {
        user: process.env.SMTP_USER,

        pass: process.env.SMTP_PASS,
      },
    });
  }

  // ======================================================
  // PASSWORD RESET EMAIL
  // ======================================================

  async sendPasswordResetEmail(to: string, fullName: string, code: string) {
    const institution = await this.institutionConfig.getOrNull();

    const senderName = institution?.name || 'Unidad Educativa';

    const mailOptions = {
      from: `"${senderName}" <${process.env.SMTP_USER}>`,

      to,

      subject: 'Código de Recuperación 🔐',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        ">
          <h2 style="
            color: #004488;
            text-align: center;
          ">
            Recuperación de Contraseña
          </h2>

          <p>
            Hola <strong>${fullName}</strong>,
          </p>

          <p>
            Se solicitó un cambio de contraseña
            para tu cuenta institucional.
          </p>

          <p>
            Tu código OTP es:
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <span style="
              background: #004488;
              color: white;
              padding: 14px 24px;
              font-size: 32px;
              letter-spacing: 8px;
              border-radius: 8px;
              font-weight: bold;
              display: inline-block;
            ">
              ${code}
            </span>
          </div>

          <p>
            Este código expirará en
            <strong>15 minutos</strong>.
          </p>

          <hr />

          <p style="
            font-size: 12px;
            color: #666;
          ">
            Si usted no solicitó este cambio,
            ignore este mensaje.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);

      this.logger.log(`📧 Recovery email enviado a ${to}`);

      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando recovery email a ${to}`, error);

      return false;
    }
  }

  // ======================================================
  // RUDE UPDATE EMAIL
  // ======================================================

  async sendRudeUpdateEmail(
    to: string,
    studentName: string,
    updateUrl: string,
  ) {
    const institution = await this.institutionConfig.getOrNull();

    const senderName = institution?.name || 'Unidad Educativa';

    const mailOptions = {
      from: `"${senderName}" <${process.env.SMTP_USER}>`,

      to,

      subject: 'Actualización RUDE Requerida 🏫',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        ">
          <h2 style="
            color: #004488;
            text-transform: uppercase;
          ">
            Actualización de Datos
          </h2>

          <p>
            Estimado tutor,
          </p>

          <p>
            El colegio requiere actualizar
            el formulario RUDE de
            <strong>${studentName}</strong>
            para la gestión actual.
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <a
              href="${updateUrl}"
              style="
                background-color: #004488;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                font-weight: bold;
                border-radius: 4px;
                display: inline-block;
              "
            >
              Actualizar Datos Ahora
            </a>
          </div>

          <p style="
            font-size: 12px;
            color: #666;
          ">
            Si el botón no funciona,
            copie el siguiente enlace:
          </p>

          <p style="
            font-size: 11px;
            color: #888;
            word-break: break-all;
          ">
            ${updateUrl}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);

      this.logger.log(`📧 RUDE email enviado a ${to}`);

      return true;
    } catch (error) {
      this.logger.error(`❌ Error enviando RUDE email a ${to}`, error);

      return false;
    }
  }
}
