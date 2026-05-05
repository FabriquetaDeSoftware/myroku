import { Component, input } from '@angular/core';
import { LogViewerComponent } from '../../../../shared/components/log-viewer/log-viewer.component';

@Component({
  selector: 'app-detail-logs-tab',
  imports: [LogViewerComponent],
  template: `
    <app-log-viewer
      [autoStream]="true"
      [seed]="[
        '> Container started.',
        'Server listening on :8080',
        'Connected to database postgres.local',
        'Health check endpoint registered at /health'
      ]"
    />
    <p class="mt-2 text-xs" style="color: var(--color-fg-muted)">
      Stream em tempo real para a aplicação
      <span class="font-mono">{{ appId() }}</span>. Quando o backend Go expor
      <span class="font-mono">/ws/apps/:id/logs</span>, este viewer será conectado
      ao canal real via <code>core/realtime</code>.
    </p>
  `,
})
export class AppDetailLogsTab {
  readonly appId = input.required<string>();
}
