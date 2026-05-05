import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Activity,
  Box,
  CircleX,
  Clock,
  LucideAngularModule,
  Package,
  PlayCircle,
  Rocket,
} from 'lucide-angular';
import { APPS_FIXTURE } from '../../core/api/fixtures';
import { Application } from '../../core/api/types';
import { AppRowComponent } from '../../shared/components/app-row/app-row.component';
import { DashboardChartsComponent } from '../../shared/components/dashboard-charts/dashboard-charts.component';
import { DetailDrawerComponent } from '../../shared/components/detail-drawer/detail-drawer.component';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    LucideAngularModule,
    StatCardComponent,
    AppRowComponent,
    DashboardChartsComponent,
    DetailDrawerComponent,
    RelativeDatePipe,
    StatusBadgeComponent,
  ],
  template: `
    <section class="space-y-6">
      <!-- Hero -->
      <header
        class="rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-700 p-8 text-white"
      >
        <p class="text-xs font-medium uppercase tracking-wider opacity-80">
          Dashboard
        </p>
        <h1 class="mt-1 text-4xl font-semibold">Visão geral</h1>
        <p class="mt-1 text-sm opacity-90">{{ today }}</p>
      </header>

      <!-- StatCards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <app-stat-card
          label="Total apps"
          [value]="stats().total"
          [icon]="Package"
        />
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
          label="Deploys hoje"
          [value]="stats().deploysToday"
          [icon]="Rocket"
        />
        <app-stat-card
          label="Falhos"
          [value]="stats().failed"
          [icon]="CircleX"
          tone="negative"
        />
      </div>

      <!-- Charts -->
      <app-dashboard-charts [apps]="apps()" />

      <!-- Apps recentes -->
      <section>
        <header class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Aplicações recentes</h2>
          <a
            routerLink="/apps"
            class="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            style="color: var(--color-primary-600)"
          >
            Ver todas
            <lucide-icon [img]="Activity" class="size-4" />
          </a>
        </header>
        <div class="space-y-2">
          @for (app of apps(); track app.id) {
          <app-app-row [app]="app" (open)="selected.set($event)" />
          }
        </div>
      </section>
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
          @if (sel.lastDeploymentAt) {
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Último deploy</dt>
            <dd class="col-span-2">{{ sel.lastDeploymentAt | relativeDate }}</dd>
          </div>
          }
        </dl>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class DashboardPage {
  readonly today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  readonly Package = Package;
  readonly PlayCircle = PlayCircle;
  readonly Box = Box;
  readonly Clock = Clock;
  readonly Rocket = Rocket;
  readonly CircleX = CircleX;
  readonly Activity = Activity;

  readonly apps = signal(APPS_FIXTURE.slice(0, 4));
  readonly selected = signal<Application | null>(null);

  readonly stats = computed(() => {
    const all = this.apps();
    const running = all.filter((a) => a.status === 'running').length;
    const stopped = all.filter((a) => a.status === 'stopped').length;
    const pending = all.filter((a) => a.status === 'pending').length;
    const failed = all.filter((a) => a.status === 'failed').length;
    return {
      total: all.length,
      running,
      stopped,
      pending,
      failed,
      deploysToday: 7, // placeholder
    };
  });
}
