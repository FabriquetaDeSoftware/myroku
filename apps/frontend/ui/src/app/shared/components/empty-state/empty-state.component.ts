import { Component, input, output } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  imports: [LucideAngularModule],
  template: `
    <div
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center"
      style="border-color: var(--color-border)"
    >
      @if (icon()) {
      <span
        class="grid size-12 place-items-center rounded-2xl"
        style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
      >
        <lucide-icon [img]="icon()!" class="size-6" />
      </span>
      }
      <h3 class="mt-4 text-base font-semibold">{{ title() }}</h3>
      @if (description()) {
      <p class="mt-1 max-w-sm text-sm" style="color: var(--color-fg-muted)">
        {{ description() }}
      </p>
      }
      @if (actionLabel()) {
      <button
        type="button"
        (click)="action.emit()"
        class="mt-6 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus-ring"
        style="background: var(--color-primary-600)"
      >
        {{ actionLabel() }}
      </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input<LucideIconData | null>(null);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);

  readonly action = output<void>();
}
