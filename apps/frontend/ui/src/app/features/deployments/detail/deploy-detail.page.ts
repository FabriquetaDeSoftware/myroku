import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Check,
  CircleX,
  Hammer,
  Loader2,
  LucideAngularModule,
  Rocket,
} from 'lucide-angular';
import { DEPLOYMENTS_FIXTURE } from '../../../core/api/fixtures';
import { Deployment, DeploymentStatus } from '../../../core/api/types';
import { LogViewerComponent } from '../../../shared/components/log-viewer/log-viewer.component';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface Step {
  label: string;
  status: 'pending' | 'running' | 'success' | 'failed';
}

@Component({
  selector: 'app-deploy-detail-page',
  imports: [
    RouterLink,
    LucideAngularModule,
    RelativeDatePipe,
    StatusBadgeComponent,
    LogViewerComponent,
  ],
  template: `
    @if (deployment()) {
    <section class="space-y-6">
      <header class="space-y-2">
        <a
          [routerLink]="['/apps', deployment()!.appId]"
          class="inline-flex items-center gap-1 text-sm hover:underline"
          style="color: var(--color-fg-muted)"
        >
          <lucide-icon [img]="ArrowLeft" class="size-4" />
          Voltar para aplicação
        </a>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-2xl font-semibold">Deploy #{{ shortId() }}</h1>
          <app-status-badge [status]="deployment()!.status" />
          <span
            class="rounded px-1.5 py-0.5 text-xs"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
          >
            {{ deployment()!.trigger }}
          </span>
        </div>
        <p class="text-sm" style="color: var(--color-fg-muted)">
          <span class="font-mono">{{ deployment()!.commitSha }}</span>
          ·
          {{ deployment()!.commitMessage }}
          ·
          iniciado {{ deployment()!.startedAt | relativeDate }}
        </p>
      </header>

      <!-- Timeline -->
      <ol
        class="grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-4"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        @for (step of steps(); track step.label) {
        <li class="flex items-center gap-3">
          <span
            class="grid size-8 place-items-center rounded-full"
            [style.background]="iconBg(step.status)"
            [style.color]="iconColor(step.status)"
          >
            <lucide-icon
              [img]="iconFor(step.status)"
              class="size-4"
              [class.animate-spin]="step.status === 'running'"
            />
          </span>
          <span
            class="text-sm font-medium"
            [style.color]="
              step.status === 'pending'
                ? 'var(--color-fg-muted)'
                : 'var(--color-fg)'
            "
          >
            {{ step.label }}
          </span>
        </li>
        }
      </ol>

      <!-- Logs -->
      <section>
        <h2 class="mb-2 text-sm font-semibold">Log do build</h2>
        <app-log-viewer [seed]="seed()" [autoStream]="false" />
      </section>

      @if (deployment()!.errorMessage) {
      <article
        class="rounded-xl border p-4 text-sm"
        style="border-color: #fecaca; background: #fef2f2; color: #991b1b"
      >
        <strong>Erro:</strong>
        {{ deployment()!.errorMessage }}
      </article>
      }
    </section>
    } @else {
    <div
      class="rounded-2xl border p-6 text-sm"
      style="border-color: var(--color-border)"
    >
      Deploy não encontrado.
    </div>
    }
  `,
})
export class DeployDetailPage {
  readonly id = input.required<string>();
  readonly depId = input.required<string>();

  readonly ArrowLeft = ArrowLeft;

  readonly deployment = computed<Deployment | undefined>(() => {
    const list = DEPLOYMENTS_FIXTURE[this.id()] ?? [];
    return list.find((d) => d.id === this.depId());
  });

  readonly shortId = computed(() =>
    this.depId().replace(/^dep_/, ''),
  );

  readonly steps = computed<Step[]>(() => {
    const status = this.deployment()?.status;
    return this.computeSteps(status);
  });

  readonly seed = computed<string[]>(() => {
    const d = this.deployment();
    if (!d) return [];
    const lines: string[] = [
      `> Cloning repository at commit ${d.commitSha}...`,
      `Cloning into '/var/lib/myroku/apps/${d.appId}/build-${d.id}'...`,
      `> Building image with Docker...`,
      `Step 1/8: FROM node:20-alpine AS builder`,
      `Step 2/8: WORKDIR /app`,
      `Step 3/8: COPY package*.json ./`,
      `Step 4/8: RUN npm ci`,
      `Step 5/8: COPY . .`,
      `Step 6/8: RUN npm run build`,
      `Step 7/8: FROM node:20-alpine`,
      `Step 8/8: COPY --from=builder /app/dist /app`,
    ];
    if (d.status === 'success') {
      lines.push(
        `Successfully built image ${d.commitSha}`,
        `> Starting new container...`,
        `Container started: app-${d.id}`,
        `> Health check passed.`,
        `> Switching traffic and stopping old container.`,
        `> Deploy concluído em ${d.durationMs ? d.durationMs / 1000 + 's' : ''}.`,
      );
    } else if (d.status === 'failed') {
      lines.push(
        `npm ERR! code ELIFECYCLE`,
        `npm ERR! errno 1`,
        `> Build failed: ${d.errorMessage ?? 'erro desconhecido'}`,
      );
    }
    return lines;
  });

  private computeSteps(status: DeploymentStatus | undefined): Step[] {
    const labels = ['Queued', 'Building', 'Deploying', 'Done'];
    if (!status) {
      return labels.map((l) => ({ label: l, status: 'pending' as const }));
    }
    const stages: DeploymentStatus[][] = [
      ['queued'],
      ['building'],
      ['deploying'],
      ['success', 'failed', 'rolled_back'],
    ];
    let reachedFailure = false;
    return labels.map((label, idx) => {
      const reachedHere = this.statusOrder(status) >= idx;
      const isCurrent = stages[idx].includes(status);
      if (reachedFailure) return { label, status: 'pending' };
      if (isCurrent && status === 'failed') {
        reachedFailure = true;
        return { label, status: 'failed' };
      }
      if (isCurrent && (status === 'building' || status === 'deploying' || status === 'queued')) {
        return { label, status: 'running' };
      }
      if (reachedHere) return { label, status: 'success' };
      return { label, status: 'pending' };
    });
  }

  private statusOrder(s: DeploymentStatus): number {
    switch (s) {
      case 'queued':
        return 0;
      case 'building':
        return 1;
      case 'deploying':
        return 2;
      default:
        return 3;
    }
  }

  iconFor(s: Step['status']) {
    switch (s) {
      case 'success':
        return Check;
      case 'failed':
        return CircleX;
      case 'running':
        return Loader2;
      default:
        return Rocket;
    }
  }
  iconBg(s: Step['status']): string {
    switch (s) {
      case 'success':
        return '#ecfdf5';
      case 'failed':
        return '#fef2f2';
      case 'running':
        return '#eff6ff';
      default:
        return 'var(--color-surface-muted)';
    }
  }
  iconColor(s: Step['status']): string {
    switch (s) {
      case 'success':
        return '#047857';
      case 'failed':
        return '#b91c1c';
      case 'running':
        return '#1d4ed8';
      default:
        return 'var(--color-fg-muted)';
    }
  }
  // Placeholder evita unused import warning
  readonly Hammer = Hammer;
}
