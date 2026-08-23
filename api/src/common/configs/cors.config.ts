import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const logger = new Logger('CORS');

export const getCorsConfig = (): CorsOptions => {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    : [];

  // Siempre permitimos localhost para desarrollo
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    ...envOrigins,
  ];

  return {
    origin: (origin, callback) => {
      const cleanOrigin = origin ? origin.trim().replace(/\/+$/, '') : null;

      // Permitimos peticiones sin origin (Postman, Móviles) o las que estén en la lista
      if (!cleanOrigin || allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        logger.warn(`Bloqueado por CORS: ${origin} (Permitidos: ${allowedOrigins.join(', ')})`);
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
};
