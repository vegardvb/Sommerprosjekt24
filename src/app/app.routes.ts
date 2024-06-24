import { Routes } from '@angular/router';

export const routes: Routes = [


  {
    path: '',
    redirectTo: 'home-page',
    pathMatch: 'full',
  },

  {
    path: 'project-data/:name',
    loadComponent: () =>
      import('./project-data/project-data.component').then((m) => m.ProjectDataComponent),
  },
  {
    path: 'project-list',
    loadComponent: () =>
      import('./project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
  

  {
    path: 'home-page',
    loadComponent: () =>
      import('./home-page/home-page.component').then((m) => m.HomePageComponent),
  },

  

  
];