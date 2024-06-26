import { Routes } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';

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

  { path: 'map-view', component: MapViewComponent },

  {
    path: 'home-page',
    loadComponent: () =>
      import('./home-page/home-page.component').then(m => m.HomePageComponent),
  },
];
