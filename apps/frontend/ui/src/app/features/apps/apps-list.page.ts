import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Package, Plus, Search } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { APPS_FIXTURE } from '../../core/api/fixtures';
import { Application, ContainerStatus } from '../../core/api/types';
import { AppRowComponent } from '../../shared/components/app-row/app-row.component';
import { DetailDrawerComponent } from '../../shared/components/detail-drawer/detail-drawer.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type StatusFilter = 'all' | ContainerStatus;

@Component({
  selector: 'app-apps-list-page',
  imports: [
    RouterLink,
    LucideAngularModule,
    AppRowComponent,
    DetailDrawerComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    StatusBadgeComponent,
  ],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Aplicações</h1>
          <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
            Repositórios conectados ao Myroku.
          </p>
        </div>
        <a
          routerLink="/apps/new"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus-ring"
          style="background: var(--color-primary-600)"
        >
          <lucide-icon [img]="Plus" class="size-4" />
          Nova aplicação
        </a>
      </header>

      <div class="flex flex-wrap items-center gap-3">
        <div
          class="flex flex-1 min-w-65 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <lucide-icon [img]="Search" class="size-4" style="color: var(--color-fg-muted)" />
          <input
            type="text"
            placeholder="Buscar por nome ou repositório..."
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            class="flex-1 bg-transparent outline-none"
          />
        </div>
        <select
          [value]="statusFilter()"
          (change)="statusFilter.set($any($event.target).value)"
          class="rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <option value="all">Todos os status</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      @if (filtered().length === 0) {
      <app-empty-state
        [icon]="Package"
        title="Nenhuma aplicação encontrada"
        description="Ajuste a busca ou conecte um novo repositório do GitHub."
        actionLabel="Nova aplicação"
        (action)="goNew()"
      />
      } @else {
      <div class="space-y-2">
        @for (app of filtered(); track app.id) {
        <app-app-row
          [app]="app"
          (open)="selected.set($event)"
          (deploy)="onDeploy($event)"
          (restart)="onRestart($event)"
        />
        }
      </div>
      }
    </section>

    @let sel = selected();
    <app-detail-drawer
      [open]="!!sel"
      [title]="sel?.name ?? ''"
      [subtitle]="sel?.repoFullName ?? null"
      [pageHref]="sel ? ['/apps', sel.id] : null"
      pageLabel="Abrir aplicação"
      (closed)="selected.set(null)"
    >
      @if (sel) {
      <div class="space-y-5">
        <div class="flex items-center gap-2">
          <app-status-badge [status]="sel.status" />
          <span
            class="rounded px-1.5 py-0.5 text-xs font-mono"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
          >
            {{ sel.buildType }}
          </span>
        </div>

        <dl class="space-y-3 text-sm">
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Repositório</dt>
            <dd class="col-span-2 font-mono">{{ sel.repoFullName }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Branch</dt>
            <dd class="col-span-2 font-mono">{{ sel.branch }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Auto-deploy</dt>
            <dd class="col-span-2">
              {{ sel.autoDeploy ? 'Sim' : 'Não' }}
            </dd>
          </div>
          @if (sel.commitSha) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Commit</dt>
            <dd class="col-span-2 font-mono">
              {{ sel.commitSha.slice(0, 7) }}
            </dd>
          </div>
          }
          @if (sel.commitMessage) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Mensagem</dt>
            <dd class="col-span-2 truncate">{{ sel.commitMessage }}</dd>
          </div>
          }
          @if (sel.lastDeploymentAt) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Último deploy</dt>
            <dd class="col-span-2">
              {{ sel.lastDeploymentAt | relativeDate }}
            </dd>
          </div>
          }
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Criada em</dt>
            <dd class="col-span-2">{{ sel.createdAt | relativeDate }}</dd>
          </div>
        </dl>

        <div
          class="flex items-center gap-2 border-t pt-4"
          style="border-color: var(--color-border)"
        >
          <button
            type="button"
            (click)="onDeploy(sel.id)"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Deploy
          </button>
          <button
            type="button"
            (click)="onRestart(sel.id)"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Reiniciar
          </button>
        </div>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class AppsListPage {
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Package = Package;

  private readonly router = inject(Router);

  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly selected = signal<Application | null>(null);

  goNew(): void {
    void this.router.navigateByUrl('/apps/new');
  }

  onDeploy(id: string): void {
    toast.success(`Deploy iniciado para ${id}`);
  }

  onRestart(id: string): void {
    toast(`Reiniciando ${id}`);
  }

  private readonly apps = signal(APPS_FIXTURE);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const sf = this.statusFilter();
    return this.apps().filter((app) => {
      if (sf !== 'all' && app.status !== sf) return false;
      if (!q) return true;
      return (
        app.name.toLowerCase().includes(q) ||
        app.repoFullName.toLowerCase().includes(q)
      );
    });
  });
}
