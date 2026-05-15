import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Activity,
  Box,
  CircleX,
  Clock,
  HardDrive,
  Layers,
  LucideAngularModule,
  PlayCircle,
} from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { ContainersService } from '../../core/api/containers.service';
import { ImagesService } from '../../core/api/images.service';
import { SystemService } from '../../core/api/system.service';
import { Container, DockerImage, SystemDF } from '../../core/api/types';
import { ContainerRowComponent } from '../../shared/components/container-row/container-row.component';
import { DashboardChartsComponent } from '../../shared/components/dashboard-charts/dashboard-charts.component';
import { DetailDrawerComponent } from '../../shared/components/detail-drawer/detail-drawer.component';
import { BytesPipe } from '../../shared/pipes/bytes.pipe';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    LucideAngularModule,
    StatCardComponent,
    ContainerRowComponent,
    DashboardChartsComponent,
    DetailDrawerComponent,
    RelativeDatePipe,
    StatusBadgeComponent,
  ],
  template: `
    <section class="space-y-6">
      <header
        class="rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-700 p-8 text-white"
      >
        <p class="text-xs font-medium uppercase tracking-wider opacity-80">
          Dashboard
        </p>
        <h1 class="mt-1 text-4xl font-semibold">Visão geral</h1>
        <p class="mt-1 text-sm opacity-90">{{ today }}</p>
      </header>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <app-stat-card
          label="Running"
          [value]="stats().running"
          [icon]="PlayCircle"
          tone="positive"
        />
        <app-stat-card
          label="Stopped"
          [value]="stats().stopped"
          [icon]="Box"
        />
        <app-stat-card
          label="Pending"
          [value]="stats().pending"
          [icon]="Clock"
        />
        <app-stat-card
          label="Failed"
          [value]="stats().failed"
          [icon]="CircleX"
          tone="negative"
        />
        <app-stat-card
          label="Imagens"
          [value]="stats().imagesTotal"
          [icon]="Layers"
        />
        <app-stat-card
          label="Disco usado"
          [value]="diskUsedLabel()"
          [icon]="HardDrive"
        />
      </div>

      <app-dashboard-charts [containers]="containers()" />

      <section>
        <header class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Containers recentes</h2>
          <a
            routerLink="/containers"
            class="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style="color: var(--color-primary-600)"
          >
            Ver todos
            <lucide-icon [img]="Activity" class="size-4" />
          </a>
        </header>
        <div class="space-y-2">
          @for (c of recent(); track c.id) {
          <app-container-row [container]="c" (open)="selected.set($event)" />
          } @empty {
          <p class="text-sm" style="color: var(--color-fg-muted)">
            @if (loading()) {
              Carregando...
            } @else {
              Nenhum container encontrado.
            }
          </p>
          }
        </div>
      </section>
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
          @if (sel.startedAt) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Iniciado</dt>
            <dd class="col-span-2">{{ sel.startedAt | relativeDate }}</dd>
          </div>
          }
        </dl>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class DashboardPage implements OnInit {
  readonly today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  readonly PlayCircle = PlayCircle;
  readonly Box = Box;
  readonly Clock = Clock;
  readonly CircleX = CircleX;
  readonly Layers = Layers;
  readonly HardDrive = HardDrive;
  readonly Activity = Activity;

  private readonly containersSvc = inject(ContainersService);
  private readonly imagesSvc = inject(ImagesService);
  private readonly systemSvc = inject(SystemService);

  readonly containers = signal<Container[]>([]);
  readonly images = signal<DockerImage[]>([]);
  readonly df = signal<SystemDF | null>(null);
  readonly loading = signal(false);
  readonly selected = signal<Container | null>(null);

  readonly stats = computed(() => {
    const all = this.containers();
    return {
      running: all.filter((c) => c.status === 'running').length,
      stopped: all.filter((c) => c.status === 'stopped').length,
      pending: all.filter((c) => c.status === 'pending').length,
      failed: all.filter((c) => c.status === 'failed').length,
      imagesTotal: this.images().length,
    };
  });

  readonly diskUsedBytes = computed(() => {
    const d = this.df();
    if (!d) return 0;
    return (
      d.imagesSizeBytes +
      d.containersSizeBytes +
      d.volumesSizeBytes +
      d.buildCacheSizeBytes
    );
  });

  private readonly bytesPipe = new BytesPipe();
  readonly diskUsedLabel = computed(() => this.bytesPipe.transform(this.diskUsedBytes()));

  readonly recent = computed(() => {
    return [...this.containers()]
      .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''))
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading.set(true);
    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending === 0) this.loading.set(false);
    };

    this.containersSvc.list().subscribe({
      next: (list) => {
        this.containers.set(list);
        done();
      },
      error: (err) => {
        toast.error('Falha ao carregar containers', {
          description: err?.message ?? 'Verifique se o backend está rodando.',
        });
        done();
      },
    });

    this.imagesSvc.list().subscribe({
      next: (list) => {
        this.images.set(list);
        done();
      },
      error: () => done(),
    });

    this.systemSvc.df().subscribe({
      next: (df) => {
        this.df.set(df);
        done();
      },
      error: () => done(),
    });
  }
}
