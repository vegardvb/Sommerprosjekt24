import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Viewer, Terrain, Ion} from 'cesium';
@Component({
  selector: 'cesium-container',
  standalone: true,
  imports: [],
  templateUrl: './cesium-window.component.html',
  styleUrl: './cesium-window.component.css'
})

export class CesiumWindowComponent {
  testing: string = "Hello World";

  Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MDhjNTZjMC1mZTVhLTRiMTAtYTM4My1jNGQxYjhlOWRmZjMiLCJpZCI6MjIxNTE1LCJpYXQiOjE3MTgxMDU1Njl9.Fb5JHD7qgBuqkGxJnTlpmhCZmis5MSitnY1mZUwrlLU"; 

  // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
  private viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

}
