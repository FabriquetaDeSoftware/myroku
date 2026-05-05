import { Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Undo2 } from 'lucide-angular';
import { Deployment } from '../../../core/api/types';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-deploy-row',
  imports: [LucideAngularModule, RelativeDatePipe, StatusBadgeComponent],
  template: `
    <article
      role="button"
      tabindex="0"
      (click)="open.emit(deployment())"
      (keydown.enter)="open.emit(deployment())"
      (keydown.space)="$event.preventDefault(); open.emit(deployment())"
      class="flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition-colors hover:opacity-95 focus-ring"
      style="border-color: var(--color-border); background: var(--color-surface)"
      [attr.aria-label]="'Ver detalhes do deploy ' + shortId()"
    >
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-mono text-sm">#{{ shortId() }}</span>
          <app-status-badge [status]="deployment().status" />
          <span
            class="rounded px-1.5 py-0.5 text-xs"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
          >
            {{ deployment().trigger }}
          </span>
        </div>
        <p class="mt-1 truncate text-sm">
          <span class="font-mono">{{ deployment().commitSha }}</span>
          <span class="ml-2" style="color: var(--color-fg-muted)">
            {{ deployment().commitMessage }}
          </span>
        </p>
        <div
          class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          style="color: var(--color-fg-muted)"
        >
          <span>iniciado {{ deployment().startedAt | relativeDate }}</span>
          @if (deployment().durationMs) {
          <span>duração {{ durationLabel() }}</span>
          }
          @if (deployment().errorMessage) {
          <span style="color: #b91c1c">{{ deployment().errorMessage }}</span>
          }
        </div>
      </div>

      @if (canRollback()) {
      <button
        type="button"
        (click)="$event.stopPropagation(); rollback.emit(deployment().id)"
        class="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium hover:opacity-80 focus-ring"
        style="border-color: var(--color-border)"
      >
        <lucide-icon [img]="Undo2" class="size-3" />
        Rollback
      </button>
      }
    </article>
  `,
})
export class DeployRowComponent {
  readonly deployment = input.required<Deployment>();
  readonly canRollback = input<boolean>(false);

  readonly open = output<Deployment>();
  readonly rollback = output<string>();

  readonly Undo2 = Undo2;

  readonly shortId = computed(() => this.deployment().id.replace(/^dep_/, ''));

  readonly durationLabel = computed(() => {
    const ms = this.deployment().durationMs;
    if (!ms) return '';
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  });
}
