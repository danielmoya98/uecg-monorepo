import { Controller, Sse, Req, UseGuards, MessageEvent } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RealtimeService } from './realtime.service';
import { Observable, interval, merge } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('Realtime / SSE')
@ApiCookieAuth('uecg_access_token')
@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('events')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary:
      'Establece canal Server-Sent Events (SSE) para el usuario autenticado',
  })
  events(@Req() req: any): Observable<MessageEvent> {
    const userId = req.user.userId;
    const userStream$ = this.realtimeService.subscribe(userId);

    // Keep-alive heartbeat every 15 seconds to prevent gateway/proxy timeouts
    const heartbeat$ = interval(15000).pipe(
      map(
        () =>
          ({
            type: 'heartbeat',
            data: 'keep-alive',
          }) as MessageEvent,
      ),
    );

    return merge(userStream$, heartbeat$).pipe(
      finalize(() => {
        this.realtimeService.unsubscribe(userId);
      }),
    );
  }
}
