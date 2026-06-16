import { Routes } from '@angular/router';

import { guestGuard } from '../../core/auth/auth.guard';

export const AUTH_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
];
