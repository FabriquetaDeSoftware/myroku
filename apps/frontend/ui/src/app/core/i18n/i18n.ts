import {
  TranslateLoader,
  TranslateModule,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PT_BR } from './pt-BR';
import { EN } from './en';

export type Locale = 'pt-BR' | 'en';

const STORAGE_KEY = 'myroku.locale';

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  'pt-BR': PT_BR,
  en: EN,
};

class StaticLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, string>> {
    return of(TRANSLATIONS[(lang as Locale) ?? 'pt-BR'] ?? {});
  }
}

export function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'pt-BR' || stored === 'en') return stored;
  } catch {
    // ignora
  }
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) {
    return 'en';
  }
  return 'pt-BR';
}

export function persistLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignora
  }
}

export function provideI18n() {
  return [
    provideTranslateService({
      loader: { provide: TranslateLoader, useClass: StaticLoader },
      defaultLanguage: detectInitialLocale(),
    }),
  ];
}

export { TranslateModule };
