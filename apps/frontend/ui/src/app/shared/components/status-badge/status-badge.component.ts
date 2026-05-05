import { Component, computed, input } from '@angular/core';
import { ContainerStatus, DeploymentStatus } from '../../../core/api/types';

type Status = ContainerStatus | DeploymentStatus;

const LABEL: Record<Status, string> = {
  running: 'running',
  stopped: 'stopped',
  failed: 'failed',
  pending: 'pending',
  queued: 'queued',
  building: 'building',
  deploying: 'deploying',
  success: 'success',
  rolled_back: 'rolled back',
};

const TONE: Record<Status, { bg: string; fg: string; dot: string }> = {
  running: { bg: '#ecfdf5', fg: '#047857', dot: '#10b981' },
  success: { bg: '#ecfdf5', fg: '#047857', dot: '#10b981' },
  stopped: { bg: '#f4f4f5', fg: '#3f3f46', dot: '#71717a' },
  failed: { bg: '#fef2f2', fg: '#b91c1c', dot: '#ef4444' },
  pending: { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' },
  queued: { bg: '#faf5ff', fg: '#7e22ce', dot: '#a855f7' },
  building: { bg: '#eff6ff', fg: '#1d4ed8', dot: '#3b82f6' },
  deploying: { bg: '#eff6ff', fg: '#1d4ed8', dot: '#3b82f6' },
  rolled_back: { bg: '#fffbeb', fg: '#b45309', dot: '#f59e0b' },
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      [style.background]="tone().bg"
      [style.color]="tone().fg"
    >
      <span
        class="size-1.5 rounded-full"
        [style.background]="tone().dot"
      ></span>
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<Status>();

  readonly label = computed(() => LABEL[this.status()]);
  readonly tone = computed(() => TONE[this.status()]);
}
