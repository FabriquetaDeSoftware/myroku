import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingIndicatorService {
  private readonly inflight = signal(0);
  readonly active = computed(() => this.inflight() > 0);

  start(): void {
    this.inflight.update((n) => n + 1);
  }

  stop(): void {
    this.inflight.update((n) => Math.max(0, n - 1));
  }
}
