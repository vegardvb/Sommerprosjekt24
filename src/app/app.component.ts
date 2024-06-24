import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CesiumDirective } from './cesium.directive';
import { ProjectListComponent } from './project-list/project-list.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DataService } from './data.service';

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
export class AppComponent implements OnInit {
  ngOnInit() {}
}
