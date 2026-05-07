import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

interface NavShortcut {
  sequence: string; // ex.: "g d"
  label: string;
  path: string;
}

const NAV_SHORTCUTS: NavShortcut[] = [
  { sequence: 'g d', label: 'Ir para Dashboard', path: '/' },
  { sequence: 'g a', label: 'Ir para Aplicações', path: '/apps' },
  { sequence: 'g c', label: 'Ir para Containers', path: '/containers' },
  { sequence: 'g i', label: 'Ir para Imagens', path: '/images' },
  { sequence: 'g s', label: 'Ir para Configurações', path: '/settings/system' },
];

const SEQUENCE_TIMEOUT_MS = 1200;

/**
 * Escuta sequências de teclas estilo Linear (g d, g a, g c, g s) e
 * a tecla "?" para abrir o cheatsheet. Comandos globais Ctrl+K e Esc
 * continuam tratados nos componentes que os possuem.
 */
@Injectable({ providedIn: 'root' })
export class ShortcutsService {
  private readonly router = inject(Router);
  private firstKey: string | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly cheatsheetOpen = signal(false);

  /** Chamado pelo LayoutShell no `keydown` global. */
  handle(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.isTypingTarget(target)) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === '?') {
      event.preventDefault();
      this.cheatsheetOpen.set(true);
      return;
    }

    const key = event.key.toLowerCase();
    if (!this.firstKey) {
      if (key === 'g') {
        this.firstKey = 'g';
        this.timer = setTimeout(() => this.reset(), SEQUENCE_TIMEOUT_MS);
      }
      return;
    }

    const seq = `${this.firstKey} ${key}`;
    this.reset();
    const match = NAV_SHORTCUTS.find((s) => s.sequence === seq);
    if (match) {
      event.preventDefault();
      void this.router.navigateByUrl(match.path);
    }
  }

  list(): NavShortcut[] {
    return NAV_SHORTCUTS;
  }

  private reset(): void {
    this.firstKey = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private isTypingTarget(el: HTMLElement | null): boolean {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    return false;
  }
}
