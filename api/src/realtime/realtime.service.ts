import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  // Maps userId -> { subject: Subject, count: connectionCount }
  private readonly userStreams = new Map<
    string,
    { subject: Subject<MessageEvent>; count: number }
  >();

  /**
   * Subscribes a user to their real-time stream.
   * Increments the connection count for reference tracking.
   */
  subscribe(userId: string): Observable<MessageEvent> {
    this.logger.log(`👤 User ${userId} connecting to SSE stream`);

    let stream = this.userStreams.get(userId);
    if (!stream) {
      stream = {
        subject: new Subject<MessageEvent>(),
        count: 0,
      };
      this.userStreams.set(userId, stream);
    }

    stream.count++;
    return stream.subject.asObservable();
  }

  /**
   * Unsubscribes a user from their real-time stream.
   * Decrements connection count and cleans up when no connections remain.
   */
  unsubscribe(userId: string): void {
    this.logger.log(`👤 User ${userId} disconnecting from SSE stream`);

    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.count--;
      if (stream.count <= 0) {
        stream.subject.complete();
        this.userStreams.delete(userId);
        this.logger.log(
          `🧹 Stream resources for user ${userId} garbage collected`,
        );
      }
    }
  }

  /**
   * Sends a targeted message to a specific user.
   */
  sendToUser(userId: string, event: MessageEvent): void {
    const stream = this.userStreams.get(userId);
    if (stream) {
      this.logger.log(`📡 SSE Push -> User ${userId} Event: ${event.type}`);
      stream.subject.next(event);
    } else {
      this.logger.debug(
        `⚠️ No active SSE connection for user ${userId}, event discarded`,
      );
    }
  }

  /**
   * Broadcasts a message to all connected users.
   */
  broadcast(event: MessageEvent): void {
    this.logger.log(`📡 SSE Broadcast Event: ${event.type}`);
    for (const [, stream] of this.userStreams.entries()) {
      stream.subject.next(event);
    }
  }

  // ==========================================
  // EVENT LISTENERS (EventEmitter2 Integration)
  // ==========================================

  @OnEvent('reports.massive.completed')
  handleReportsCompleted(payload: { userId: string; fileName: string }): void {
    this.sendToUser(payload.userId, {
      type: 'export-reports-ready',
      data: {
        message: '¡El paquete de Libretas (Ley 070) está listo!',
        fileName: payload.fileName,
      },
    });
  }

  @OnEvent('identity.massive.completed')
  handleIdentityCompleted(payload: {
    userId: string;
    academicYearId: string;
    fileName: string;
  }): void {
    this.sendToUser(payload.userId, {
      type: 'carnets-ready',
      data: {
        message: '¡Tu lote de carnets está listo para impresión!',
        fileName: payload.fileName,
      },
    });
  }

  @OnEvent('timetables.massive.completed')
  handleTimetablesCompleted(payload: {
    userId: string;
    academicYearId: string;
    fileName: string;
  }): void {
    this.sendToUser(payload.userId, {
      type: 'export-ready',
      data: {
        message: '¡Tus horarios masivos están listos!',
        fileName: payload.fileName,
      },
    });
  }

  @OnEvent('institution.*')
  handleInstitutionChanged(payload: any): void {
    this.logger.log('📡 SSE Broadcast: institution-updated event emitted');
    this.broadcast({
      type: 'institution-updated',
      data: {
        message: 'La configuración institucional ha sido actualizada.',
        timestamp: new Date().toISOString(),
        payload,
      },
    });
  }
}
