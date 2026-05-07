import { Component, HostListener, input, output, signal } from '@angular/core';
import { LucideAngularModule, MoreVertical } from 'lucide-angular';
import { DockerImage } from '../../../core/api/types';
import { BytesPipe } from '../../pipes/bytes.pipe';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';

export type ImageAction = 'pull' | 'run' | 'inspect' | 'tag' | 'remove';

@Component({
  selector: 'app-image-row',
  imports: [LucideAngularModule, BytesPipe, RelativeDatePipe],
  template: `
    <article
      role="button"
      tabindex="0"
      (click)="open.emit(image())"
      (keydown.enter)="open.emit(image())"
      (keydown.space)="$event.preventDefault(); open.emit(image())"
      class="flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors hover:opacity-95 focus-ring"
      style="border-color: var(--color-border); background: var(--color-surface)"
      [attr.aria-label]="'Ver detalhes de ' + image().repository + ':' + image().tag"
    >
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="truncate text-sm font-semibold font-mono">
            {{ image().repository }}<span style="color: var(--color-fg-muted)">:</span>{{ image().tag }}
          </h3>
          @if (image().dangling) {
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            style="background: #fef2f2; color: #b91c1c"
            >dangling</span
          >
          } @else if (image().inUse) {
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            style="background: #ecfdf5; color: #047857"
            >em uso · {{ image().containerCount }}</span
          >
          } @else {
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium"
            style="background: var(--color-surface-muted); color: var(--color-fg-muted)"
            >sem uso</span
          >
          }
        </div>
        <div
          class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
          style="color: var(--color-fg-muted)"
        >
          <span class="font-mono">id: {{ shortId() }}</span>
          <span>{{ image().sizeBytes | bytes }}</span>
          <span>criada {{ image().createdAt | relativeDate }}</span>
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
export class ImageRowComponent {
  readonly image = input.required<DockerImage>();
  readonly action = output<ImageAction>();
  readonly open = output<DockerImage>();

  readonly MoreVertical = MoreVertical;
  readonly menuOpen = signal(false);

  readonly actions: { id: ImageAction; label: string; danger?: boolean }[] = [
    { id: 'run', label: 'Run container' },
    { id: 'pull', label: 'Pull (atualizar)' },
    { id: 'tag', label: 'Adicionar tag' },
    { id: 'inspect', label: 'Inspecionar' },
    { id: 'remove', label: 'Remover', danger: true },
  ];

  shortId(): string {
    const id = this.image().id;
    return id.startsWith('sha256:') ? id.slice(7, 19) : id.slice(0, 12);
  }

  emit(a: ImageAction): void {
    this.action.emit(a);
    this.menuOpen.set(false);
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.menuOpen.set(false);
  }
}
