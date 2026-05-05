import { Injectable, computed, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'myroku.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.detectInitial());
  private readonly systemPrefersDark = signal(this.systemPreference());

  /** Tema realmente aplicado (resolvendo "auto" para light/dark). */
  readonly resolved = computed<Resolved>(() => {
    const c = this.current();
    if (c === 'auto') return this.systemPrefersDark() ? 'dark' : 'light';
    return c;
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener?.('change', (e) =>
        this.systemPrefersDark.set(e.matches),
      );
    }
    effect(() => this.apply(this.resolved(), this.current()));
  }

  toggle(): void {
    this.current.update((t) => (this.resolved() === 'dark' ? 'light' : 'dark'));
  }

  set(theme: Theme): void {
    this.current.set(theme);
  }

  private detectInitial(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored;
      }
    } catch {
      // ignora
    }
    return 'auto';
  }

  private systemPreference(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private apply(resolved: Resolved, choice: Theme): void {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignora
    }
  }
}
