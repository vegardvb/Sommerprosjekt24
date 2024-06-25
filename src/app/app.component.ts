<<<<<<< HEAD
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { CesiumDirective } from './cesium.directive';
>>>>>>> 1522c904441b8f486fcfa9cedced5fe4012567b0

import { ProjectListComponent } from './project-list/project-list.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CesiumDirective,
    ProjectListComponent,
    HomePageComponent,
    NavbarComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {}
>>>>>>> 1522c904441b8f486fcfa9cedced5fe4012567b0
