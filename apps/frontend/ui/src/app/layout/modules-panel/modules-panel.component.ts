import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Settings, X } from 'lucide-angular';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-modules-panel',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './modules-panel.component.html',
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
    trigger('slide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate(
          '160ms ease-in',
          style({ transform: 'translateX(100%)' }),
        ),
      ]),
    ]),
  ],
})
export class ModulesPanelComponent {
  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  readonly theme = inject(ThemeService);

  readonly Settings = Settings;
  readonly X = X;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.closed.emit();
  }
}
