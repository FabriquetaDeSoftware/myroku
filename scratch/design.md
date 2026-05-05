# Myroku — Design System & Plano de UI

> Documento de design para o frontend do Myroku, baseado nas referências visuais (CRM com paleta verde esmeralda, navbar com Ctrl+K, hero gradient, stat cards, sidebar deslizante de módulos) e nos fluxos definidos em [scratch.md](scratch.md).

---

## 1. Princípios

1. **Minimalismo funcional** — toda informação visível precisa servir uma decisão (deploy? restart? abrir logs?).
2. **Realtime first** — status, logs, métricas são streams. Loading clássico só para a primeira pintura.
3. **Tailwind no centro** — sem CSS-in-JS, sem temas paralelos. Tudo é utility-first sobre tokens semânticos.
4. **Headless > opinionated** — componentes são "seus" (estilo shadcn). Sem batalha contra estilos de libs.
5. **Acessibilidade nativa** — Angular CDK garante foco, roles, navegação por teclado em todos os overlays.
6. **Responsivo em três breakpoints**: `sm` (mobile, leitura), `md` (tablet, monitoramento), `lg+` (operação real).

---

## 2. Stack de UI

| Categoria | Lib | Versão alvo | Justificativa |
|---|---|---|---|
| Framework | **Angular 21 (standalone)** | já configurado | Signals, Control Flow, SSR, hidratação. |
| CSS | **Tailwind CSS v4** | já configurado | Utility-first, dark mode via classe, tokens via `@theme`. |
| Primitivos headless | **Angular CDK** | `^21` | Overlay, Portal, Dialog, A11y, DragDrop, VirtualScroll, Stepper. |
| Componentes | **Spartan UI** (`@spartan-ng/ui-*`) | latest | shadcn-style sobre CDK + Tailwind. Cards, Dialog, Command, Sheet, Tabs, Toast, Tooltip — todos cópia-customiza. |
| Ícones | **lucide-angular** | latest | Estética coerente com as referências. |
| Charts | **ApexCharts** (`ng-apexcharts`) | latest | Bars, lines, donut com animações suaves. Bate com o look da imagem 1. |
| Tabelas | **CDK Table + Tailwind** (custom) | nativo | Listas do Myroku são pequenas (apps, deploys, containers). AG Grid seria overkill. |
| Toasts | **ngx-sonner** | latest | Sucessor visual do toastr. Stack inteligente, pausável. |
| Estado | **Signals + `@ngrx/signals`** | latest | Padrão Angular 21. Stores pequenos por feature. |
| Forms | **Reactive Forms** | nativo | — |
| WebSocket | **`rxjs/webSocket`** | nativo | Retry, backpressure via operators. |
| Logs viewer | **xterm.js** (wrapper próprio) | `^5` | Padrão de fato para terminais web; suporta ANSI colors do Docker. |
| Highlight (Dockerfile, YAML, env) | **shiki** | latest | Estado da arte; mesmo engine do VS Code. |
| Datas | **date-fns** | latest | Leve, idiomático, tree-shakeable. |
| i18n (futuro) | **@ngx-translate/core** | latest | Padrão da comunidade. |

> **Descartados**: Angular Material (Material Design diverge da referência), PrimeNG (tema próprio pesado), NgRx clássico (overkill para o escopo), ngx-toastr (sonner é o novo padrão).

---

## 3. Direção visual

### 3.1 Paleta

Tokens semânticos via `@theme` do Tailwind v4 (em `src/styles.css`):

```css
@theme {
  --color-primary-50:  #ecfdf5;
  --color-primary-500: #10b981;  /* emerald-500 — primário das refs */
  --color-primary-600: #059669;  /* hover, focus rings */
  --color-primary-700: #047857;  /* gradient stop, hero */

  --color-surface:        #ffffff;
  --color-surface-muted:  #f8fafc; /* zinc-50 */
  --color-border:         #e4e4e7; /* zinc-200 */
  --color-fg:             #0a0a0a; /* zinc-950 */
  --color-fg-muted:       #71717a; /* zinc-500 */

  /* Status semânticos */
  --color-status-running:   #10b981;  /* green */
  --color-status-stopped:   #71717a;  /* zinc */
  --color-status-failed:    #ef4444;  /* red */
  --color-status-pending:   #f59e0b;  /* amber */
  --color-status-building:  #3b82f6;  /* blue */
  --color-status-queued:    #a855f7;  /* purple */
}

.dark {
  --color-surface:        #0a0a0a;
  --color-surface-muted:  #18181b;
  --color-border:         #27272a;
  --color-fg:             #fafafa;
  --color-fg-muted:       #a1a1aa;
}
```

### 3.2 Tipografia

- **Sans** (UI): `Inter` via `@fontsource/inter` (variável). Pesos 400, 500, 600, 700.
- **Mono** (logs, hashes, IDs, env values): `JetBrains Mono` via `@fontsource/jetbrains-mono`.

Escala (Tailwind defaults adaptados):

| Token | Tamanho | Uso |
|---|---|---|
| `text-xs` | 12px | Badges, captions, timestamps |
| `text-sm` | 14px | Corpo padrão da UI |
| `text-base` | 16px | Conteúdo de leitura |
| `text-lg` | 18px | Título de card |
| `text-2xl` | 24px | Título de página |
| `text-4xl` | 36px | Valor grande do StatCard |
| `text-5xl` | 48px | Hero title |

### 3.3 Espaçamento, raios, sombras

- **Espaçamento base**: 4px (Tailwind default). Densidade média (`p-4` em cards, `gap-6` em grids).
- **Raios**: `rounded-2xl` (16px) em cards e hero; `rounded-xl` (12px) em inputs e botões; `rounded-lg` em badges; `rounded-full` em status dots e avatars.
- **Sombras**: `shadow-sm` default em cards; `shadow-md` em overlays e dropdowns; `shadow-lg` em dialogs e command palette.

### 3.4 Hero gradient

Igual à imagem 1 — usado no topo do Dashboard e em headers de "primeira execução":

```html
<section class="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-white">
  <p class="text-xs uppercase tracking-wider opacity-80">Dashboard</p>
  <h1 class="text-4xl font-semibold mt-1">Visão geral</h1>
  <p class="text-sm opacity-90 mt-1">domingo, 03 de maio de 2026</p>
  <div class="absolute top-4 right-4 ...">[date picker]</div>
</section>
```

### 3.5 Dark mode

Estratégia `class="dark"` (Tailwind v4). Toggle no painel de Módulos & Configurações. Detecta `prefers-color-scheme` na primeira visita. Persistido em `localStorage` via service `core/theme.ts`.

---

## 4. Sistema de layout

### 4.1 Shell global

```
┌─────────────────────────────────────────────────────────────────┐
│ [MY] Myroku    Dashboard  Apps  Containers  Deploys   [⌕ Buscar… ⌘K] [▦] [⚙] [⏻] │  ← Topbar (sticky)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      [router-outlet]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Componentes:

- `LayoutShellComponent` — wrapper raiz, monta topbar + outlet + slots de overlays globais.
- `TopbarComponent` — logo, menu, search trigger, ações.
- `CommandPaletteComponent` — overlay global Ctrl+K (CDK Overlay + spartan command).
- `ModulesPanelComponent` — sheet à direita (CDK Overlay + animação slide-in).
- `ToastHostComponent` — `ngx-sonner` mount point.

A sidebar lateral mencionada em [scratch.md:7.1](scratch.md#L491) **não** será usada — a referência (imagem 1) usa apenas topbar, o que é mais limpo e libera mais largura para logs e tabelas.

### 4.2 Topbar — anatomia

```
┌──┬──────┬───────────────────────────────────┬──────────────┬───┬───┬───┐
│OR│ Org  │ Dashboard | Apps | Containers ... │ ⌕ Buscar  ⌘K │ ▦ │ ⚙ │ ⏻ │
└──┴──────┴───────────────────────────────────┴──────────────┴───┴───┴───┘
```

- **Brand chip** (esquerda): badge quadrado + nome do servidor (`myroku.local` ou hostname configurável).
- **Nav links**: ícone + label, indicador `border-bottom` emerald-500 no ativo.
- **Search trigger**: input fake (botão estilizado) que abre Command Palette. Mostra `⌘K` / `Ctrl+K` à direita.
- **Ações**: grid (módulos), avatar/profile (futuro auth), exit (logout — placeholder hoje).

### 4.3 Command Palette (⌘K / Ctrl+K)

Replica imagem 2. Spartan `<hlm-command>` com seções:

| Seção | Itens |
|---|---|
| **Navegar** | Dashboard, Apps, Containers, Deploys, Settings |
| **Aplicações** | Cada app cadastrada → ir para detalhe |
| **Ações** | Deploy `<app>`, Restart `<container>`, Ver logs `<app>`, Nova aplicação |
| **GitHub** | Listar repos, sincronizar webhooks |

Atalhos no rodapé: `↑↓ navegar`, `↵ abrir`, `⌘K alternar`, `esc fechar`.

Implementação: `core/command-bus.ts` é um `signal store` com lista de comandos registrados pelas features (cada feature registra os seus na inicialização). Suporta busca fuzzy (filtro client-side; `fuse.js` se ficar lento).

### 4.4 Painel de Módulos & Configurações

Replica imagem 3. Sheet à direita (450px), abre via botão grid `▦` da topbar.

```
┌── Módulos & Configurações ──────────── Fechar ──┐
│                                                  │
│  ▦ Organizações  (placeholder — single-tenant)   │
│  📣 Broadcasts   (notificações de deploy — F4)   │
│                                                  │
│  ── Geral ──                                     │
│  👥 Times                                        │
│  👤 Usuários                                     │
│  🛡 Perfis                                       │
│  ⚡ Reverse Proxy        (Fase 4)                │
│                                                  │
│  ── Integração ──                                │
│  ⌥ GitHub  ▼                                     │
│      • PAT                                       │
│      • Webhooks                                  │
│  💬 WhatsApp / Discord  (futuro)                 │
│                                                  │
│  ── Operação ──                                  │
│  📦 Backup               (Fase 4)                │
│  🤖 Assistente IA        (futuro)                │
│  ⚙ Sistema  ▼                                    │
│      • Tema (light/dark)                         │
│      • Versão & uptime                           │
│      • Health check                              │
└──────────────────────────────────────────────────┘
```

Cada item é uma `<button>` que navega para `/settings/<slug>` ou abre um sub-painel inline.

---

## 5. Catálogo de telas

Cada tela mapeia para fluxos de [scratch.md §4](scratch.md) e endpoints de [scratch.md §6](scratch.md).

### 5.1 Dashboard `/`

**Inspiração direta**: imagem 1.

**Estrutura**:

```
┌────────────────────────────────────────────────────────────┐
│ [Hero gradient: "Visão geral", data, date picker]          │
├────────────────────────────────────────────────────────────┤
│ [StatCard×6: Total Apps │ Running │ Stopped │ Pending      │
│   │ Deploys hoje │ Deploys falhos]                         │
├────────────────────────────────────────────────────────────┤
│ [Chart: Deploys por hora (24h)]  [Donut: status containers]│
├────────────────────────────────────────────────────────────┤
│ [Lista de apps recentes — AppRow×N]                        │
└────────────────────────────────────────────────────────────┘
```

**Endpoints**: `GET /api/apps`, `GET /api/containers`, `GET /api/deployments?recent=true`.

**Estados**:
- *Loading*: skeleton dos StatCards + spinner em chart.
- *Empty* (zero apps): hero CTA grande "Conectar GitHub e criar primeira aplicação".
- *Error*: banner com retry.

**Realtime**: assina `/ws/events` para atualizar contadores e status sem refetch.

### 5.2 Apps `/apps`

Lista global de aplicações ([scratch.md:7.2](scratch.md)).

**Estrutura**:

```
┌────────────────────────────────────────────────────────────┐
│  Aplicações                            [+ Nova Aplicação]  │
│  [busca…]  [filtro: status v]  [ordenar: nome v]           │
├────────────────────────────────────────────────────────────┤
│  AppRow → status, nome, repo, branch, último deploy, ações │
│  AppRow                                                    │
│  AppRow                                                    │
└────────────────────────────────────────────────────────────┘
```

**Componente principal**: `AppRow` (ver §6).

**Endpoint**: `GET /api/apps`.

### 5.3 Nova Aplicação `/apps/new` (Wizard)

Stepper de 4 passos ([scratch.md:7.4](scratch.md)). CDK Stepper customizado.

| Passo | Conteúdo | Endpoint |
|---|---|---|
| 1. Repositório | Lista de repos do PAT, busca, seleção single | `GET /api/github/repos` |
| 2. Build | Branch select, detecção Dockerfile/compose, escolha do tipo | `GET /api/github/repos/:owner/:repo/branches`, `GET /api/github/repos/:owner/:repo/check` |
| 3. Env Vars | Editor de chave/valor, toggle secret | — (in-memory) |
| 4. Resumo | Recap + botão "Criar e fazer primeiro deploy" | `POST /api/apps` |

**Estados** por passo: validação inline, botão "Próximo" desabilita até válido. No passo 2, se `check` retornar nada, mostrar erro acionável: "Nenhum Dockerfile ou docker-compose detectado em `<branch>`. [Trocar branch] [Cancelar]".

### 5.4 App Detail `/apps/:id`

Tabs ([scratch.md:7.3](scratch.md)). Spartan `<hlm-tabs>`.

**Header fixo**:

```
← Apps / my-api                                ● running
repo/my-api • main • commit a1b2c3d
[Deploy now] [Restart] [Stop]            [⋯ menu: Settings, Delete]
```

**Tabs**:

| Tab | Conteúdo principal | Componentes |
|---|---|---|
| Overview | Status atual, métricas, último deploy, health | `StatusBadge`, `HealthCheckBadge`, `MetricSparkline` |
| Deploys | Tabela paginada de deploys + filtro | `DeployRow` |
| Logs | Stream em tempo real do container | `LogViewer` (xterm.js) |
| Env Vars | Editor com cifragem | `EnvVarRow` |
| Processes | Tabela `docker top` | `ProcessRow` |
| Settings | Forms de configuração | Reactive Forms |

**Realtime** em Logs e Overview (métricas) via `/ws/apps/:id/logs` e `/ws/events`.

### 5.5 Deploy Detail `/deployments/:id`

Página dedicada ao deploy específico. Crítica durante deploy em andamento.

```
┌────────────────────────────────────────────────────────────┐
│ Deploy #42 · my-api                       ● building       │
│ commit a1b2c3d "fix: ..." · iniciado há 12s                │
├────────────────────────────────────────────────────────────┤
│ [Timeline: queued → building → deploying → success/failed] │
├────────────────────────────────────────────────────────────┤
│ [LogViewer — log do build em tempo real]                   │
│                                                            │
│ Step 1/8: Cloning repository...                            │
│ Step 2/8: Building image my-api:deploy-42...               │
│ ...                                                        │
└────────────────────────────────────────────────────────────┘
```

**Endpoints**: `GET /api/deployments/:id`, WS `/ws/deployments/:id/logs`.

**Ações**: se `failed`, botão **[Rollback para #41]** (chama `POST /api/deployments/:id/rollback` no deploy anterior bem-sucedido).

### 5.6 Containers `/containers`

Lista global ([scratch.md:7.5](scratch.md)).

**Estrutura**: tabela com filtros por app e status. Cada linha é `ContainerRow`. Menu `⋯` por linha: Restart, Stop, Kill, Logs (deeplink), Inspect (modal).

**Endpoints**: `GET /api/containers`, `POST /api/containers/:id/{start,stop,restart,kill}`.

**Realtime**: `/ws/events` para mudanças de status.

### 5.7 Settings `/settings/*`

Sub-rotas (alimentadas pelo Painel de Módulos):

- `/settings/github` — PAT, status da conexão, botão "Test connection" ([scratch.md:7.6](scratch.md)).
- `/settings/server` — paths, hostname, info read-only.
- `/settings/system` — versão, uptime, health, tema.

Forms simples, save inline com toast de confirmação.

---

## 6. Componentes reutilizáveis

Localizados em `src/app/shared/components/`.

| Componente | Props/Inputs | Eventos | Onde aparece |
|---|---|---|---|
| `StatCard` | `label`, `value`, `delta`, `icon`, `tone` | — | Dashboard |
| `AppRow` | `app: Application` | `(open)`, `(deploy)`, `(restart)` | `/apps`, Dashboard |
| `AppCard` | `app: Application` | idem | (alternativa em grid) |
| `StatusBadge` | `status: 'running'\|'stopped'\|...` | — | Onipresente |
| `HealthCheckBadge` | `type`, `value` | — | App Overview, Settings |
| `DeployRow` | `deployment: Deployment` | `(open)`, `(rollback)` | App Deploys, Deploy Detail |
| `DeployTimeline` | `steps: DeployStep[]`, `current` | — | Deploy Detail |
| `LogViewer` | `source: Observable<LogChunk>`, `follow` | `(pause)`, `(clear)`, `(download)` | App Logs, Deploy Detail |
| `EnvVarRow` | `envVar: EnvVar` | `(open)`, `(change)`, `(remove)` | App Env Vars, Wizard |
| `ContainerRow` | `container: Container` | `(open)`, `(action)` | `/containers`, Dashboard |
| `ProcessRow` | `pid`, `user`, `cpu`, `mem`, `cmd` | — | App Processes |
| `MetricSparkline` | `data: number[]`, `tone` | — | App Overview |
| `EmptyState` | `icon`, `title`, `description`, `action` | — | Listas vazias |
| `ConfirmDialog` | `title`, `description`, `tone: 'danger'\|'default'` | `(confirm)` | Delete app, Kill container |
| `DetailDrawer` | `open`, `title`, `subtitle`, `pageHref`, `pageLabel` | `(closed)` | Toda listagem (regra obrigatória — §7.7) |
| `Stepper` (CDK) | passos do wizard | `(complete)` | Nova Aplicação |
| `CommandPalette` | — | — | Global (Ctrl+K) |
| `ModulesPanel` | — | — | Global (botão ▦) |

### 6.1 StatCard — anatomia

```html
<article class="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
  <header class="flex items-center justify-between">
    <span class="text-xs font-medium uppercase tracking-wider text-zinc-500">{{ label }}</span>
    <span class="rounded-lg bg-zinc-100 p-1.5 dark:bg-zinc-900">
      <ng-icon [name]="icon" class="text-zinc-600" />
    </span>
  </header>
  <div class="mt-3 flex items-end justify-between">
    <span class="text-4xl font-semibold tabular-nums">{{ value }}</span>
    <span [class]="deltaClass" class="rounded-md px-2 py-0.5 text-xs font-medium">
      {{ delta }}
    </span>
  </div>
</article>
```

`deltaClass` é computado: positivo → `bg-emerald-50 text-emerald-700`, negativo → `bg-red-50 text-red-700`.

### 6.2 LogViewer — comportamento

- Stream consumido via `Observable<LogChunk>` (chunk = `{ts, stream: 'stdout'|'stderr', line}`).
- Renderiza com **xterm.js** para preservar cores ANSI.
- Auto-scroll quando no final; pausa o auto-scroll se o usuário rolar para cima (UX padrão de terminal).
- Ações: `[● live]`/`[pause]`, `[clear]` (limpa tela, não derruba conexão), `[download]` (baixa últimas N linhas).
- Filtro: input texto (regex opcional) + checkbox "stderr only".

### 6.3 StatusBadge — tabela de cores

| Status | Cor de fundo | Cor de texto | Ícone |
|---|---|---|---|
| `running` | `emerald-50` | `emerald-700` | `play` |
| `stopped` | `zinc-100` | `zinc-700` | `square` |
| `failed` | `red-50` | `red-700` | `x` |
| `queued` | `purple-50` | `purple-700` | `clock` |
| `building` | `blue-50` | `blue-700` | `hammer` |
| `deploying` | `blue-50` | `blue-700` (spin) | `loader-2` |
| `success` | `emerald-50` | `emerald-700` | `check` |
| `rolled_back` | `amber-50` | `amber-700` | `undo-2` |

---

## 7. Padrões de interação

### 7.1 Loading

- **First paint**: skeletons (`<hlm-skeleton>`) com mesmas dimensões dos componentes finais. Sem spinners genéricos.
- **Refetch silencioso**: barra de progresso fina no topo (estilo NProgress) — `core/loading-indicator.ts`.
- **Botões em ação**: spinner inline + label muda ("Deploying…"). Botão fica `disabled`.

### 7.2 Empty states

Toda lista vazia mostra `EmptyState` com:
- Ícone temático (ex: `package` para apps, `box` para containers).
- Título curto ("Nenhuma aplicação ainda").
- Descrição acionável ("Conecte um repositório do GitHub para criar sua primeira aplicação.").
- Botão CTA primário.

### 7.3 Erros

- **Validação inline** em forms (Reactive Forms + mensagens próximas do campo).
- **Erros de API**: toast `ngx-sonner` (tipo `error`) + retry button quando aplicável.
- **Erros catastróficos** (WebSocket caiu): banner persistente no topo com `[Reconectar]`.

### 7.4 Realtime

- WebSocket centralizado em `core/realtime.ts` (singleton).
- Reconexão automática com backoff exponencial (1s, 2s, 4s, 8s, max 30s).
- Cada feature subscribe filtrando por canal (`/ws/apps/:id/logs`, `/ws/events`, etc.).
- Buffer in-memory das últimas 500 linhas por stream para reconectar sem perder contexto.

### 7.5 Navegação por teclado

- `⌘K` / `Ctrl+K` → Command Palette (global).
- `g d` → Dashboard, `g a` → Apps, `g c` → Containers, `g s` → Settings (sequência tipo Linear).
- `?` → modal com cheatsheet dos atalhos.
- Foco visível: `focus-visible:ring-2 ring-emerald-500/50`.

### 7.6 Confirmações destrutivas

Operações irreversíveis (`Delete app`, `Kill container`, `Rollback`) abrem `ConfirmDialog` com:
- Tom vermelho.
- Frase explícita: "Esta ação não pode ser desfeita."
- Para deletes de app: input de confirmação ("digite o nome da app para confirmar").

### 7.7 Listagem com drawer (obrigatório)

Toda listagem de itens no produto **deve** seguir este padrão. Não é opcional — é a regra base de descoberta de informação.

**Regras**:

1. **Row clicável inteira**: a row recebe `role="button"`, `tabindex="0"`, e handlers `(click)`, `(keydown.enter)`, `(keydown.space)` que emitem o output `(open)` com o item completo.
2. **Drawer à direita**: o clique abre `DetailDrawerComponent` deslizando da direita (`translateX 100% → 0`, 200ms ease-out) com backdrop `bg-black/40 backdrop-blur-sm`.
3. **Botão de página dentro do drawer**: se a entidade possui rota de detalhe própria, o drawer recebe `[pageHref]` e exibe um botão primário no rodapé que navega para essa rota. Listagens cujas entidades não têm página dedicada (ex.: containers, env vars) omitem `pageHref` — sem botão.
4. **stopPropagation em ações internas**: qualquer botão/menu dentro da row chama `$event.stopPropagation()` antes de emitir sua ação, para não disparar a abertura do drawer.
5. **Fechamento**: `ESC`, clique no backdrop ou clique no botão X do header chamam `(closed)`. Foco preso no drawer via `cdkTrapFocus`.
6. **Sem atalhos de navegação direta na row**: a antiga seta-para-detalhe foi removida — a navegação para a página flui via drawer → botão.

**Caso especial — rows com inputs editáveis (env vars)**:
- Mantêm a edição inline.
- Inputs e botões internos usam `(click)="$event.stopPropagation()"` para que o foco no input não acione o drawer.
- Um ícone visível (ex.: `ChevronRight` ou similar) sinaliza a affordance de "abrir detalhes".
- O drawer oferece edição "rica" (textarea para valores longos, toggle de secret claro, ações destrutivas isoladas).

**Componentes envolvidos**:
- [`DetailDrawerComponent`](apps/frontend/ui/src/app/shared/components/detail-drawer/detail-drawer.component.ts) — primitivo reutilizável.
- Cada `*-row.component.ts` em `shared/components/` — todas emitem `(open)`.
- Cada `*-list.page.ts` (e tabs análogas) — gerenciam `selected = signal<T | null>(null)` e renderizam `<app-detail-drawer>` no fim do template.

**Checklist para criar uma nova listagem**:
- [ ] Row tem `role=button`, `tabindex=0`, handlers de click + keyboard, output `(open)`.
- [ ] Página/tab tem signal `selected`, listeners `(open)` e `(closed)`.
- [ ] Drawer recebe `title`, `subtitle` opcional, `pageHref` se aplicável, `pageLabel` traduzido.
- [ ] Body do drawer mostra os campos relevantes da entidade + ações disponíveis.
- [ ] Botões internos da row têm `$event.stopPropagation()`.

---

## 8. Estrutura de pastas Angular

```
apps/frontend/ui/src/app/
├── core/
│   ├── api/                   # HTTP clients tipados (apps, deploys, github, ...)
│   ├── realtime/              # WebSocket singleton + canais
│   ├── command-bus/           # Registry de comandos do Ctrl+K
│   ├── theme/                 # light/dark, persistência
│   ├── loading-indicator/     # progress bar global
│   └── error-handler/         # interceptor + toast bridge
├── shared/
│   ├── ui/                    # primitivos Spartan customizados
│   │   ├── button/
│   │   ├── card/
│   │   ├── dialog/
│   │   ├── input/
│   │   ├── tabs/
│   │   └── ...
│   ├── components/            # StatCard, AppRow, LogViewer, EnvVarRow, ...
│   ├── pipes/                 # relativeDate, bytes, ms, mask
│   └── directives/            # autofocus, copyToClipboard
├── features/
│   ├── dashboard/
│   │   ├── dashboard.page.ts
│   │   ├── dashboard.page.html
│   │   └── dashboard.store.ts
│   ├── apps/
│   │   ├── list/
│   │   ├── new-wizard/
│   │   └── detail/
│   │       └── tabs/
│   │           ├── overview/
│   │           ├── deploys/
│   │           ├── logs/
│   │           ├── env/
│   │           ├── processes/
│   │           └── settings/
│   ├── containers/
│   ├── deployments/
│   │   └── detail/
│   └── settings/
│       ├── github/
│       ├── server/
│       └── system/
├── layout/
│   ├── shell/
│   ├── topbar/
│   ├── command-palette/
│   └── modules-panel/
├── app.config.ts
├── app.routes.ts
└── app.ts
```

### 8.1 Convenções

- Arquivos por componente: `name.page.ts` (rota), `name.component.ts` (reutilizável), `name.store.ts` (signal store da feature).
- Lazy loading: cada feature carregada via `loadComponent` no `app.routes.ts`.
- Templates inline só em componentes triviais (≤ 20 linhas). Caso contrário, `.html` separado.
- Estilos via Tailwind no template; `.css` por componente apenas para casos extremos (animações complexas).

---

## 9. Roadmap visual (alinhado com [scratch.md §10](scratch.md))

### Fase 0–1 — Backend (sem UI)
- Apenas página de health no frontend (`/health` consome `GET /api/settings/health`).

### Fase 2 — UI Mínima (3 semanas)

Sprint 1 — Fundação:
- [ ] Setup do design system: tokens em `styles.css`, fontes, dark mode toggle.
- [ ] Spartan UI install + primitivos copiados (`button`, `card`, `dialog`, `tabs`, `input`, `command`, `sheet`, `skeleton`).
- [ ] `LayoutShellComponent` + `TopbarComponent`.
- [ ] `CommandPaletteComponent` esqueleto (só navegação).
- [ ] `ModulesPanelComponent` esqueleto.
- [ ] `core/api`, `core/realtime`, `core/theme`.

Sprint 2 — Core flows:
- [ ] Dashboard (StatCards + lista de apps recentes; charts placeholder).
- [ ] Apps list + AppRow.
- [ ] Wizard Nova Aplicação (CDK Stepper).
- [ ] App Detail (tabs Overview, Env Vars, Settings).
- [ ] Confirmações destrutivas.

Sprint 3 — Logs e operação:
- [ ] LogViewer com xterm.js.
- [ ] Tab Logs + Deploy Detail com log streaming.
- [ ] Tab Deploys (lista + rollback).
- [ ] Containers list + ações.
- [ ] Settings (GitHub PAT, server, system).
- [ ] Toasts via ngx-sonner.

### Fase 3 — Compose & Robustez
- [ ] Charts ApexCharts no Dashboard (deploys/hora, donut de status).
- [ ] MetricSparkline em App Overview.
- [ ] Tab Processes (`docker top`).
- [ ] Reconexão WS visível + banner de erro persistente.
- [ ] Empty states polidos com ilustrações simples.

### Fase 4 — Conforto
- [ ] Atalhos de teclado completos (`g d`, `g a`, ...).
- [ ] Dark mode polido (revisão de contraste).
- [ ] Animações finais (Framer Motion equivalente no Angular: animate.css ou @angular/animations).
- [ ] Notificações broadcast (slide-in canto inferior).
- [ ] Cheatsheet `?`.
- [ ] i18n via `@ngx-translate` (PT-BR padrão, EN secundário).

---

## 10. Cross-reference com [scratch.md](scratch.md)

| scratch.md | Equivalente neste design |
|---|---|
| §3.2 — Estrutura de pastas frontend | §8 deste doc (refinada) |
| §4.1 — Cadastro de aplicação | §5.3 (Wizard) |
| §4.2 — Deploy via webhook | §5.5 (Deploy Detail) — UI observa o fluxo, backend executa |
| §4.4 — Logs em tempo real | §6.2 (LogViewer) + §7.4 (Realtime) |
| §4.5 — Containers | §5.6 |
| §4.6 — Env Vars | §5.4 (tab) — UI sinaliza "aplicar requer redeploy" via banner |
| §5 — Modelo de dados | Tipos em `core/api/*.types.ts` espelham as entidades |
| §6 — Endpoints | Mapeados em cada tela do §5 deste doc |
| §7 — Wireframes | §5 deste doc, refinado e com componentes nomeados |
| §10 — Roadmap | §9 deste doc |
| §11.6 — Segurança/auth-stub | `core/api` com interceptor preparado para inserir `Authorization` futuramente |

---

## 11. Próximos passos práticos

1. **Aprovar este documento** e ajustar pontos divergentes.
2. **Sprint 1** (Fase 2): instalar dependências e montar shell:
   ```bash
   npm i @angular/cdk lucide-angular ng-apexcharts ngx-sonner @ngrx/signals date-fns
   npx nx g @spartan-ng/cli:ui  # ou seguir docs do Spartan para Angular 21
   npm i @fontsource-variable/inter @fontsource-variable/jetbrains-mono
   npm i xterm  # para LogViewer (Fase 2 Sprint 3)
   ```
3. **Validar visualmente** o `LayoutShellComponent` antes de avançar — se a topbar não estiver alinhada com a referência, todo o resto sai errado.
4. **Backend mock** (json-server ou stubs no Go) para destravar o frontend antes da API real estar pronta.

---

*Documento vivo — atualize conforme o produto evoluir.*
