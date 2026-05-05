import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Locale, detectInitialLocale, persistLocale } from './i18n';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly translate = inject(TranslateService);
  readonly current = signal<Locale>(detectInitialLocale());

  readonly available: { code: Locale; label: string }[] = [
    { code: 'pt-BR', label: 'Português (BR)' },
    { code: 'en', label: 'English' },
  ];

  constructor() {
    this.translate.use(this.current());
    effect(() => {
      const code = this.current();
      this.translate.use(code);
      persistLocale(code);
    });
  }

  set(locale: Locale): void {
    this.current.set(locale);
  }
}
