import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '../../../prisma/generated/client';

export interface GuardianContactProfile {
  guardianId: string;
  fcmTokens: string[];
  email?: string | null;
  phone?: string | null;
}

export interface TargetChannelResolution {
  sendPush: boolean;
  sendEmail: boolean;
  whatsappLink: string | null;
  targetEmail: string | null;
  targetTokens: string[];
  isUnreachable: boolean;
}

@Injectable()
export class ChannelResolverService {
  /**
   * Resuelve qué canales utilizar para un tutor dado, respetando los canales habilitados
   * por la institución pero aplicando un fallback inteligente a WhatsApp si el padre no
   * tiene la app instalada ni correo registrado.
   */
  resolveChannels(
    profile: GuardianContactProfile,
    enabledChannels: NotificationChannel[],
    studentName: string,
    updateUrl: string,
  ): TargetChannelResolution {
    const hasFcm = profile.fcmTokens && profile.fcmTokens.length > 0;
    const hasEmail = Boolean(profile.email && profile.email.trim().length > 0);
    const hasPhone = Boolean(profile.phone && profile.phone.trim().length > 0);

    // 1. Evaluación de canales habilitados por la institución
    let sendPush = enabledChannels.includes('PUSH_APP' as NotificationChannel) && hasFcm;
    let sendEmail = enabledChannels.includes('EMAIL' as NotificationChannel) && hasEmail;
    let sendWhatsApp = enabledChannels.includes('WHATSAPP' as NotificationChannel) && hasPhone;

    // 2. 🔥 FALLBACK INTELIGENTE (Smart Fallback)
    // Si ningún canal configurado puede alcanzar a este padre pero tiene otro canal de contacto:
    if (!sendPush && !sendEmail && !sendWhatsApp) {
      if (hasFcm) {
        sendPush = true;
      } else if (hasEmail) {
        sendEmail = true;
      } else if (hasPhone) {
        sendWhatsApp = true;
      }
    }

    let whatsappLink: string | null = null;
    if (sendWhatsApp && profile.phone) {
      const cleanPhone = profile.phone.replace(/\D/g, '');
      const textMessage = `Hola, la Unidad Educativa requiere la actualización del formulario RUDE oficial de *${studentName}*. Por favor, ingrese a este enlace seguro: ${updateUrl}`;
      whatsappLink = `https://api.whatsapp.com/send/?phone=591${cleanPhone}&text=${encodeURIComponent(textMessage)}&type=phone_number&app_absent=0`;
    }

    const isUnreachable = !sendPush && !sendEmail && !sendWhatsApp;

    return {
      sendPush,
      sendEmail,
      whatsappLink,
      targetEmail: sendEmail ? profile.email! : null,
      targetTokens: sendPush ? profile.fcmTokens : [],
      isUnreachable,
    };
  }
}
