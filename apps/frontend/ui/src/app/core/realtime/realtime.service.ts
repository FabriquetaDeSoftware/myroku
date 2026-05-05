import { Injectable, signal } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

export type RealtimeStatus = 'connecting' | 'open' | 'closed' | 'reconnecting';

/**
 * Stub do Sprint 1. A implementação real (rxjs/webSocket + reconexão exponencial
 * + buffer de 500 mensagens) entra no Sprint 3 com o LogViewer.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  readonly status = signal<RealtimeStatus>('closed');
  readonly retryAttempt = signal(0);

  channel<T>(_path: string): Observable<T> {
    return EMPTY;
  }

  reconnect(): void {
    // no-op no Sprint 1
  }
}
