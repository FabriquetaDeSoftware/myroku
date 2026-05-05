import { Component, HostListener, input, output, signal } from '@angular/core';
import { LucideAngularModule, MoreVertical } from 'lucide-angular';
import { Container } from '../../../core/api/types';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

export type ContainerAction =
  | 'start'
  | 'stop'
  | 'restart'
  | 'kill'
  | 'logs'
  | 'inspect';

@Component({
  selector: 'app-container-row',
  imports: [LucideAngularModule, RelativeDatePipe, StatusBadgeComponent],
  template: `
    <article
      role="button"
      tabindex="0"
      (click)="open.emit(container())"
      (keydown.enter)="open.emit(container())"
      (keydown.space)="$event.preventDefault(); open.emit(container())"
      class="flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors hover:opacity-95 focus-ring"
      style="border-color: var(--color-border); background: var(--color-surface)"
      [attr.aria-label]="'Ver detalhes de ' + container().name"
    >
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="truncate text-sm font-semibold">{{ container().name }}</h3>
          <app-status-badge [status]="container().status" />
        </div>
        <div
          class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          style="color: var(--color-fg-muted)"
        >
          <span class="font-mono">{{ container().image }}</span>
          <span class="font-mono">id: {{ container().id }}</span>
          @if (container().startedAt) {
          <span>iniciado {{ container().startedAt | relativeDate }}</span>
          }
        </div>
      </div>

      <div class="relative" (click)="$event.stopPropagation()">
        <button
          type="button"
          (click)="menuOpen.set(!menuOpen())"
          class="rounded-lg p-2 transition-colors hover:opacity-80 focus-ring"
          style="color: var(--color-fg-muted)"
          aria-label="Ações"
        >
          <lucide-icon [img]="MoreVertical" class="size-4" />
        </button>
        @if (menuOpen()) {
        <div
          class="absolute right-0 top-10 z-10 w-44 overflow-hidden rounded-xl border shadow-lg"
          style="background: var(--color-surface); border-color: var(--color-border)"
        >
          @for (a of actions; track a.id) {
          <button
            type="button"
            (click)="emit(a.id)"
            class="flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
            [style.color]="a.danger ? '#b91c1c' : 'var(--color-fg)'"
          >
            {{ a.label }}
          </button>
          }
        </div>
        }
      </div>
    </article>
  `,
})
export class ContainerRowComponent {
  readonly container = input.required<Container>();
  readonly action = output<ContainerAction>();
  readonly open = output<Container>();

  readonly MoreVertical = MoreVertical;
  readonly menuOpen = signal(false);

  readonly actions: { id: ContainerAction; label: string; danger?: boolean }[] = [
    { id: 'restart', label: 'Reiniciar' },
    { id: 'stop', label: 'Parar' },
    { id: 'start', label: 'Iniciar' },
    { id: 'logs', label: 'Ver logs' },
    { id: 'inspect', label: 'Inspecionar' },
    { id: 'kill', label: 'Kill', danger: true },
  ];

  emit(a: ContainerAction): void {
    this.action.emit(a);
    this.menuOpen.set(false);
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.menuOpen.set(false);
  }
}
