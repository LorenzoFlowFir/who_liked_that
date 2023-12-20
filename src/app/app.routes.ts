import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'lobby',
    loadComponent: () => import('./lobby/lobby.page').then((m) => m.LobbyPage),
  },  {
    path: 'party',
    loadComponent: () => import('./party/party.page').then( m => m.PartyPage)
  },

];
