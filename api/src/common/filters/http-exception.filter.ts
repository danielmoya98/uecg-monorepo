import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      this.logger.error(
        'Excepción capturada fuera del contexto HTTP:',
        exception,
      );
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let codeStr = 'INTERNAL_SERVER_ERROR';
    let details: any = null;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message || exception.message;
      codeStr = exception.errorCode;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message =
        typeof res === 'object' && res !== null
          ? res.message || res.error || exception.message
          : res;
      codeStr =
        typeof res === 'object' && res !== null && res.error
          ? res.error.toUpperCase().replace(/\s+/g, '_')
          : HttpStatus[status] || 'HTTP_ERROR';
    }
    // 🔥 Duck-typing seguro para errores de Prisma (Evita problemas de imports y tipos unknown)
    else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      typeof (exception as any).code === 'string'
    ) {
      const prismaErr = exception as any;
      switch (prismaErr.code) {
        case 'P2002': // Unique constraint failed
          status = HttpStatus.CONFLICT;
          message = 'Ya existe un registro con esos datos (Duplicado).';
          codeStr = 'CONFLICT';
          break;
        case 'P2003': // Foreign key constraint
          status = HttpStatus.CONFLICT;
          message =
            'No se puede eliminar o modificar porque está en uso por otras partes del sistema.';
          codeStr = 'FOREIGN_KEY_VIOLATION';
          break;
        case 'P2025': // Record not found
          status = HttpStatus.NOT_FOUND;
          message = 'El registro solicitado no existe en la base de datos.';
          codeStr = 'NOT_FOUND';
          break;
        default:
          message = `Error de base de datos (${prismaErr.code})`;
          codeStr = `DATABASE_ERROR_${prismaErr.code}`;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const requestId = request.headers['x-request-id'] || null;

    // Solo logueamos como "Error" los 500 reales. Los 400, 404 y 409 son errores del cliente (Warn)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status} - RequestId: ${requestId}`,
        exception instanceof Error ? exception.stack : '',
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status: ${status} - Code: ${codeStr} - Message: ${Array.isArray(message) ? message[0] : message} - RequestId: ${requestId}`,
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: codeStr,
        message: Array.isArray(message) ? message[0] : message,
        ...(details ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(requestId ? { requestId } : {}),
      },
    });
  }
}
