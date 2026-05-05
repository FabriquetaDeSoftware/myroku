import { animate, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Box,
  Container,
  CornerDownLeft,
  Compass,
  Github,
  LucideAngularModule,
  LucideIconData,
  Search,
  SearchX,
  Settings,
  Zap,
} from 'lucide-angular';
import {
  CommandBusStore,
  groupCommands,
} from '../../core/command-bus/command-bus.service';
import { Command, CommandGroup } from '../../core/command-bus/command.types';

const GROUP_ICONS: Record<CommandGroup, LucideIconData> = {
  Navegar: Compass,
  Aplicações: Box,
  Ações: Zap,
  GitHub: Github,
  Sistema: Settings,
};

@Component({
  selector: 'app-command-palette',
  imports: [A11yModule, LucideAngularModule, NgClass],
  templateUrl: './command-palette.component.html',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('120ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('pop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px) scale(0.98)' }),
        animate(
          '160ms ease-out',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '100ms ease-in',
          style({ opacity: 0, transform: 'translateY(-4px) scale(0.99)' }),
        ),
      ]),
    ]),
  ],
})
export class CommandPaletteComponent {
  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  readonly Search = Search;
  readonly SearchX = SearchX;
  readonly ArrowUp = ArrowUp;
  readonly ArrowDown = ArrowDown;
  readonly ArrowRight = ArrowRight;
  readonly CornerDownLeft = CornerDownLeft;

  private readonly bus = inject(CommandBusStore);
  readonly query = signal('');
  readonly activeIndex = signal(0);

  readonly results = computed(() => this.bus.search(this.query()));
  readonly groupedResults = computed(() =>
    Array.from(groupCommands(this.results()).entries()),
  );
  readonly indexById = computed(() => {
    const map = new Map<string, number>();
    this.results().forEach((c, i) => map.set(c.id, i));
    return map;
  });

  private readonly rows = viewChildren<ElementRef<HTMLButtonElement>>('cmdRow');

  constructor() {
    effect(() => {
      this.query();
      this.activeIndex.set(0);
    });

    effect(() => {
      const len = this.results().length;
      if (len === 0) return;
      if (this.activeIndex() >= len) this.activeIndex.set(len - 1);
    });

    effect(() => {
      const idx = this.activeIndex();
      const rows = this.rows();
      rows[idx]?.nativeElement.scrollIntoView({ block: 'nearest' });
    });
  }

  iconFor(cmd: Command): LucideIconData {
    return GROUP_ICONS[cmd.group] ?? Compass;
  }

  isActive(cmd: Command): boolean {
    return this.indexById().get(cmd.id) === this.activeIndex();
  }

  setActive(cmd: Command): void {
    const i = this.indexById().get(cmd.id);
    if (i !== undefined) this.activeIndex.set(i);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }

  @HostListener('document:keydown.arrowDown', ['$event'])
  onArrowDown(event: Event): void {
    if (!this.open()) return;
    const len = this.results().length;
    if (len === 0) return;
    event.preventDefault();
    this.activeIndex.set((this.activeIndex() + 1) % len);
  }

  @HostListener('document:keydown.arrowUp', ['$event'])
  onArrowUp(event: Event): void {
    if (!this.open()) return;
    const len = this.results().length;
    if (len === 0) return;
    event.preventDefault();
    this.activeIndex.set((this.activeIndex() - 1 + len) % len);
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: Event): void {
    if (!this.open()) return;
    const cmd = this.results()[this.activeIndex()];
    if (!cmd) return;
    event.preventDefault();
    this.run(cmd);
  }

  onBackdropClick(): void {
    this.closed.emit();
  }

  run(cmd: Command): void {
    void cmd.run();
    this.closed.emit();
  }
}
