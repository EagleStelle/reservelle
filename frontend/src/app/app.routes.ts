import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/users/users').then((m) => m.Users),
  },
  {
    path: 'users/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/users/add-user').then((m) => m.AddUser),
  },
  {
    path: 'users/:employeeId/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/users/edit-user').then((m) => m.EditUser),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
