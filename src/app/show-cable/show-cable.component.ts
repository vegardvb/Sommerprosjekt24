import { Component, ViewChild } from '@angular/core';
import { CesiumDirective } from '../cesium.directive';
import {Math as cesiumMath,  Cartesian2, Viewer, Cartesian3, Color } from 'cesium';

@Component({
  selector: 'app-show-cable',
  standalone: true,
  imports: [CesiumDirective],
 // templateUrl: './show-cable.component.html',
  styleUrl: './show-cable.component.css',
  template: `
  <div appCesium style="height: 70%"></div>
  <button (click)="addCable()">Add Cable</button>
`,
})
export class ShowCableComponent {
  @ViewChild(CesiumDirective)
  cesiumDirective!: CesiumDirective;

  ngOnInit() {
    console.log("test");
  }


  
  readonly listOfCoordinates: number[] = [
    10.485022, 63.2981916, 142.785, //har ikke tatt hensyn til forskjell mellom WGS og NN2000. Geoidehøyde?
    10.4850477, 63.298136, 140.873,
    10.4850851, 63.298076, 140.719,
    10.4851101, 63.298031,141.019
    
]


computeCircle(radius:number) {
  const positions = [];
  for (let i = 0; i < 360; i++) {
    const radians = cesiumMath.toRadians(i);
    positions.push(
      new Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  return positions;
}

addCable() {
  /*console.log(this.cesiumDirective);
  console.log(this.cesiumDirective.viewer);

  
  if (this.cesiumDirective && this.cesiumDirective.viewer) {
    const viewer = this.cesiumDirective.viewer;*/

   /* viewer.entities.add({
      id: "electricalCable",
      polylineVolume: {
        positions: Cartesian3.fromDegreesArrayHeights(this.listOfCoordinates),
        shape: this.computeCircle(0.5),
        material: Color.RED,
      },
    });

    viewer.zoomTo(viewer.entities);
  }*/
  
}
}

