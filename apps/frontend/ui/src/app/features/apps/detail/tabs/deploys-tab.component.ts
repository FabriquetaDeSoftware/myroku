import { Component, computed, input, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { DEPLOYMENTS_FIXTURE } from '../../../../core/api/fixtures';
import { Deployment } from '../../../../core/api/types';
import { DeployRowComponent } from '../../../../shared/components/deploy-row/deploy-row.component';
import { DetailDrawerComponent } from '../../../../shared/components/detail-drawer/detail-drawer.component';
import { RelativeDatePipe } from '../../../../shared/pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-detail-deploys-tab',
  imports: [
    DeployRowComponent,
    DetailDrawerComponent,
    RelativeDatePipe,
    StatusBadgeComponent,
  ],
  template: `
    @if (deployments().length === 0) {
    <p class="rounded-xl border p-6 text-sm"
       style="border-color: var(--color-border); color: var(--color-fg-muted)">
      Nenhum deploy registrado para esta aplicação.
    </p>
    } @else {
    <div class="space-y-2">
      @for (d of deployments(); track d.id) {
      <app-deploy-row
        [deployment]="d"
        [canRollback]="d.status === 'failed' && hasSuccessAfter(d.id)"
        (open)="selected.set($event)"
        (rollback)="onRollback($event)"
      />
      }
    </div>
    }

    @let sel = selected();
    <app-detail-drawer
      [open]="!!sel"
      [title]="sel ? '#' + shortId(sel.id) : ''"
      [subtitle]="sel?.commitMessage ?? null"
      [pageHref]="sel ? ['/apps', appId(), 'deployments', sel.id] : null"
      pageLabel="Abrir deploy"
      (closed)="selected.set(null)"
    >
      @if (sel) {
      <div class="space-y-5">
        <div class="flex flex-wrap items-center gap-2">
          <app-status-badge [status]="sel.status" />
          <span
            class="rounded px-1.5 py-0.5 text-xs"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
          >
            {{ sel.trigger }}
          </span>
        </div>

        <dl class="space-y-3 text-sm">
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Commit</dt>
            <dd class="col-span-2 font-mono break-all">{{ sel.commitSha }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Mensagem</dt>
            <dd class="col-span-2">{{ sel.commitMessage }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Iniciado</dt>
            <dd class="col-span-2">{{ sel.startedAt | relativeDate }}</dd>
          </div>
          @if (sel.finishedAt) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Finalizado</dt>
            <dd class="col-span-2">{{ sel.finishedAt | relativeDate }}</dd>
          </div>
          }
          @if (sel.durationMs) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Duração</dt>
            <dd class="col-span-2">{{ durationLabel(sel.durationMs) }}</dd>
          </div>
          }
          @if (sel.errorMessage) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Erro</dt>
            <dd class="col-span-2" style="color: #b91c1c">
              {{ sel.errorMessage }}
            </dd>
          </div>
          }
        </dl>

        @if (sel.status === 'failed' && hasSuccessAfter(sel.id)) {
        <div
          class="border-t pt-4"
          style="border-color: var(--color-border)"
        >
          <button
            type="button"
            (click)="onRollback(sel.id)"
            class="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Rollback
          </button>
        </div>
        }
      </div>
      }
    </app-detail-drawer>
  `,
})
export class AppDetailDeploysTab {
  readonly appId = input.required<string>();
  readonly selected = signal<Deployment | null>(null);

  readonly deployments = computed(() => DEPLOYMENTS_FIXTURE[this.appId()] ?? []);

  shortId(id: string): string {
    return id.replace(/^dep_/, '');
  }

  durationLabel(ms: number): string {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  }

  hasSuccessAfter(id: string): boolean {
    const list = this.deployments();
    const idx = list.findIndex((d) => d.id === id);
    if (idx < 0) return false;
    return list.slice(idx + 1).some((d) => d.status === 'success');
  }

  onRollback(id: string): void {
    toast.success(`Rollback iniciado para o deploy #${this.shortId(id)}`);
  }
}
