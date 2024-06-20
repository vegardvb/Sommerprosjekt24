import { Component } from '@angular/core';
import { CesiumDirective } from './cesium.directive';


@Component({
  standalone: true,
  selector: 'mapcomponent',
  imports: [ CesiumDirective],
  templateUrl: `./map.component.html`,
})
export class MapComponent {
    viewModel = {
        translucencyEnabled: true,
        fadeByDistance: true,
        showVectorData: false,
        alpha: 0.8,
      };

      updateCesium(): void {
        const event = new CustomEvent('viewModelChange', { detail: this.viewModel });
        window.dispatchEvent(event);
      }
  }


