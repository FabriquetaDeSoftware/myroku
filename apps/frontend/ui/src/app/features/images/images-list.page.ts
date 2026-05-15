import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Layers, LucideAngularModule, RefreshCw, Search } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { ImagesService } from '../../core/api/images.service';
import { DockerImage } from '../../core/api/types';
import { DetailDrawerComponent } from '../../shared/components/detail-drawer/detail-drawer.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  ImageAction,
  ImageRowComponent,
} from '../../shared/components/image-row/image-row.component';
import { BytesPipe } from '../../shared/pipes/bytes.pipe';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';

type UsageFilter = 'all' | 'in-use' | 'unused' | 'dangling';

@Component({
  selector: 'app-images-list-page',
  imports: [
    LucideAngularModule,
    ImageRowComponent,
    DetailDrawerComponent,
    EmptyStateComponent,
    BytesPipe,
    RelativeDatePipe,
  ],
  template: `
    <section class="space-y-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Imagens</h1>
          <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
            Imagens Docker disponíveis no host — total
            {{ images().length }} ({{ totalSize() | bytes }}).
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="refresh()"
            [disabled]="loading()"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring disabled:opacity-50"
            style="border-color: var(--color-border); background: var(--color-surface)"
          >
            <lucide-icon [img]="RefreshCw" class="size-4" [class.animate-spin]="loading()" />
            Atualizar
          </button>
          <button
            type="button"
            (click)="onPrune()"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Prune dangling
          </button>
          <button
            type="button"
            (click)="onPull()"
            class="rounded-xl px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-ring"
            style="background: var(--color-primary-600)"
          >
            Pull imagem
          </button>
        </div>
      </header>

      <div class="flex flex-wrap items-center gap-3">
        <div
          class="flex flex-1 min-w-65 items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <lucide-icon [img]="Search" class="size-4" style="color: var(--color-fg-muted)" />
          <input
            type="text"
            placeholder="Buscar por repositório, tag ou id..."
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            class="flex-1 bg-transparent outline-none"
          />
        </div>
        <select
          [value]="usageFilter()"
          (change)="usageFilter.set($any($event.target).value)"
          class="rounded-xl border px-3 py-2 text-sm"
          style="border-color: var(--color-border); background: var(--color-surface)"
        >
          <option value="all">Todas</option>
          <option value="in-use">Em uso</option>
          <option value="unused">Sem uso</option>
          <option value="dangling">Dangling</option>
        </select>
      </div>

      @if (filtered().length === 0) {
      <app-empty-state
        [icon]="Layers"
        [title]="loading() ? 'Carregando imagens...' : 'Nenhuma imagem encontrada'"
        [description]="
          loading()
            ? 'Buscando informações no Docker daemon.'
            : 'Ajuste o filtro ou faça pull de uma imagem.'
        "
      />
      } @else {
      <div class="space-y-2">
        @for (img of filtered(); track img.id) {
        <app-image-row
          [image]="img"
          (open)="selected.set($event)"
          (action)="onAction(img, $event)"
        />
        }
      </div>
      }
    </section>

    @let sel = selected();
    <app-detail-drawer
      [open]="!!sel"
      [title]="sel ? sel.repository + ':' + sel.tag : ''"
      [subtitle]="sel?.digest ?? null"
      (closed)="selected.set(null)"
    >
      @if (sel) {
      <div class="space-y-5">
        <dl class="space-y-3 text-sm">
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">ID</dt>
            <dd class="col-span-2 font-mono break-all">{{ sel.id }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Repositório</dt>
            <dd class="col-span-2 font-mono">{{ sel.repository }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Tag</dt>
            <dd class="col-span-2 font-mono">{{ sel.tag }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Tamanho</dt>
            <dd class="col-span-2">{{ sel.sizeBytes | bytes }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Criada</dt>
            <dd class="col-span-2">{{ sel.createdAt | relativeDate }}</dd>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <dt style="color: var(--color-fg-muted)">Containers</dt>
            <dd class="col-span-2">
              {{ sel.containerCount }}
              @if (sel.dangling) {
              <span style="color: #b91c1c"> · dangling</span>
              }
            </dd>
          </div>
        </dl>

        <div
          class="grid grid-cols-2 gap-2 border-t pt-4"
          style="border-color: var(--color-border)"
        >
          <button
            type="button"
            (click)="onAction(sel, 'run')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Run container
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'pull')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Pull
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'tag')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Adicionar tag
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'inspect')"
            class="rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            Inspecionar
          </button>
          <button
            type="button"
            (click)="onAction(sel, 'remove')"
            class="col-span-2 rounded-xl px-3 py-2 text-sm font-medium text-white hover:opacity-90 focus-ring"
            style="background: #dc2626"
          >
            Remover imagem
          </button>
        </div>
      </div>
      }
    </app-detail-drawer>
  `,
})
export class ImagesListPage implements OnInit {
  readonly Search = Search;
  readonly Layers = Layers;
  readonly RefreshCw = RefreshCw;

  private readonly service = inject(ImagesService);

  readonly query = signal('');
  readonly usageFilter = signal<UsageFilter>('all');
  readonly selected = signal<DockerImage | null>(null);

  readonly images = signal<DockerImage[]>([]);
  readonly loading = signal(false);

  readonly totalSize = computed(() =>
    this.images().reduce((acc, i) => acc + i.sizeBytes, 0),
  );

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (list) => {
        this.images.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        toast.error('Falha ao carregar imagens', {
          description: err?.message ?? 'Verifique se o backend está rodando.',
        });
      },
    });
  }

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.usageFilter();
    return this.images().filter((img) => {
      if (f === 'in-use' && !img.inUse) return false;
      if (f === 'unused' && (img.inUse || img.dangling)) return false;
      if (f === 'dangling' && !img.dangling) return false;
      if (!q) return true;
      return (
        img.repository.toLowerCase().includes(q) ||
        img.tag.toLowerCase().includes(q) ||
        img.id.toLowerCase().includes(q)
      );
    });
  });

  onAction(image: DockerImage, action: ImageAction): void {
    const labels: Record<ImageAction, string> = {
      pull: 'pull iniciado (em breve)',
      run: 'run container (em breve)',
      tag: 'tag (em breve)',
      inspect: 'inspecionar (em breve)',
      remove: 'remover (em breve)',
    };
    toast(`${image.repository}:${image.tag}: ${labels[action]}`);
  }

  onPull(): void {
    toast('Pull de imagem (em breve)');
  }

  onPrune(): void {
    toast('Prune de imagens dangling (em breve)');
  }
}
