import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Box, LucideAngularModule, RefreshCw, Search } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { ContainersService } from '../../core/api/containers.service';
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
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Containers</h1>
          <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
            Todos os containers do Docker daemon — total
            {{ containers().length }}.
          </p>
        </div>
        <button
          type="button"
          (click)="refresh()"
          [disabled]="loading()"
          class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring disabled:opacity-50"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <lucide-icon [img]="RefreshCw" class="size-4" [class.animate-spin]="loading()" />
          Atualizar
        </button>
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
        [title]="loading() ? 'Carregando containers...' : 'Nenhum container encontrado'"
        [description]="
          loading()
            ? 'Buscando informações no Docker daemon.'
            : 'Ajuste o filtro ou suba um container.'
        "
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
          @if (sel.ports) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Portas</dt>
            <dd class="col-span-2 font-mono break-all">{{ sel.ports }}</dd>
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
export class ContainersListPage implements OnInit {
  readonly Search = Search;
  readonly Box = Box;
  readonly RefreshCw = RefreshCw;

  private readonly service = inject(ContainersService);

  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly selected = signal<Container | null>(null);

  readonly containers = signal<Container[]>([]);
  readonly loading = signal(false);

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

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (list) => {
        this.containers.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        toast.error('Falha ao carregar containers', {
          description: err?.message ?? 'Verifique se o backend está rodando.',
        });
      },
    });
  }

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
