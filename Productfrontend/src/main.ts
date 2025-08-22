import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  const sanitizedError = err?.message || 'Application startup failed';
  console.error('Error starting app:', sanitizedError);
});
