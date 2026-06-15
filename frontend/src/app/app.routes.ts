import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
