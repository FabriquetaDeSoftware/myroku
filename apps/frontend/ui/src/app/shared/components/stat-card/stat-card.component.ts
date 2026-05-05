import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  imports: [LucideAngularModule],
  template: `
    <article
      class="rounded-2xl border p-5"
      style="border-color: var(--color-border); background: var(--color-surface)"
    >
      <header class="flex items-center justify-between">
        <span
          class="text-xs font-medium uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          {{ label() }}
        </span>
        @if (icon()) {
        <span
          class="rounded-lg p-1.5"
          style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
        >
          <lucide-icon [img]="icon()!" class="size-4" />
        </span>
        }
      </header>
      <div class="mt-3 flex items-end justify-between">
        <span class="text-4xl font-semibold tabular-nums">{{ value() }}</span>
        @if (delta()) {
        <span
          class="rounded-md px-2 py-0.5 text-xs font-medium"
          [style.background]="deltaTone().bg"
          [style.color]="deltaTone().fg"
        >
          {{ delta() }}
        </span>
        }
      </div>
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<LucideIconData | null>(null);
  readonly delta = input<string | null>(null);
  readonly tone = input<'positive' | 'negative' | 'neutral'>('neutral');

  readonly deltaTone = computed(() => {
    switch (this.tone()) {
      case 'positive':
        return { bg: '#ecfdf5', fg: '#047857' };
      case 'negative':
        return { bg: '#fef2f2', fg: '#b91c1c' };
      default:
        return { bg: '#f4f4f5', fg: '#3f3f46' };
    }
  });
}
