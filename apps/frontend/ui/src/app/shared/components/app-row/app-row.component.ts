import { Component, input, output } from '@angular/core';
import { GitBranch, LucideAngularModule, Play, RotateCw } from 'lucide-angular';
import { Application } from '../../../core/api/types';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-app-row',
  imports: [LucideAngularModule, RelativeDatePipe, StatusBadgeComponent],
  template: `
    <article
      role="button"
      tabindex="0"
      (click)="open.emit(app())"
      (keydown.enter)="open.emit(app())"
      (keydown.space)="$event.preventDefault(); open.emit(app())"
      class="flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors hover:opacity-95 focus-ring"
      style="border-color: var(--color-border); background: var(--color-surface)"
      [attr.aria-label]="'Ver detalhes de ' + app().name"
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3">
          <h3 class="truncate text-sm font-semibold">{{ app().name }}</h3>
          <app-status-badge [status]="app().status" />
        </div>
        <div
          class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          style="color: var(--color-fg-muted)"
        >
          <span class="font-mono">{{ app().repoFullName }}</span>
          <span class="inline-flex items-center gap-1">
            <lucide-icon [img]="GitBranch" class="size-3" />
            {{ app().branch }}
          </span>
          @if (app().lastDeploymentAt) {
          <span>último deploy {{ app().lastDeploymentAt | relativeDate }}</span>
          }
        </div>
      </div>

      <div class="hidden items-center gap-2 md:flex">
        <button
          type="button"
          (click)="$event.stopPropagation(); deploy.emit(app().id)"
          class="rounded-lg p-2 transition-colors hover:opacity-80 focus-ring"
          style="color: var(--color-fg-muted)"
          aria-label="Fazer deploy"
        >
          <lucide-icon [img]="Play" class="size-4" />
        </button>
        <button
          type="button"
          (click)="$event.stopPropagation(); restart.emit(app().id)"
          class="rounded-lg p-2 transition-colors hover:opacity-80 focus-ring"
          style="color: var(--color-fg-muted)"
          aria-label="Reiniciar"
        >
          <lucide-icon [img]="RotateCw" class="size-4" />
        </button>
      </div>
    </article>
  `,
})
export class AppRowComponent {
  readonly app = input.required<Application>();

  readonly open = output<Application>();
  readonly deploy = output<string>();
  readonly restart = output<string>();

  readonly GitBranch = GitBranch;
  readonly Play = Play;
  readonly RotateCw = RotateCw;
}
