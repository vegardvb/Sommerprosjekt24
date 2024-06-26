import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home-page',
    pathMatch: 'full',
  },

  {
    path: 'inquiry-list',
    loadComponent: () =>
      import('./inquiry-list/inquiry-list.component').then(
        m => m.InquiryListComponent
      ),
  },

  {
    path: 'home-page',
    loadComponent: () =>
      import('./home-page/home-page.component').then(m => m.HomePageComponent),
  },
];
