import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CesiumDirective } from './cesium.directive';
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
  providers: [],
})
export class AppComponent {}
