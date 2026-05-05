import { animate, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { Component, HostListener, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [A11yModule],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('120ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('pop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96)' }),
        animate(
          '160ms ease-out',
          style({ opacity: 1, transform: 'scale(1)' }),
        ),
      ]),
    ]),
  ],
  template: `
    @if (open()) {
    <div
      @fade
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
      (click)="cancel.emit()"
    >
      <div
        @pop
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-modal="true"
        (click)="$event.stopPropagation()"
        class="w-full max-w-md rounded-2xl border p-6 shadow-lg"
        style="
          background: var(--color-surface);
          border-color: var(--color-border);
          color: var(--color-fg);
        "
      >
        <h2 class="text-lg font-semibold">{{ title() }}</h2>
        <p class="mt-2 text-sm" style="color: var(--color-fg-muted)">
          {{ description() }}
        </p>

        @if (confirmText()) {
        <div class="mt-4">
          <label class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Digite <span class="font-mono">{{ confirmText() }}</span> para confirmar
          </label>
          <input
            type="text"
            [value]="typed()"
            (input)="typed.set($any($event.target).value)"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none"
            style="border-color: var(--color-border); background: var(--color-surface)"
          />
        </div>
        }

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            (click)="cancel.emit()"
            class="rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="onConfirm()"
            [disabled]="!canConfirm()"
            class="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            [style.background]="
              tone() === 'danger' ? '#dc2626' : 'var(--color-primary-600)'
            "
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input<boolean>(false);
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly tone = input<'default' | 'danger'>('default');
  /** Se definido, exige que o usuário digite esta string para liberar o botão. */
  readonly confirmText = input<string | null>(null);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  readonly typed = signal('');

  readonly canConfirm = computed(() => {
    const required = this.confirmText();
    if (!required) return true;
    return this.typed() === required;
  });

  onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirm.emit();
    this.typed.set('');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.cancel.emit();
  }
}
