// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { provideRouter }        from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { manualXsrfInterceptor } from './interceptors/manual-xsrf.interceptor';
import { routes }               from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([ manualXsrfInterceptor ])
    )
  ]
};
