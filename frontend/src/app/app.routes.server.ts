import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'users/:employeeId/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'equipments/:name/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'vehicles/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reservation/flt',
    renderMode: RenderMode.Client,
  },
  {
    path: 'customer/flt',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
