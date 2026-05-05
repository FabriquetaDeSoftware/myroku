import { Component, computed, input, output, signal } from '@angular/core';
import { LucideAngularModule, Plus, TriangleAlert } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { EnvVar } from '../../../../core/api/types';
import { DetailDrawerComponent } from '../../../../shared/components/detail-drawer/detail-drawer.component';
import { EnvVarRowComponent } from '../../../../shared/components/env-var-row/env-var-row.component';

@Component({
  selector: 'app-detail-env-tab',
  imports: [LucideAngularModule, EnvVarRowComponent, DetailDrawerComponent],
  template: `
    <div class="space-y-4">
      <div
        class="flex items-start gap-3 rounded-xl border p-4 text-sm"
        style="
          border-color: #fde68a;
          background: #fffbeb;
          color: #92400e;
        "
      >
        <lucide-icon [img]="TriangleAlert" class="mt-0.5 size-4" />
        <p>
          Alterações em variáveis de ambiente só têm efeito após um novo deploy.
        </p>
      </div>

      <div class="space-y-2">
        @for (v of items(); track $index) {
        <app-env-var-row
          [envVar]="v"
          (open)="selectedIndex.set($index)"
          (change)="onChange($index, $event)"
          (remove)="onRemove($index)"
        />
        } @if (items().length === 0) {
        <p class="text-sm" style="color: var(--color-fg-muted)">
          Nenhuma variável definida.
        </p>
        }
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-2">
        <button
          type="button"
          (click)="add()"
          class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
          style="border-color: var(--color-border)"
        >
          <lucide-icon [img]="Plus" class="size-4" />
          Adicionar variável
        </button>
        <button
          type="button"
          (click)="save()"
          class="ml-auto rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring"
          style="border-color: var(--color-border)"
        >
          Salvar
        </button>
        <button
          type="button"
          (click)="saveAndDeploy()"
          class="rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring"
          style="background: var(--color-primary-600)"
        >
          Salvar + deploy
        </button>
      </div>
    </div>

    @let sel = selectedItem();
    <app-detail-drawer
      [open]="sel !== null"
      [title]="sel?.key || 'Nova variável'"
      [subtitle]="sel?.isSecret ? 'Variável secreta' : 'Variável de ambiente'"
      (closed)="selectedIndex.set(null)"
    >
      @if (sel !== null && selectedIndex() !== null) {
      <div class="space-y-4">
        <div>
          <label class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Chave
          </label>
          <input
            type="text"
            [value]="sel.key"
            (input)="onChange(selectedIndex()!, { ...sel, key: $any($event.target).value })"
            placeholder="KEY"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none"
            style="border-color: var(--color-border); background: var(--color-surface)"
          />
        </div>

        <div>
          <label class="text-xs font-medium" style="color: var(--color-fg-muted)">
            Valor
          </label>
          <textarea
            [value]="sel.value"
            (input)="onChange(selectedIndex()!, { ...sel, value: $any($event.target).value })"
            rows="6"
            placeholder="value"
            class="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-mono outline-none resize-y"
            style="border-color: var(--color-border); background: var(--color-surface)"
          ></textarea>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            [checked]="sel.isSecret"
            (change)="onChange(selectedIndex()!, { ...sel, isSecret: $any($event.target).checked })"
          />
          Marcar como secreto (mascara o valor na lista)
        </label>

        <div
          class="flex items-center gap-2 border-t pt-4"
          style="border-color: var(--color-border)"
        >
          <button
            type="button"
            (click)="onRemove(selectedIndex()!); selectedIndex.set(null)"
            class="rounded-xl px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-ring"
            style="background: #dc2626"
          >
            Remover
          </button>
          <button
            type="button"
            (click)="selectedIndex.set(null)"
            class="ml-auto rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Concluído
          </button>
        </div>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class AppDetailEnvTab {
  readonly appId = input.required<string>();
  readonly envVars = input.required<EnvVar[]>();
  readonly changed = output<EnvVar[]>();

  readonly Plus = Plus;
  readonly TriangleAlert = TriangleAlert;

  readonly items = signal<EnvVar[]>([]);
  readonly selectedIndex = signal<number | null>(null);

  readonly selectedItem = computed(() => {
    const i = this.selectedIndex();
    if (i === null) return null;
    return this.items()[i] ?? null;
  });

  constructor() {
    queueMicrotask(() => this.items.set([...this.envVars()]));
  }

  add(): void {
    this.items.update((arr) => [...arr, { key: '', value: '', isSecret: false }]);
  }

  onChange(index: number, next: EnvVar): void {
    this.items.update((arr) => arr.map((v, i) => (i === index ? next : v)));
  }

  onRemove(index: number): void {
    this.items.update((arr) => arr.filter((_, i) => i !== index));
  }

  save(): void {
    this.changed.emit(this.items());
    toast.success('Variáveis salvas. Aplicar requer redeploy.');
  }

  saveAndDeploy(): void {
    this.changed.emit(this.items());
    toast.success('Variáveis salvas. Deploy iniciado.');
  }
}
