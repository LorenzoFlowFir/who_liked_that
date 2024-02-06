import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'lobby',
    loadComponent: () =>
      import('./pages/lobby/lobby.page').then((m) => m.LobbyPage),
  },
  {
    path: 'party',
    loadComponent: () =>
      import('./pages/party/party.page').then((m) => m.PartyPage),
  },
  {
    path: 'classement',
    loadComponent: () =>
      import('./pages/classement/classement.page').then(
        (m) => m.ClassementPage
      ),
  },
  {
    path: 'set-profile-picture',
    loadComponent: () => import('./pages/home/set-profile-picture/set-profile-picture.page').then( m => m.SetProfilePicturePage)
  },
];
