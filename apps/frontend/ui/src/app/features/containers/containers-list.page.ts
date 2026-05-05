import { Component, computed, signal } from '@angular/core';
import { Box, LucideAngularModule, Search } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { CONTAINERS_FIXTURE } from '../../core/api/fixtures';
import { Container, ContainerStatus } from '../../core/api/types';
import {
  ContainerAction,
  ContainerRowComponent,
} from '../../shared/components/container-row/container-row.component';
import { DetailDrawerComponent } from '../../shared/components/detail-drawer/detail-drawer.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type StatusFilter = 'all' | ContainerStatus;

@Component({
  selector: 'app-containers-list-page',
  imports: [
    LucideAngularModule,
    ContainerRowComponent,
    DetailDrawerComponent,
    EmptyStateComponent,
    RelativeDatePipe,
    StatusBadgeComponent,
  ],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold">Containers</h1>
        <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
          Todos os containers gerenciados pelo Myroku — total
          {{ containers().length }}.
        </p>
      </header>

      <div class="flex flex-wrap items-center gap-3">
        <div
          class="flex flex-1 min-w-65 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <lucide-icon [img]="Search" class="size-4" style="color: var(--color-fg-muted)" />
          <input
            type="text"
            placeholder="Buscar por nome ou imagem..."
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
        [icon]="Box"
        title="Nenhum container encontrado"
        description="Ajuste o filtro ou inicie uma aplicação."
      />
      } @else {
      <div class="space-y-2">
        @for (c of filtered(); track c.id) {
        <app-container-row
          [container]="c"
          (open)="selected.set($event)"
          (action)="onAction(c, $event)"
        />
        }
      </div>
      }
    </section>

    @let sel = selected();
    <app-detail-drawer
      [open]="!!sel"
      [title]="sel?.name ?? ''"
      [subtitle]="sel?.image ?? null"
      (closed)="selected.set(null)"
    >
      @if (sel) {
      <div class="space-y-5">
        <div class="flex items-center gap-2">
          <app-status-badge [status]="sel.status" />
        </div>

        <dl class="space-y-3 text-sm">
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">ID</dt>
            <dd class="col-span-2 font-mono break-all">{{ sel.id }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Imagem</dt>
            <dd class="col-span-2 font-mono break-all">{{ sel.image }}</dd>
          </div>
          @if (sel.appId) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Aplicação</dt>
            <dd class="col-span-2 font-mono">{{ sel.appId }}</dd>
          </div>
          }
          @if (sel.startedAt) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Iniciado</dt>
            <dd class="col-span-2">{{ sel.startedAt | relativeDate }}</dd>
          </div>
          }
        </dl>

        <div
          class="grid grid-cols-2 gap-2 border-t pt-4"
          style="border-color: var(--color-border)"
        >
          <button
            type="button"
            (click)="onAction(sel, 'start')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Iniciar
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'stop')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Parar
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'restart')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Reiniciar
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'logs')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Ver logs
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'inspect')"
            class="col-span-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Inspecionar
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'kill')"
            class="col-span-2 rounded-xl px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-ring"
            style="background: #dc2626"
          >
            Kill
          </button>
        </div>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class ContainersListPage {
  readonly Search = Search;
  readonly Box = Box;

  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly selected = signal<Container | null>(null);

  readonly containers = signal<Container[]>(CONTAINERS_FIXTURE);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const sf = this.statusFilter();
    return this.containers().filter((c) => {
      if (sf !== 'all' && c.status !== sf) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) || c.image.toLowerCase().includes(q)
      );
    });
  });

  onAction(container: Container, action: ContainerAction): void {
    const labels: Record<ContainerAction, string> = {
      start: 'iniciado',
      stop: 'parado',
      restart: 'reiniciado',
      kill: 'killed',
      logs: 'logs (em breve)',
      inspect: 'inspecionado (em breve)',
    };
    toast(`${container.name}: ${labels[action]}`);
  }
}
