import { Component } from '@angular/core';

@Component({
  selector: 'app-settings-server-page',
  template: `
    <section class="space-y-6">
      <header>
        <h1 class="text-2xl font-semibold">Servidor</h1>
        <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
          Caminhos e endereços usados pelo Myroku.
        </p>
      </header>

      <article
        class="rounded-2xl border p-5"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        <dl class="space-y-3 text-sm">
          @for (item of items; track item.label) {
          <div
            class="flex flex-wrap justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
            style="border-color: var(--color-border)"
          >
            <dt style="color: var(--color-fg-muted)">{{ item.label }}</dt>
            <dd class="font-mono">{{ item.value }}</dd>
          </div>
          }
        </dl>
      </article>

      <p class="text-xs" style="color: var(--color-fg-muted)">
        Para alterar estes valores, edite a configuração em
        <code class="font-mono">/etc/myroku/config.yaml</code> e reinicie o serviço.
      </p>
    </section>
  `,
})
export class SettingsServerPage {
  readonly items = [
    { label: 'URL pública (LAN)', value: 'http://myroku.local' },
    { label: 'Diretório de apps', value: '/var/lib/myroku/apps' },
    { label: 'Diretório de logs', value: '/var/lib/myroku/logs' },
    { label: 'Diretório do banco', value: '/var/lib/myroku/myroku.db' },
    { label: 'Porta HTTP', value: '8888' },
    { label: 'Docker socket', value: '/var/run/docker.sock' },
  ];
}
