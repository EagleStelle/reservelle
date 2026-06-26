import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'boardroom',
    loadComponent: () =>
      import('./boardroom/boardroom').then((m) => m.BoardroomReservation),
  },
  {
    path: 'conference-room',
    loadComponent: () =>
      import('./conference-room/conference-room').then((m) => m.ConferenceRoomReservation),
  },
  {
    path: 'gymnasium',
    loadComponent: () => import('./gymnasium/gymnasium').then((m) => m.GymnasiumReservation),
  },
  {
    path: 'nexus-room',
    loadComponent: () => import('./nexus-room/nexus-room').then((m) => m.NexusRoomReservation),
  },
];
