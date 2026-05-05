import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutShellComponent } from './layout/shell/layout-shell.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutShellComponent],
  templateUrl: './app.html',
})
export class App {}
