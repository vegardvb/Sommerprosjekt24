import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HomeComponent} from './home/home.component'

import { MapComponent } from './mapServices/map.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HomeComponent, MapComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
