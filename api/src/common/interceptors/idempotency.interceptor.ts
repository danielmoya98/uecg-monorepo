import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  ConflictException,
  Logger,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';

import type { Cache } from 'cache-manager';

import { Observable, of } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const response = context.switchToHttp().getResponse();

    const idempotencyKey = request.headers['x-idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    const cacheKey = `idempotency:${idempotencyKey}`;

    // ======================================================
    // CACHE CHECK
    // ======================================================

    const cachedData = await this.cacheManager.get(cacheKey);

    if (cachedData === 'PROCESSING') {
      throw new ConflictException('Esta petición ya se está procesando.');
    }

    if (cachedData) {
      response.setHeader('x-idempotent-replayed', 'true');

      this.logger.warn(`♻️ Replay idempotente: ${idempotencyKey}`);

      return of(cachedData);
    }

    // ======================================================
    // LOCK REQUEST
    // ======================================================

    // 🔥 FIX TTL
    await this.cacheManager.set(cacheKey, 'PROCESSING', 30);

    return next.handle().pipe(
      tap(async (data) => {
        // 🔥 FIX TTL
        await this.cacheManager.set(cacheKey, data, 60 * 10);

        this.logger.log(`✅ Idempotencia almacenada`);
      }),

      catchError((error) => {
        return of(this.cacheManager.del(cacheKey)).pipe(
          tap(() => {
            this.logger.warn(`🧹 Lock idempotente liberado`);
          }),

          tap(() => {
            throw error;
          }),
        );
      }),
    );
  }
}
