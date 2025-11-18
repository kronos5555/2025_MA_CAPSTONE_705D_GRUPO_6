import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then(m => m.WelcomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'resident-home',
    loadComponent: () => import('./pages/resident-home/resident-home.page').then(m => m.ResidentHomePage),
    canActivate: [authGuard]
  },
  {
    path: 'conserje-home',
    loadComponent: () => import('./pages/conserje-home/conserje-home.page').then(m => m.ConserjeHomePage),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'contacts',
    loadComponent: () => import('./pages/contacts/contacts.page').then(m => m.ContactsPage),
    canActivate: [authGuard]
  },
  {
    path: 'chat/:userId',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage),
    canActivate: [authGuard]
  },
  {
    path: 'anuncios',
    loadComponent: () => import('./pages/anuncios/anuncios.page').then(m => m.AnunciosPage),
    canActivate: [authGuard]
  },
  {
    path: 'create-anuncio',
    loadComponent: () => import('./pages/create-anuncio/create-anuncio.page').then(m => m.CreateAnuncioPage),
    canActivate: [authGuard]
  },
  {
    path: 'bitacora',
    loadComponent: () => import('./pages/bitacora/bitacora.page').then(m => m.BitacoraPage),
    canActivate: [authGuard]
  },
  {
    path: 'packetes',
    loadComponent: () => import('./pages/packetes/packetes.page').then(m => m.PacketesPage),
    canActivate: [authGuard]
  }
];
