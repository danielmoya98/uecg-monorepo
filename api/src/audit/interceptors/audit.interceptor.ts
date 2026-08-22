import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import { Observable, throwError } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuditEvent } from '../interfaces/audit-event.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditVigilante');

  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();

    const request = ctx.getRequest();

    const response = ctx.getResponse();

    const { method, originalUrl, ip, headers, body } = request;

    const userAgent = headers['user-agent'] || 'Unknown';

    // ======================================================
    // IGNORE SAFE METHODS
    // ======================================================

    if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      return next.handle();
    }

    // ======================================================
    // IGNORE INTERNAL ROUTES
    // ======================================================

    const ignoredRoutes = ['/health', '/metrics'];

    if (ignoredRoutes.some((route) => originalUrl.includes(route))) {
      return next.handle();
    }

    // ======================================================
    // SANITIZE PAYLOAD
    // ======================================================

    const sanitizedBody = this.sanitizePayload(body);

    return next.handle().pipe(
      tap(() => {
        this.dispatchLogEvent({
          req: request,

          statusCode: response.statusCode,

          method,

          route: originalUrl,

          ip,

          userAgent,

          payload: sanitizedBody,
        });
      }),

      catchError((err) => {
        const statusCode = err.status || 500;

        this.dispatchLogEvent({
          req: request,

          statusCode,

          method,

          route: originalUrl,

          ip,

          userAgent,

          payload: sanitizedBody,

          errorMsg: err.message,
        });

        return throwError(() => err);
      }),
    );
  }

  // ======================================================
  // DISPATCH EVENT
  // ======================================================

  private dispatchLogEvent({
    req,
    statusCode,
    method,
    route,
    ip,
    userAgent,
    payload,
    errorMsg,
  }: {
    req: any;

    statusCode: number;

    method: string;

    route: string;

    ip: string;

    userAgent: string;

    payload?: any;

    errorMsg?: string;
  }) {
    // 🔥 FIX CRÍTICO
    const userId = req.user?.userId || null;

    const event: AuditEvent = {
      userId,

      method,

      route,

      statusCode,

      ipAddress: ip,

      userAgent,

      payload,

      errorMsg,

      timestamp: new Date(),
    };

    this.eventEmitter.emit('system.audit.log', event);
  }

  // ======================================================
  // PAYLOAD SANITIZATION
  // ======================================================

  private sanitizePayload(body: any): any {
    if (!body) return null;

    const clone = {
      ...body,
    };

    const sensitiveKeys = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'jwt',
      'secret',
      'pin',
      'qrToken',
      'authorization',
      'cookie',
      'smtp',
    ];

    for (const key of Object.keys(clone)) {
      if (sensitiveKeys.includes(key)) {
        clone[key] = '[REDACTED]';
      }
    }

    return clone;
  }
}
