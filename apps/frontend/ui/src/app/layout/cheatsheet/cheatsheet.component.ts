import { animate, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { Component, HostListener, inject } from '@angular/core';
import { ShortcutsService } from '../../core/shortcuts/shortcuts.service';

interface ShortcutGroup {
  group: string;
  items: { keys: string[]; label: string }[];
}

@Component({
  selector: 'app-cheatsheet',
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
        style({ opacity: 0, transform: 'translateY(8px) scale(0.98)' }),
        animate(
          '160ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
    ]),
  ],
  template: `
    @if (shortcuts.cheatsheetOpen()) {
    <div
      @fade
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm"
      (click)="close()"
    >
      <div
        @pop
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-label="Atalhos de teclado"
        (click)="$event.stopPropagation()"
        class="w-full max-w-xl rounded-2xl border p-6 shadow-lg"
        style="
          background: var(--color-surface);
          border-color: var(--color-border);
          color: var(--color-fg);
        "
      >
        <h2 class="text-lg font-semibold">Atalhos de teclado</h2>
        <p class="mt-1 text-xs" style="color: var(--color-fg-muted)">
          Pressione as teclas em sequência. Não funciona enquanto digita em campos.
        </p>

        <div class="mt-5 space-y-5">
          @for (g of groups; track g.group) {
          <section>
            <h3
              class="mb-2 text-xs font-medium uppercase tracking-wider"
              style="color: var(--color-fg-muted)"
            >
              {{ g.group }}
            </h3>
            <ul class="space-y-1.5">
              @for (item of g.items; track item.label) {
              <li class="flex items-center justify-between text-sm">
                <span>{{ item.label }}</span>
                <span class="flex items-center gap-1">
                  @for (k of item.keys; track $index) {
                  <kbd
                    class="rounded px-1.5 py-0.5 text-xs font-mono"
                    style="
                      background: var(--color-surface-muted);
                      color: var(--color-fg);
                    "
                    >{{ k }}</kbd
                  >
                  }
                </span>
              </li>
              }
            </ul>
          </section>
          }
        </div>
      </div>
    </div>
    }
  `,
})
export class CheatsheetComponent {
  readonly shortcuts = inject(ShortcutsService);

  readonly groups: ShortcutGroup[] = [
    {
      group: 'Navegação',
      items: [
        { keys: ['g', 'd'], label: 'Dashboard' },
        { keys: ['g', 'a'], label: 'Aplicações' },
        { keys: ['g', 'c'], label: 'Containers' },
        { keys: ['g', 's'], label: 'Configurações' },
      ],
    },
    {
      group: 'Geral',
      items: [
        { keys: ['Ctrl', 'K'], label: 'Abrir paleta de comandos' },
        { keys: ['?'], label: 'Mostrar este painel' },
        { keys: ['Esc'], label: 'Fechar overlays' },
      ],
    },
  ];

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.shortcuts.cheatsheetOpen()) this.close();
  }

  close(): void {
    this.shortcuts.cheatsheetOpen.set(false);
  }
}
