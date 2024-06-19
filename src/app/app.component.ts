import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent} from './home/home.component'

import { CesiumDirective } from './mapServices/cesium.directive';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CesiumDirective, HomeComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
