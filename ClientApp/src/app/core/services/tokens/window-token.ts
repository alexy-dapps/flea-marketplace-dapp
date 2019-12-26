
import { InjectionToken } from '@angular/core';

export const windowRefToken = new InjectionToken<Window>(
  'Native window object',
  {
    providedIn: 'root',
    factory: () => window
  }
);


