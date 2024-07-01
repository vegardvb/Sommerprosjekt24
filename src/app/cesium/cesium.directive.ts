import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Viewer, Cartographic, ClippingPlane, ClippingPlaneCollection, Rectangle, EllipsoidTerrainProvider, Color, Cesium3DTileset, Cesium3DTileStyle, NearFarScalar, Math as csmath, Cartesian3, Transforms, Terrain, CesiumTerrainProvider } from 'cesium';


@Directive({
  selector: '[appCesium]', 
  standalone: true
})
export class CesiumDirective implements OnInit {


  constructor(private el: ElementRef, private renderer: Renderer2, private  viewer: Viewer
  ) {}


  async ngOnInit(): Promise<void> {
      
    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.viewer = new Viewer(this.el.nativeElement, {
   // Use flat ellipsoid surface
    });

const scene = this.viewer.scene;
    const globe = scene.globe;
    const position = [10.436117, 63.421477, 4000]
    var position2 = Cartographic.toCartesian(Cartographic.fromDegrees(position[0], position[1], position[2]));
    var distance = 200.0;

    const buildingTileset = Cesium3DTileset.fromIonAssetId(96188);

    const tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188),
    );
    

    tileset.clippingPlanes = new ClippingPlaneCollection({
      modelMatrix : Transforms.eastNorthUpToFixedFrame(position2),
      planes : [
          new ClippingPlane(new Cartesian3( 1.0,  0.0, 0.0), distance),
          new ClippingPlane(new Cartesian3(-1.0,  0.0, 0.0), distance),
          new ClippingPlane(new Cartesian3( 0.0,  1.0, 0.0), distance),
          new ClippingPlane(new Cartesian3( 0.0, -1.0, 0.0), distance)
      ],
      unionClippingRegions : true,
              edgeWidth:3,
      edgeColor: Color.RED,
      enabled : true
  });
    

    this.viewer.scene.setTerrain(
      new Terrain(
        CesiumTerrainProvider.fromIonAssetId(1),
      ),
    );

    


    


globe.clippingPlanes = new ClippingPlaneCollection({
    modelMatrix : Transforms.eastNorthUpToFixedFrame(position2),
    planes : [
        new ClippingPlane(new Cartesian3( 1.0,  0.0, 0.0), distance),
        new ClippingPlane(new Cartesian3(-1.0,  0.0, 0.0), distance),
        new ClippingPlane(new Cartesian3( 0.0,  1.0, 0.0), distance),
        new ClippingPlane(new Cartesian3( 0.0, -1.0, 0.0), distance)
    ],
    unionClippingRegions : true,
            edgeWidth:3,
    edgeColor: Color.RED,
    enabled : true
});
  

  

    globe.tileCacheSize = 1000;
    scene.screenSpaceCameraController.enableCollisionDetection = false;
    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      400.0,
      0.0,
      800.0,
      1.0
    );

     // Fly the camera to the given longitude, latitude, and height.
     this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(position[0], position[1], position[2]),
      orientation: {
        heading: csmath.toRadians(2.0),
        pitch: csmath.toRadians(-80.0),
      }
    });
   
    
}
}

