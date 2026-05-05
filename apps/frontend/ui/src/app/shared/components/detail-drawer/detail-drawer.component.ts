import { animate, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { Component, HostListener, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-detail-drawer',
  imports: [A11yModule, LucideAngularModule, RouterLink],
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
    trigger('slide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate(
          '160ms ease-in',
          style({ transform: 'translateX(100%)' }),
        ),
      ]),
    ]),
  ],
  template: `
    @if (open()) {
    <div class="fixed inset-0 z-50">
      <div
        @fade
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        (click)="closed.emit()"
      ></div>
      <aside
        @slide
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        class="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l shadow-lg"
        style="
          background: var(--color-surface);
          border-color: var(--color-border);
          color: var(--color-fg);
        "
      >
        <header
          class="flex items-start justify-between gap-3 border-b px-5 py-4"
          style="border-color: var(--color-border)"
        >
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-base font-semibold">{{ title() }}</h2>
            @if (subtitle()) {
            <p
              class="mt-0.5 truncate text-xs"
              style="color: var(--color-fg-muted)"
            >
              {{ subtitle() }}
            </p>
            }
          </div>
          <button
            type="button"
            (click)="closed.emit()"
            class="rounded-lg p-1.5 hover:opacity-80 focus-ring"
            style="color: var(--color-fg-muted)"
            aria-label="Fechar painel"
          >
            <lucide-icon [img]="X" class="size-4" />
          </button>
        </header>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <ng-content />
        </div>

        @if (hasPageLink()) {
        <footer
          class="border-t px-5 py-4"
          style="border-color: var(--color-border)"
        >
          <a
            [routerLink]="pageHref()"
            (click)="closed.emit()"
            class="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring"
            style="background: var(--color-primary-600)"
          >
            {{ pageLabel() }}
            <lucide-icon [img]="ArrowRight" class="size-4" />
          </a>
        </footer>
        }
      </aside>
    </div>
    }
  `,
})
export class DetailDrawerComponent {
  readonly open = input<boolean>(false);
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  /** Quando definido, exibe um botão "Abrir página" no rodapé que navega para a rota. */
  readonly pageHref = input<string | unknown[] | null>(null);
  readonly pageLabel = input<string>('Abrir página');

  readonly closed = output<void>();

  readonly X = X;
  readonly ArrowRight = ArrowRight;

  readonly hasPageLink = computed(() => {
    const href = this.pageHref();
    if (href == null) return false;
    if (Array.isArray(href)) return href.length > 0;
    return href.length > 0;
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
