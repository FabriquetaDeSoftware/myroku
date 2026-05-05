import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GitBranch,
  LucideAngularModule,
  Plus,
  Search,
} from 'lucide-angular';
import { GITHUB_REPOS_FIXTURE } from '../../../core/api/fixtures';
import { BuildType, EnvVar, GithubRepo } from '../../../core/api/types';
import { EnvVarRowComponent } from '../../../shared/components/env-var-row/env-var-row.component';

type Step = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-new-app-wizard-page',
  imports: [RouterLink, LucideAngularModule, EnvVarRowComponent],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <a
          routerLink="/apps"
          class="inline-flex items-center gap-1 text-sm hover:underline"
          style="color: var(--color-fg-muted)"
        >
          <lucide-icon [img]="ArrowLeft" class="size-4" />
          Aplicações
        </a>
        <h1 class="text-2xl font-semibold">Nova aplicação</h1>
      </header>

      <!-- Stepper indicator -->
      <ol class="flex items-center gap-3 text-sm">
        @for (s of steps; track s.n) {
        <li class="flex items-center gap-3">
          <span
            class="grid size-7 place-items-center rounded-full text-xs font-semibold"
            [style.background]="
              currentStep() >= s.n
                ? 'var(--color-primary-600)'
                : 'var(--color-surface-muted)'
            "
            [style.color]="
              currentStep() >= s.n ? 'white' : 'var(--color-fg-muted)'
            "
          >
            @if (currentStep() > s.n) {
            <lucide-icon [img]="Check" class="size-3.5" />
            } @else {
            {{ s.n }}
            }
          </span>
          <span
            [style.color]="
              currentStep() === s.n
                ? 'var(--color-fg)'
                : 'var(--color-fg-muted)'
            "
          >
            {{ s.label }}
          </span>
          @if (!$last) {
          <span class="mx-1 h-px w-8" style="background: var(--color-border)"></span>
          }
        </li>
        }
      </ol>

      <!-- Steps content -->
      <div
        class="rounded-2xl border p-6"
        style="border-color: var(--color-border); background: var(--color-surface)"
      >
        @switch (currentStep()) {
        @case (1) {
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">Selecionar repositório</h2>
            <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
              Conta GitHub conectada via PAT.
            </p>
          </div>

          <div
            class="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            style="border-color: var(--color-border)"
          >
            <lucide-icon [img]="Search" class="size-4" style="color: var(--color-fg-muted)" />
            <input
              type="text"
              placeholder="Buscar repositórios..."
              [value]="repoQuery()"
              (input)="repoQuery.set($any($event.target).value)"
              class="flex-1 bg-transparent outline-none"
            />
          </div>

          <ul class="space-y-2">
            @for (r of filteredRepos(); track r.fullName) {
            <li>
              <button
                type="button"
                (click)="selectRepo(r)"
                class="flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:opacity-90 focus-ring"
                [style.border-color]="
                  selectedRepo()?.fullName === r.fullName
                    ? 'var(--color-primary-500)'
                    : 'var(--color-border)'
                "
                [style.background]="
                  selectedRepo()?.fullName === r.fullName
                    ? 'color-mix(in srgb, var(--color-primary-500) 6%, transparent)'
                    : 'transparent'
                "
              >
                <span
                  class="mt-1 grid size-4 place-items-center rounded-full border"
                  [style.border-color]="
                    selectedRepo()?.fullName === r.fullName
                      ? 'var(--color-primary-600)'
                      : 'var(--color-border)'
                  "
                >
                  @if (selectedRepo()?.fullName === r.fullName) {
                  <span
                    class="size-2 rounded-full"
                    style="background: var(--color-primary-600)"
                  ></span>
                  }
                </span>
                <div class="flex-1">
                  <p class="font-mono text-sm">{{ r.fullName }}</p>
                  @if (r.description) {
                  <p class="mt-0.5 text-xs" style="color: var(--color-fg-muted)">
                    {{ r.description }}
                  </p>
                  }
                  <p class="mt-1 text-xs" style="color: var(--color-fg-muted)">
                    {{ r.branches.length }} branches
                  </p>
                </div>
              </button>
            </li>
            }
          </ul>
        </div>
        }
        @case (2) {
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">Configurar build</h2>
            <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
              {{ selectedRepo()?.fullName }}
            </p>
          </div>

          <label class="block">
            <span class="text-xs font-medium" style="color: var(--color-fg-muted)">
              Branch
            </span>
            <select
              [value]="branch()"
              (change)="branch.set($any($event.target).value)"
              class="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              style="border-color: var(--color-border); background: var(--color-surface)"
            >
              @for (b of selectedRepo()?.branches ?? []; track b) {
              <option [value]="b">{{ b }}</option>
              }
            </select>
          </label>

          <div class="space-y-2 text-sm">
            @if (selectedRepo()?.hasDockerfile) {
            <p class="flex items-center gap-2">
              <lucide-icon [img]="Check" class="size-4" style="color: var(--color-primary-600)" />
              Dockerfile detectado em <span class="font-mono">./Dockerfile</span>
            </p>
            }
            @if (selectedRepo()?.hasCompose) {
            <p class="flex items-center gap-2">
              <lucide-icon [img]="Check" class="size-4" style="color: var(--color-primary-600)" />
              <span class="font-mono">docker-compose.yml</span> detectado
            </p>
            }
            @if (!selectedRepo()?.hasDockerfile && !selectedRepo()?.hasCompose) {
            <p style="color: #b91c1c">
              Nenhum Dockerfile ou docker-compose detectado nessa branch.
            </p>
            }
          </div>

          @if (selectedRepo()?.hasDockerfile || selectedRepo()?.hasCompose) {
          <fieldset class="space-y-2">
            <legend class="text-xs font-medium" style="color: var(--color-fg-muted)">
              Tipo de build
            </legend>
            @if (selectedRepo()?.hasDockerfile) {
            <label class="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="buildType"
                value="dockerfile"
                [checked]="buildType() === 'dockerfile'"
                (change)="buildType.set('dockerfile')"
              />
              Dockerfile
            </label>
            }
            @if (selectedRepo()?.hasCompose) {
            <label class="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="buildType"
                value="compose"
                [checked]="buildType() === 'compose'"
                (change)="buildType.set('compose')"
              />
              Docker Compose
            </label>
            }
          </fieldset>
          }
        </div>
        }
        @case (3) {
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">Variáveis de ambiente</h2>
            <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
              Adicione as variáveis necessárias. Você pode editar depois.
            </p>
          </div>

          <div class="space-y-2">
            @for (v of envVars(); track $index) {
            <app-env-var-row
              [envVar]="v"
              (change)="onEnvChange($index, $event)"
              (remove)="onEnvRemove($index)"
            />
            } @if (envVars().length === 0) {
            <p class="text-sm" style="color: var(--color-fg-muted)">
              Nenhuma variável definida.
            </p>
            }
          </div>

          <button
            type="button"
            (click)="addEnv()"
            class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:opacity-80 focus-ring"
            style="border-color: var(--color-border)"
          >
            <lucide-icon [img]="Plus" class="size-4" />
            Adicionar variável
          </button>
        </div>
        }
        @case (4) {
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">Resumo</h2>
            <p class="mt-1 text-sm" style="color: var(--color-fg-muted)">
              Confirme os detalhes e crie a aplicação.
            </p>
          </div>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4 border-b pb-2"
                 style="border-color: var(--color-border)">
              <dt style="color: var(--color-fg-muted)">Repositório</dt>
              <dd class="font-mono">{{ selectedRepo()?.fullName }}</dd>
            </div>
            <div class="flex justify-between gap-4 border-b pb-2"
                 style="border-color: var(--color-border)">
              <dt style="color: var(--color-fg-muted)">Branch</dt>
              <dd class="inline-flex items-center gap-1">
                <lucide-icon [img]="GitBranch" class="size-3" />
                {{ branch() }}
              </dd>
            </div>
            <div class="flex justify-between gap-4 border-b pb-2"
                 style="border-color: var(--color-border)">
              <dt style="color: var(--color-fg-muted)">Tipo de build</dt>
              <dd>{{ buildType() }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt style="color: var(--color-fg-muted)">Variáveis</dt>
              <dd>{{ envVars().length }} definidas</dd>
            </div>
          </dl>
        </div>
        }
        }
      </div>

      <!-- Navigation -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          (click)="prev()"
          [disabled]="currentStep() === 1"
          class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80 focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          style="border-color: var(--color-border)"
        >
          <lucide-icon [img]="ArrowLeft" class="size-4" />
          Voltar
        </button>

        @if (currentStep() < 4) {
        <button
          type="button"
          (click)="next()"
          [disabled]="!canAdvance()"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          style="background: var(--color-primary-600)"
        >
          Próximo
          <lucide-icon [img]="ArrowRight" class="size-4" />
        </button>
        } @else {
        <button
          type="button"
          (click)="submit()"
          class="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-ring"
          style="background: var(--color-primary-600)"
        >
          Criar e fazer primeiro deploy
          <lucide-icon [img]="Check" class="size-4" />
        </button>
        }
      </div>
    </section>
  `,
})
export class NewAppWizardPage {
  private readonly router = inject(Router);

  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  readonly Check = Check;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly GitBranch = GitBranch;

  readonly steps: { n: Step; label: string }[] = [
    { n: 1, label: 'Repositório' },
    { n: 2, label: 'Build' },
    { n: 3, label: 'Env vars' },
    { n: 4, label: 'Resumo' },
  ];

  readonly currentStep = signal<Step>(1);
  readonly repoQuery = signal('');
  readonly selectedRepo = signal<GithubRepo | null>(null);
  readonly branch = signal('');
  readonly buildType = signal<BuildType>('dockerfile');
  readonly envVars = signal<EnvVar[]>([]);

  readonly filteredRepos = computed(() => {
    const q = this.repoQuery().trim().toLowerCase();
    if (!q) return GITHUB_REPOS_FIXTURE;
    return GITHUB_REPOS_FIXTURE.filter((r) =>
      r.fullName.toLowerCase().includes(q),
    );
  });

  readonly canAdvance = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return this.selectedRepo() !== null;
      case 2: {
        const r = this.selectedRepo();
        return (
          !!r &&
          this.branch() !== '' &&
          (r.hasDockerfile || r.hasCompose)
        );
      }
      case 3:
        return true;
      default:
        return true;
    }
  });

  selectRepo(repo: GithubRepo): void {
    this.selectedRepo.set(repo);
    this.branch.set(repo.defaultBranch);
    this.buildType.set(repo.hasDockerfile ? 'dockerfile' : 'compose');
  }

  next(): void {
    if (!this.canAdvance()) return;
    this.currentStep.update((s) => Math.min(4, s + 1) as Step);
  }

  prev(): void {
    this.currentStep.update((s) => Math.max(1, s - 1) as Step);
  }

  addEnv(): void {
    this.envVars.update((arr) => [
      ...arr,
      { key: '', value: '', isSecret: false },
    ]);
  }

  onEnvChange(index: number, next: EnvVar): void {
    this.envVars.update((arr) => arr.map((v, i) => (i === index ? next : v)));
  }

  onEnvRemove(index: number): void {
    this.envVars.update((arr) => arr.filter((_, i) => i !== index));
  }

  submit(): void {
    toast.success(
      `Aplicação ${this.selectedRepo()?.fullName} criada. Deploy inicial enfileirado.`,
    );
    void this.router.navigateByUrl('/apps');
  }
}
