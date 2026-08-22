import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const requestId = request.headers['x-request-id'] || undefined;

    return next.handle().pipe(
      map((res) => {
        const timestamp = new Date().toISOString();

        // Si la respuesta ya viene estructurada con data y meta (caso paginado)
        if (res?.data && res?.meta) {
          return {
            success: true,
            message: res.message || 'Operación exitosa',
            data: res.data,
            meta: {
              timestamp,
              ...(requestId ? { requestId } : {}),
              ...res.meta,
            },
          };
        }

        // Formato estándar
        return {
          success: true,
          message: res?.message || 'Operación exitosa',
          data: res?.data !== undefined ? res.data : res,
          meta: {
            timestamp,
            ...(requestId ? { requestId } : {}),
          },
        };
      }),
    );
  }
}
