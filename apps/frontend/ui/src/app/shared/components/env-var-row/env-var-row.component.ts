import { Component, input, output, signal } from '@angular/core';
import {
  ChevronRight,
  Eye,
  EyeOff,
  LucideAngularModule,
  Trash2,
} from 'lucide-angular';
import { EnvVar } from '../../../core/api/types';

@Component({
  selector: 'app-env-var-row',
  imports: [LucideAngularModule],
  template: `
    <div
      role="button"
      tabindex="0"
      (click)="open.emit(envVar())"
      (keydown.enter)="open.emit(envVar())"
      (keydown.space)="$event.preventDefault(); open.emit(envVar())"
      class="flex cursor-pointer items-center gap-2 rounded-xl border p-2 transition-colors hover:opacity-95 focus-ring"
      style="border-color: var(--color-border); background: var(--color-surface)"
      [attr.aria-label]="'Ver detalhes da variável ' + (envVar().key || 'sem nome')"
    >
      <lucide-icon
        [img]="ChevronRight"
        class="size-4 shrink-0"
        style="color: var(--color-fg-muted)"
      />
      <input
        type="text"
        [value]="envVar().key"
        (click)="$event.stopPropagation()"
        (input)="onKey($any($event.target).value)"
        placeholder="KEY"
        class="w-1/3 rounded-lg border px-3 py-2 text-sm font-mono outline-none"
        style="border-color: var(--color-border); background: var(--color-surface)"
      />
      <input
        [type]="envVar().isSecret && !revealed() ? 'password' : 'text'"
        [value]="envVar().value"
        (click)="$event.stopPropagation()"
        (input)="onValue($any($event.target).value)"
        placeholder="value"
        class="flex-1 rounded-lg border px-3 py-2 text-sm font-mono outline-none"
        style="border-color: var(--color-border); background: var(--color-surface)"
      />
      <button
        type="button"
        (click)="$event.stopPropagation(); toggleSecret()"
        class="rounded-lg p-2 text-xs transition-colors hover:opacity-80 focus-ring"
        [style.color]="
          envVar().isSecret ? 'var(--color-primary-600)' : 'var(--color-fg-muted)'
        "
        [attr.aria-label]="envVar().isSecret ? 'Marcar como não-secreto' : 'Marcar como secreto'"
        [attr.title]="envVar().isSecret ? 'Secreto' : 'Visível'"
      >
        <lucide-icon
          [img]="envVar().isSecret && !revealed() ? EyeOff : Eye"
          class="size-4"
        />
      </button>
      <button
        type="button"
        (click)="$event.stopPropagation(); remove.emit()"
        class="rounded-lg p-2 transition-colors hover:opacity-80 focus-ring"
        style="color: var(--color-fg-muted)"
        aria-label="Remover variável"
      >
        <lucide-icon [img]="Trash2" class="size-4" />
      </button>
    </div>
  `,
})
export class EnvVarRowComponent {
  readonly envVar = input.required<EnvVar>();

  readonly open = output<EnvVar>();
  readonly change = output<EnvVar>();
  readonly remove = output<void>();

  readonly revealed = signal(false);

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Trash2 = Trash2;
  readonly ChevronRight = ChevronRight;

  onKey(key: string): void {
    this.change.emit({ ...this.envVar(), key });
  }

  onValue(value: string): void {
    this.change.emit({ ...this.envVar(), value });
  }

  toggleSecret(): void {
    if (this.envVar().isSecret) {
      this.revealed.update((v) => !v);
    } else {
      this.change.emit({ ...this.envVar(), isSecret: true });
    }
  }
}
