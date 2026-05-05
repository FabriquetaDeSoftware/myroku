import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { API_BASE_URL, WS_BASE_URL } from './core/api/api.tokens';
import { errorInterceptor } from './core/api/error.interceptor';
import { provideI18n } from './core/i18n/i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    provideAnimations(),
    provideI18n(),
    { provide: API_BASE_URL, useValue: '/api' },
    {
      provide: WS_BASE_URL,
      useFactory: () =>
        `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`,
    },
  ],
};
