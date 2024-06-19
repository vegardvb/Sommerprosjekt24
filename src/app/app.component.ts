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

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cable_network_visualization';
}
=======
  imports: [CommonModule, RouterOutlet, CesiumDirective],
  template: '<div appCesium></div>'
})
export class AppComponent {}
>>>>>>> 1522c904441b8f486fcfa9cedced5fe4012567b0
