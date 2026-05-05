import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, RefreshCw, WifiOff } from 'lucide-angular';
import { RealtimeService } from '../../core/realtime/realtime.service';

@Component({
  selector: 'app-realtime-banner',
  imports: [LucideAngularModule],
  template: `
    @if (show()) {
    <div
      class="border-b px-4 py-2 text-sm"
      style="
        border-color: #fecaca;
        background: #fef2f2;
        color: #991b1b;
      "
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3">
        <lucide-icon [img]="WifiOff" class="size-4" />
        <span class="flex-1">
          @if (status() === 'reconnecting') {
          Reconectando ao servidor de eventos (tentativa {{ rt.retryAttempt() }})…
          } @else {
          Sem conexão com o servidor de eventos. Logs e status em tempo real
          podem estar desatualizados.
          }
        </span>
        <button
          type="button"
          (click)="rt.reconnect()"
          class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium hover:opacity-80 focus-ring"
          style="border-color: #fca5a5"
        >
          <lucide-icon [img]="RefreshCw" class="size-3.5" />
          Reconectar
        </button>
      </div>
    </div>
    }
  `,
})
export class RealtimeBannerComponent {
  readonly rt = inject(RealtimeService);

  readonly status = computed(() => this.rt.status());
  readonly show = computed(
    () => this.status() === 'closed' || this.status() === 'reconnecting',
  );

  readonly WifiOff = WifiOff;
  readonly RefreshCw = RefreshCw;
}
