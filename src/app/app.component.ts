import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CesiumDirective } from './cesium.directive';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CesiumDirective,
    InquiryListComponent,
    HomePageComponent,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  providers: [],
})
export class AppComponent {
  title = '3D visualization of cable network';
}
