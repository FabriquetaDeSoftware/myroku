import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { Download, LucideAngularModule, Pause, Play, Trash2 } from 'lucide-angular';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-log-viewer',
  imports: [LucideAngularModule],
  template: `
    <div
      class="overflow-hidden rounded-2xl border"
      style="border-color: var(--color-border); background: #0a0a0a"
    >
      <header
        class="flex items-center gap-2 border-b px-3 py-2 text-xs"
        style="border-color: #27272a; color: #a1a1aa; background: #18181b"
      >
        <span
          class="size-2 rounded-full"
          [style.background]="streaming() ? '#10b981' : '#71717a'"
        ></span>
        <span>{{ streaming() ? 'live' : 'pausado' }}</span>
        <span class="ml-auto flex items-center gap-1">
          <button
            type="button"
            (click)="toggle()"
            class="rounded p-1 hover:bg-white/10 focus-ring"
            [attr.aria-label]="streaming() ? 'Pausar' : 'Retomar'"
          >
            <lucide-icon [img]="streaming() ? Pause : Play" class="size-4" />
          </button>
          <button
            type="button"
            (click)="clear()"
            class="rounded p-1 hover:bg-white/10 focus-ring"
            aria-label="Limpar"
          >
            <lucide-icon [img]="Trash2" class="size-4" />
          </button>
          <button
            type="button"
            (click)="download()"
            class="rounded p-1 hover:bg-white/10 focus-ring"
            aria-label="Baixar"
          >
            <lucide-icon [img]="Download" class="size-4" />
          </button>
        </span>
      </header>
      <div #terminal class="h-80 w-full"></div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .xterm-viewport {
        background: transparent !important;
      }
    `,
  ],
})
export class LogViewerComponent implements AfterViewInit, OnDestroy {
  /** Linhas pré-existentes para popular o terminal na montagem. */
  readonly seed = input<string[]>([]);
  /** Se true, gera linhas fake periodicamente para simular stream. */
  readonly autoStream = input<boolean>(true);

  readonly terminalRef =
    viewChild.required<ElementRef<HTMLDivElement>>('terminal');

  readonly streaming = signal(true);
  readonly Pause = Pause;
  readonly Play = Play;
  readonly Trash2 = Trash2;
  readonly Download = Download;

  private term?: Terminal;
  private fitAddon?: FitAddon;
  private subscription?: Subscription;
  private buffer: string[] = [];

  constructor() {
    effect(() => {
      // re-render seed se o input mudar
      const seed = this.seed();
      if (this.term) this.renderSeed(seed);
    });
  }

  ngAfterViewInit(): void {
    this.term = new Terminal({
      fontFamily:
        '"JetBrains Mono Variable", ui-monospace, monospace',
      fontSize: 12,
      theme: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        cursor: '#10b981',
      },
      convertEol: true,
      disableStdin: true,
      cursorBlink: false,
    });
    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.open(this.terminalRef().nativeElement);

    queueMicrotask(() => this.fitAddon?.fit());
    this.renderSeed(this.seed());

    if (this.autoStream()) {
      this.startFakeStream();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.fitAddon?.fit();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.term?.dispose();
  }

  toggle(): void {
    this.streaming.update((s) => !s);
    if (!this.streaming()) {
      this.subscription?.unsubscribe();
      this.subscription = undefined;
    } else if (this.autoStream()) {
      this.startFakeStream();
    }
  }

  clear(): void {
    this.term?.clear();
    this.buffer = [];
  }

  download(): void {
    const blob = new Blob([this.buffer.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myroku-logs-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private renderSeed(lines: string[]): void {
    if (!this.term) return;
    this.term.clear();
    this.buffer = [];
    for (const line of lines) {
      this.write(line);
    }
  }

  private startFakeStream(): void {
    const samples = [
      '[32mGET[0m /api/users 200 12ms',
      '[32mGET[0m /api/health 200 1ms',
      '[33mwarn:[0m  cache miss for key user:42',
      '[32mPOST[0m /api/login 200 38ms',
      '[32mGET[0m /api/orders 200 9ms',
      '[31merror:[0m timeout calling upstream service',
      '[32mGET[0m /api/products 200 21ms',
    ];
    this.subscription = interval(900).subscribe(() => {
      const ts = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const line = `${ts}  ${samples[Math.floor(Math.random() * samples.length)]}`;
      this.write(line);
    });
  }

  private write(line: string): void {
    this.buffer.push(line);
    this.term?.writeln(line);
  }
}
