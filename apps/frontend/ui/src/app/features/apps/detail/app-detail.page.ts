import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import {
  ArrowLeft,
  LucideAngularModule,
  Play,
  RotateCw,
  Square,
  Trash2,
} from 'lucide-angular';
import { APPS_FIXTURE, ENV_VARS_FIXTURE } from '../../../core/api/fixtures';
import { EnvVar } from '../../../core/api/types';
import { AppDetailDeploysTab } from './tabs/deploys-tab.component';
import { AppDetailEnvTab } from './tabs/env-tab.component';
import { AppDetailLogsTab } from './tabs/logs-tab.component';
import { AppDetailOverviewTab } from './tabs/overview-tab.component';
import { AppDetailSettingsTab } from './tabs/settings-tab.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

type Tab = 'overview' | 'deploys' | 'logs' | 'env' | 'settings';

@Component({
  selector: 'app-app-detail-page',
  imports: [
    RouterLink,
    LucideAngularModule,
    StatusBadgeComponent,
    ConfirmDialogComponent,
    AppDetailOverviewTab,
    AppDetailDeploysTab,
    AppDetailLogsTab,
    AppDetailEnvTab,
    AppDetailSettingsTab,
  ],
  template: `
    @if (app()) {
    <section class="space-y-6">
      <!-- Header -->
      <header class="space-y-3">
        <a
          routerLink="/apps"
          class="inline-flex items-center gap-1 text-sm hover:underline"
          style="color: var(--color-fg-muted)"
        >
          <lucide-icon [img]="ArrowLeft" class="size-4" />
          Aplicações
        </a>

        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold">{{ app()!.name }}</h1>
          <app-status-badge [status]="app()!.status" />
        </div>

        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
          style="color: var(--color-fg-muted)"
        >
          <span class="font-mono">{{ app()!.repoFullName }}</span>
          <span>•</span>
          <span>{{ app()!.branch }}</span>
          @if (app()!.commitSha) {
          <span>•</span>
          <span class="font-mono">{{ app()!.commitSha }}</span>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="onDeploy()"
            class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring"
            style="background: var(--color-primary-600)"
          >
            <lucide-icon [img]="Play" class="size-4" />
            Deploy now
          </button>
          <button
            type="button"
            (click)="onRestart()"
            class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            <lucide-icon [img]="RotateCw" class="size-4" />
            Restart
          </button>
          <button
            type="button"
            (click)="onStop()"
            class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            <lucide-icon [img]="Square" class="size-4" />
            Stop
          </button>
          <button
            type="button"
            (click)="deleteOpen.set(true)"
            class="ml-auto inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border); color: #b91c1c"
          >
            <lucide-icon [img]="Trash2" class="size-4" />
            Excluir
          </button>
        </div>
      </header>

      <!-- Tabs -->
      <nav
        class="flex gap-1 border-b"
        style="border-color: var(--color-border)"
      >
        @for (t of tabs; track t.id) {
        <button
          type="button"
          (click)="activeTab.set(t.id)"
          class="border-b-2 px-4 py-2 text-sm font-medium transition-colors"
          [style.border-color]="
            activeTab() === t.id ? 'var(--color-primary-500)' : 'transparent'
          "
          [style.color]="
            activeTab() === t.id ? 'var(--color-fg)' : 'var(--color-fg-muted)'
          "
        >
          {{ t.label }}
        </button>
        }
      </nav>

      <!-- Tab content -->
      @switch (activeTab()) { @case ('overview') {
      <app-detail-overview-tab [app]="app()!" />
      } @case ('deploys') {
      <app-detail-deploys-tab [appId]="app()!.id" />
      } @case ('logs') {
      <app-detail-logs-tab [appId]="app()!.id" />
      } @case ('env') {
      <app-detail-env-tab
        [appId]="app()!.id"
        [envVars]="envVars()"
        (changed)="onEnvVarsChanged($event)"
      />
      } @case ('settings') {
      <app-detail-settings-tab [app]="app()!" />
      } }
    </section>

    <app-confirm-dialog
      [open]="deleteOpen()"
      title="Excluir aplicação"
      [description]="
        'Esta ação não pode ser desfeita. ' + app()!.name + ' será removida do Myroku, ' +
        'incluindo containers, builds e webhooks.'
      "
      confirmLabel="Excluir definitivamente"
      tone="danger"
      [confirmText]="app()!.name"
      (confirm)="onDeleteConfirmed()"
      (cancel)="deleteOpen.set(false)"
    />
    } @else {
    <div class="rounded-2xl border p-6 text-sm" style="border-color: var(--color-border)">
      Aplicação não encontrada.
      <a routerLink="/apps" class="ml-2 underline" style="color: var(--color-primary-600)">
        Voltar para lista
      </a>
    </div>
    }
  `,
})
export class AppDetailPage {
  readonly id = input.required<string>();

  private readonly router = inject(Router);

  readonly ArrowLeft = ArrowLeft;
  readonly Play = Play;
  readonly RotateCw = RotateCw;
  readonly Square = Square;
  readonly Trash2 = Trash2;

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'deploys', label: 'Deploys' },
    { id: 'logs', label: 'Logs' },
    { id: 'env', label: 'Env Vars' },
    { id: 'settings', label: 'Settings' },
  ];

  readonly activeTab = signal<Tab>('overview');
  readonly deleteOpen = signal(false);

  readonly app = computed(() => APPS_FIXTURE.find((a) => a.id === this.id()));
  readonly envVars = signal<EnvVar[]>([]);

  constructor() {
    // Sincroniza fixture quando o id muda
    queueMicrotask(() => {
      const id = this.id();
      this.envVars.set(ENV_VARS_FIXTURE[id] ?? []);
    });
  }

  onDeploy(): void {
    toast.success(`Deploy enfileirado para ${this.app()?.name}`);
  }

  onRestart(): void {
    toast(`Container reiniciando: ${this.app()?.name}`);
  }

  onStop(): void {
    toast(`Container parado: ${this.app()?.name}`);
  }

  onEnvVarsChanged(vars: EnvVar[]): void {
    this.envVars.set(vars);
  }

  onDeleteConfirmed(): void {
    toast.success(`${this.app()?.name} excluída.`);
    this.deleteOpen.set(false);
    void this.router.navigateByUrl('/apps');
  }
}
