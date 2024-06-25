import { Routes } from '@angular/router';
import { FirstComponent } from './first/first.component';
import { CesiumWindowComponent } from './cesium-window/cesium-window.component';

export const routes: Routes = [
    {path: 'fungerer', component: FirstComponent},
    {path: 'cesium', component: CesiumWindowComponent},
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home-page',
    pathMatch: 'full',
  },

  {
    path: 'project-list',
    loadComponent: () =>
      import('./project-list/project-list.component').then(
        m => m.ProjectListComponent
      ),
  },

  {
    path: 'home-page',
    loadComponent: () =>
      import('./home-page/home-page.component').then(m => m.HomePageComponent),
  },
];
