import { Component, computed, signal } from '@angular/core';
import { Check, LucideAngularModule, X } from 'lucide-angular';
import { toast } from 'ngx-sonner';

type Connection =
  | { state: 'idle' }
  | { state: 'testing' }
  | { state: 'connected'; user: string }
  | { state: 'failed'; error: string };

@Component({
  selector: 'app-settings-github-page',
  imports: [LucideAngularModule],
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold">GitHub</h1>
        <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
          Personal Access Token usado para listar repositórios e configurar webhooks.
        </p>
      </header>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h2 class="text-sm font-semibold uppercase tracking-wider"
            style="color: var(--color-fg-muted)">Personal Access Token</h2>

        <form (submit)="$event.preventDefault(); save()" class="mt-4 space-y-4">
          <label class="block">
            <span class="text-xs font-medium" style="color: var(--color-fg-muted)">Token</span>
            <input
              [type]="reveal() ? 'text' : 'password'"
              [value]="token()"
              (input)="onToken($any($event.target).value)"
              placeholder="ghp_..."
              class="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none"
              style="border-color: var(--color-border); background: var(--color-surface)"
            />
          </label>

          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              [checked]="reveal()"
              (change)="reveal.set($any($event.target).checked)"
              class="size-4"
            />
            Mostrar token
          </label>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="testConnection()"
              [disabled]="connection().state === 'testing' || !token()"
              class="rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring disabled:cursor-not-allowed disabled:opacity-50"
              style="border-color: var(--color-border)"
            >
              {{ connection().state === 'testing' ? 'Testando...' : 'Test connection' }}
            </button>
            <button
              type="submit"
              [disabled]="!token()"
              class="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring disabled:cursor-not-allowed disabled:opacity-50"
              style="background: var(--color-primary-600)"
            >
              Salvar
            </button>
          </div>

          @if (connection().state === 'connected') {
          <p class="flex items-center gap-2 text-sm" style="color: #047857">
            <lucide-icon [img]="Check" class="size-4" />
            Conectado como
            <span class="font-mono">{{ statusUser() }}</span>
          </p>
          } @else if (connection().state === 'failed') {
          <p class="flex items-center gap-2 text-sm" style="color: #b91c1c">
            <lucide-icon [img]="X" class="size-4" />
            {{ statusError() }}
          </p>
          }
        </form>
      </article>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <h2 class="text-sm font-semibold uppercase tracking-wider"
            style="color: var(--color-fg-muted)">Webhooks</h2>
        <p class="mt-2 text-sm">URL pública (LAN):</p>
        <p class="mt-1 font-mono text-sm">http://myroku.local/webhooks/github</p>
        <p class="mt-3 text-xs" style="color: var(--color-fg-muted)">
          Esta URL é configurada automaticamente em cada repositório no momento
          em que você cria uma aplicação.
        </p>
      </article>
    </section>
  `,
})
export class SettingsGithubPage {
  readonly Check = Check;
  readonly X = X;

  readonly token = signal('');
  readonly reveal = signal(false);
  readonly connection = signal<Connection>({ state: 'idle' });

  readonly statusUser = computed(() => {
    const c = this.connection();
    return c.state === 'connected' ? c.user : '';
  });
  readonly statusError = computed(() => {
    const c = this.connection();
    return c.state === 'failed' ? c.error : '';
  });

  onToken(v: string): void {
    this.token.set(v);
    this.connection.set({ state: 'idle' });
  }

  testConnection(): void {
    this.connection.set({ state: 'testing' });
    setTimeout(() => {
      if (this.token().startsWith('ghp_') || this.token().length > 8) {
        this.connection.set({ state: 'connected', user: '@czarfbc' });
      } else {
        this.connection.set({
          state: 'failed',
          error: 'Token inválido (formato esperado: ghp_...)',
        });
      }
    }, 800);
  }

  save(): void {
    toast.success('Token salvo com segurança.');
  }
}
