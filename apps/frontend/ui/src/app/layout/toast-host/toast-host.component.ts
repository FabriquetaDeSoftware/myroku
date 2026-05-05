import { Component } from '@angular/core';
import { NgxSonnerToaster } from 'ngx-sonner';

@Component({
  selector: 'app-toast-host',
  imports: [NgxSonnerToaster],
  template: `<ngx-sonner-toaster position="bottom-right" />`,
})
export class ToastHostComponent {}
