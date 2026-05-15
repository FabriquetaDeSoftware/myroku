import { Component, computed, input } from '@angular/core';
import {
  Box,
  CircleX,
  Clock,
  LucideAngularModule,
  LucideIconData,
  PlayCircle,
} from 'lucide-angular';
import { Container, ContainerStatus } from '../../../core/api/types';

interface Segment {
  key: ContainerStatus;
  label: string;
  count: number;
  percent: number;
  token: string;
  icon: LucideIconData;
}

const ORDER: Omit<Segment, 'count' | 'percent'>[] = [
  { key: 'running', label: 'Running', token: '--color-status-running', icon: PlayCircle },
  { key: 'stopped', label: 'Stopped', token: '--color-status-stopped', icon: Box },
  { key: 'failed', label: 'Failed', token: '--color-status-failed', icon: CircleX },
  { key: 'pending', label: 'Pending', token: '--color-status-pending', icon: Clock },
];

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

@Component({
  selector: 'app-dashboard-charts',
  imports: [LucideAngularModule],
  template: `
    <article
      class="rounded-2xl border p-6"
      style="border-color: var(--color-border); background: var(--color-surface)"
    >
      <header class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3
            class="text-xs font-semibold uppercase tracking-wider"
            style="color: var(--color-fg-muted)"
          >
            Status dos containers
          </h3>
          <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
            Distribuição em tempo real
          </p>
        </div>
        <span
          class="rounded-full px-2.5 py-1 text-xs tabular-nums"
          style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
        >
          {{ total() }} total
        </span>
      </header>

      @if (total() > 0) {
        <div class="grid items-center gap-6 lg:grid-cols-[180px_1fr]">
          <div class="relative mx-auto flex size-44 items-center justify-center">
            <svg viewBox="0 0 100 100" class="size-44 -rotate-90">
              <circle
                cx="50"
                cy="50"
                [attr.r]="radius"
                fill="none"
                stroke="var(--color-surface-muted)"
                stroke-width="9"
              />
              <circle
                cx="50"
                cy="50"
                [attr.r]="radius"
                fill="none"
                stroke="var(--color-status-running)"
                stroke-width="9"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="runningOffset()"
                class="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span class="text-5xl font-semibold tabular-nums leading-none">
                {{ runningPercent() }}<span class="text-2xl">%</span>
              </span>
              <span
                class="mt-2 text-xs uppercase tracking-wider"
                style="color: var(--color-fg-muted)"
              >
                {{ runningCount() }} de {{ total() }} rodando
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <div
              class="flex h-3 w-full overflow-hidden rounded-full"
              style="background: var(--color-surface-muted)"
            >
              @for (s of segments(); track s.key) {
                @if (s.count > 0) {
                  <div
                    class="h-full transition-[flex-basis] duration-500 ease-out"
                    [style.flex-basis.%]="s.percent"
                    [style.background]="'var(' + s.token + ')'"
                    [attr.title]="s.label + ': ' + s.count + ' (' + s.percent + '%)'"
                  ></div>
                }
              }
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              @for (s of segments(); track s.key) {
                <div
                  class="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition"
                  [class.opacity-50]="s.count === 0"
                  [style.border-color]="
                    'color-mix(in srgb, var(' + s.token + ') 20%, transparent)'
                  "
                  [style.background]="
                    'color-mix(in srgb, var(' + s.token + ') 8%, transparent)'
                  "
                >
                  <div
                    class="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    [style.background]="
                      'color-mix(in srgb, var(' + s.token + ') 18%, transparent)'
                    "
                    [style.color]="'var(' + s.token + ')'"
                  >
                    <lucide-icon [img]="s.icon" class="size-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div
                      class="text-[11px] font-medium uppercase tracking-wider"
                      style="color: var(--color-fg-muted)"
                    >
                      {{ s.label }}
                    </div>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-xl font-semibold tabular-nums leading-tight">
                        {{ s.count }}
                      </span>
                      <span
                        class="text-xs tabular-nums"
                        style="color: var(--color-fg-muted)"
                      >
                        {{ s.percent }}%
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div
          class="flex flex-col items-center justify-center gap-2 py-10 text-center"
        >
          <div
            class="flex size-12 items-center justify-center rounded-full"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
          >
            <lucide-icon [img]="Box" class="size-5" />
          </div>
          <p class="text-sm" style="color: var(--color-fg-muted)">
            Sem containers carregados ainda.
          </p>
        </div>
      }
    </article>
  `,
})
export class DashboardChartsComponent {
  readonly containers = input.required<Container[]>();

  readonly Box = Box;
  readonly radius = RADIUS;
  readonly circumference = CIRCUMFERENCE;

  readonly total = computed(() => this.containers().length);

  readonly segments = computed<Segment[]>(() => {
    const all = this.containers();
    const counts: Record<ContainerStatus, number> = {
      running: 0,
      stopped: 0,
      failed: 0,
      pending: 0,
    };
    for (const c of all) counts[c.status]++;

    const total = all.length;
    const raw = ORDER.map((o) => ({
      ...o,
      count: counts[o.key],
      percent: total === 0 ? 0 : (counts[o.key] / total) * 100,
    }));

    const rounded = raw.map((s) => ({ ...s, percent: Math.round(s.percent) }));
    const drift =
      rounded.reduce((sum, s) => sum + s.percent, 0) - (total === 0 ? 0 : 100);
    if (drift !== 0) {
      const idx = rounded.reduce(
        (maxIdx, s, i, arr) => (s.count > arr[maxIdx].count ? i : maxIdx),
        0,
      );
      rounded[idx].percent -= drift;
    }

    return rounded;
  });

  readonly runningCount = computed(
    () => this.segments().find((s) => s.key === 'running')?.count ?? 0,
  );
  readonly runningPercent = computed(
    () => this.segments().find((s) => s.key === 'running')?.percent ?? 0,
  );
  readonly runningOffset = computed(
    () => CIRCUMFERENCE - (CIRCUMFERENCE * this.runningPercent()) / 100,
  );
}
