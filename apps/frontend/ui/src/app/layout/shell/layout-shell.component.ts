import {
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommandBusStore } from '../../core/command-bus/command-bus.service';
import { ShortcutsService } from '../../core/shortcuts/shortcuts.service';
import { CheatsheetComponent } from '../cheatsheet/cheatsheet.component';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';
import { ModulesPanelComponent } from '../modules-panel/modules-panel.component';
import { RealtimeBannerComponent } from '../realtime-banner/realtime-banner.component';
import { ToastHostComponent } from '../toast-host/toast-host.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-layout-shell',
  imports: [
    RouterOutlet,
    TopbarComponent,
    CommandPaletteComponent,
    ModulesPanelComponent,
    RealtimeBannerComponent,
    ToastHostComponent,
    CheatsheetComponent,
  ],
  templateUrl: './layout-shell.component.html',
})
export class LayoutShellComponent implements OnInit {
  readonly commandPaletteOpen = signal(false);
  readonly modulesPanelOpen = signal(false);

  private readonly router = inject(Router);
  private readonly bus = inject(CommandBusStore);
  private readonly shortcuts = inject(ShortcutsService);

  ngOnInit(): void {
    const go = (path: string) => () => {
      void this.router.navigateByUrl(path);
    };

    this.bus.register([
      { id: 'nav.dashboard', label: 'Ir para Dashboard', group: 'Navegar', run: go('/') },
      { id: 'nav.apps', label: 'Ir para Aplicações', group: 'Navegar', run: go('/apps') },
      { id: 'nav.containers', label: 'Ir para Containers', group: 'Navegar', run: go('/containers') },
      { id: 'nav.images', label: 'Ir para Imagens', group: 'Navegar', run: go('/images') },
      { id: 'nav.settings', label: 'Configurações do sistema', group: 'Navegar', run: go('/settings/system') },
    ]);
  }

  @HostListener('document:keydown.control.k', ['$event'])
  @HostListener('document:keydown.meta.k', ['$event'])
  onCmdK(event: Event): void {
    event.preventDefault();
    this.commandPaletteOpen.set(true);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    this.shortcuts.handle(event);
  }
}
