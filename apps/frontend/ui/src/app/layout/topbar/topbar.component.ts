import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  Box,
  LayoutDashboard,
  LayoutGrid,
  Moon,
  Package,
  Search,
  Sun,
} from 'lucide-angular';
import { ThemeService } from '../../core/theme/theme.service';

interface NavLink {
  path: string;
  label: string;
  icon: typeof Box;
  exact: boolean;
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  readonly openCommandPalette = output<void>();
  readonly openModulesPanel = output<void>();

  readonly theme = inject(ThemeService);

  // Ícones expostos no template
  readonly Search = Search;
  readonly LayoutGrid = LayoutGrid;
  readonly Sun = Sun;
  readonly Moon = Moon;

  readonly navLinks: NavLink[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/apps', label: 'Apps', icon: Package, exact: false },
    { path: '/containers', label: 'Containers', icon: Box, exact: false },
  ];
}
