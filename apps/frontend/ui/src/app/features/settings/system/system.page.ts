import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LocaleService } from '../../../core/i18n/locale.service';
import { Locale } from '../../../core/i18n/i18n';
import { Theme, ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-system-page',
  imports: [TranslatePipe],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold">{{ 'system.title' | translate }}</h1>
        <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
          Configurações gerais do servidor Myroku.
        </p>
      </header>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          {{ 'system.appearance' | translate }}
        </h2>

        <div class="mt-4 space-y-3">
          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-medium">{{ 'theme.label' | translate }}</span>
            <div
              class="flex overflow-hidden rounded-xl border text-sm"
              style="border-color: var(--color-border)"
            >
              @for (opt of themeOptions; track opt.value) {
              <button
                type="button"
                (click)="theme.set(opt.value)"
                class="px-3 py-1.5 transition-colors"
                [style.background]="
                  theme.current() === opt.value
                    ? 'var(--color-primary-600)'
                    : 'transparent'
                "
                [style.color]="
                  theme.current() === opt.value
                    ? 'white'
                    : 'var(--color-fg-muted)'
                "
              >
                {{ opt.labelKey | translate }}
              </button>
              }
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <span class="text-sm font-medium">{{ 'locale.label' | translate }}</span>
            <select
              [value]="locale.current()"
              (change)="setLocale($any($event.target).value)"
              class="rounded-xl border px-3 py-1.5 text-sm"
              style="border-color: var(--color-border); background: var(--color-surface)"
            >
              @for (l of locale.available; track l.code) {
              <option [value]="l.code">{{ l.label }}</option>
              }
            </select>
          </div>
        </div>
      </article>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wider"
          style="color: var(--color-fg-muted)"
        >
          {{ 'system.version' | translate }}
        </h2>
        <p class="mt-2 text-sm">Myroku UI 1.0.0 — Fase 4 (atalhos, i18n, animações).</p>
      </article>
    </section>
  `,
})
export class SystemPage {
  readonly theme = inject(ThemeService);
  readonly locale = inject(LocaleService);

  readonly themeOptions: { value: Theme; labelKey: string }[] = [
    { value: 'light', labelKey: 'theme.light' },
    { value: 'dark', labelKey: 'theme.dark' },
    { value: 'auto', labelKey: 'theme.auto' },
  ];

  setLocale(code: string): void {
    this.locale.set(code as Locale);
  }
}
