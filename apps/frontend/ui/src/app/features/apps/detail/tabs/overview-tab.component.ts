import { Component, input } from '@angular/core';
import { Application } from '../../../../core/api/types';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-detail-overview-tab',
  imports: [RelativeDatePipe, StatusBadgeComponent],
  template: `
    <div class="grid gap-4 md:grid-cols-2">
      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          Status atual
        </h3>
        <div class="mt-2">
          <app-status-badge [status]="app().status" />
        </div>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt style="color: var(--color-fg-muted)">Tipo de build</dt>
            <dd class="font-mono">{{ app().buildType }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-fg-muted)">Auto-deploy</dt>
            <dd>{{ app().autoDeploy ? 'Ativo' : 'Desativado' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt style="color: var(--color-fg-muted)">Criada</dt>
            <dd>{{ app().createdAt | relativeDate }}</dd>
          </div>
        </dl>
      </article>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          Último deploy
        </h3>
        @if (app().lastDeploymentStatus) {
        <div class="mt-2">
          <app-status-badge [status]="app().lastDeploymentStatus!" />
        </div>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt style="color: var(--color-fg-muted)">Quando</dt>
            <dd>{{ app().lastDeploymentAt | relativeDate }}</dd>
          </div>
          @if (app().commitSha) {
          <div class="flex justify-between">
            <dt style="color: var(--color-fg-muted)">Commit</dt>
            <dd class="font-mono">{{ app().commitSha }}</dd>
          </div>
          }
          @if (app().commitMessage) {
          <div>
            <dt style="color: var(--color-fg-muted)">Mensagem</dt>
            <dd class="mt-1">{{ app().commitMessage }}</dd>
          </div>
          }
        </dl>
        } @else {
        <p class="mt-2 text-sm" style="color: var(--color-fg-muted)">
          Nenhum deploy realizado ainda.
        </p>
        }
      </article>
    </div>
  `,
})
export class AppDetailOverviewTab {
  readonly app = input.required<Application>();
}
