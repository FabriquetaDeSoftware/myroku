import { Component, input, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { Application } from '../../../../core/api/types';

@Component({
  selector: 'app-detail-settings-tab',
  template: `
    <form
      class="space-y-4"
      (submit)="$event.preventDefault(); onSave()"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="block">
          <span class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Nome
          </span>
          <input
            type="text"
            [value]="form().name"
            (input)="update('name', $any($event.target).value)"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style="border-color: var(--color-border); background: var(--color-surface)"
          />
        </label>

        <label class="block">
          <span class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Branch
          </span>
          <input
            type="text"
            [value]="form().branch"
            (input)="update('branch', $any($event.target).value)"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none"
            style="border-color: var(--color-border); background: var(--color-surface)"
          />
        </label>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="block">
          <span class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Repositório
          </span>
          <input
            type="text"
            [value]="form().repoFullName"
            disabled
            class="mt-1 w-full cursor-not-allowed rounded-xl border px-3 py-2 text-sm font-mono opacity-60"
            style="border-color: var(--color-border); background: var(--color-surface-muted)"
          />
        </label>

        <label class="block">
          <span class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Tipo de build
          </span>
          <select
            [value]="form().buildType"
            (change)="update('buildType', $any($event.target).value)"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
            style="border-color: var(--color-border); background: var(--color-surface)"
          >
            <option value="dockerfile">Dockerfile</option>
            <option value="compose">Docker Compose</option>
          </select>
        </label>
      </div>

      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          [checked]="form().autoDeploy"
          (change)="update('autoDeploy', $any($event.target).checked)"
          class="size-4 rounded"
        />
        <span class="text-sm">Auto-deploy ao receber push em <span class="font-mono">{{ form().branch }}</span></span>
      </label>

      <div class="flex justify-end pt-2">
        <button
          type="submit"
          class="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring"
          style="background: var(--color-primary-600)"
        >
          Salvar
        </button>
      </div>
    </form>
  `,
})
export class AppDetailSettingsTab {
  readonly app = input.required<Application>();

  readonly form = signal({
    name: '',
    branch: '',
    repoFullName: '',
    buildType: 'dockerfile' as 'dockerfile' | 'compose',
    autoDeploy: true,
  });

  constructor() {
    queueMicrotask(() => {
      const a = this.app();
      this.form.set({
        name: a.name,
        branch: a.branch,
        repoFullName: a.repoFullName,
        buildType: a.buildType,
        autoDeploy: a.autoDeploy,
      });
    });
  }

  update<K extends keyof ReturnType<typeof this.form>>(
    field: K,
    value: ReturnType<typeof this.form>[K],
  ): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onSave(): void {
    toast.success('Configurações salvas.');
  }
}
