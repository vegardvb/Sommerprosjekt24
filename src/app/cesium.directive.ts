import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  Viewer,
  EllipsoidTerrainProvider,
  Color,
  Cesium3DTileset,
  Cesium3DTileStyle,
  NearFarScalar,
  Math,
  Cartesian3,
} from 'cesium';
import {
  Viewer,
  EllipsoidTerrainProvider,
  Color,
  Cesium3DTileset,
  Cesium3DTileStyle,
  NearFarScalar,
  Math,
  Cartesian3,
} from 'cesium';

@Directive({
  selector: '[appCesium]',
  standalone: true,
  standalone: true,
})
export class CesiumDirective implements OnInit {
  viewModel = {
    translucencyEnabled: true,
    fadeByDistance: true,
    showVectorData: false,
    alpha: 0.5,
    viewer: Viewer,
  };

  tileset?: Cesium3DTileset;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  async ngOnInit(): Promise<void> {
    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    const viewer = new Viewer(this.el.nativeElement, {
      terrainProvider: new EllipsoidTerrainProvider(), // Use flat ellipsoid surface
    const viewer = new Viewer(this.el.nativeElement, {
      terrainProvider: new EllipsoidTerrainProvider(), // Use flat ellipsoid surface
    });

    const scene = viewer.scene;
    const globe = scene.globe;
    globe.baseColor = Color.BLACK;

    this.tileset = await Cesium3DTileset.fromIonAssetId(2275207);
    viewer.scene.primitives.add(this.tileset);

    globe.tileCacheSize = 100;
    scene.screenSpaceCameraController.enableCollisionDetection = false;
    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      400.0,
      0.0,
      800.0,
      1.0,
    );

    // Initialize the toolbar and bind the viewModel
    const toolbar = this.renderer.createElement('div');
    toolbar.id = 'toolbar';
    this.el.nativeElement.appendChild(toolbar);

    this.createAlphaSlider(toolbar);

    // Fly the camera to the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(10.436527, 63.421646, 4000),
      orientation: {
        heading: Math.toRadians(0.0),
        pitch: Math.toRadians(-85.0),
      },
      },
    });
  }

  createAlphaSlider(toolbar: HTMLElement) {
    const label = this.renderer.createElement('label');
    const text = this.renderer.createText('Alpha:');
    this.renderer.appendChild(label, text);

    const input = this.renderer.createElement('input');
    this.renderer.setAttribute(input, 'type', 'range');
    this.renderer.setAttribute(input, 'min', '0');
    this.renderer.setAttribute(input, 'max', '1');
    this.renderer.setAttribute(input, 'step', '0.01');
    this.renderer.setProperty(input, 'value', this.viewModel.alpha);

    this.renderer.listen(input, 'input', event => {
      this.viewModel.alpha = event.target.value;
      this.updateAlpha(this.viewModel.alpha);
    });

    this.renderer.appendChild(label, input);
    this.renderer.appendChild(toolbar, label);
  }

  updateAlpha(alpha: number) {
    let adjustedAlpha = 1 - Number(alpha);
    adjustedAlpha = !isNaN(adjustedAlpha) ? adjustedAlpha : 1.0;
    adjustedAlpha = Math.clamp(adjustedAlpha, 0.0, 1.0);

    if (this.tileset) {
      this.tileset.style = new Cesium3DTileStyle({
        color: {
          conditions: [['true', `color('white', ${adjustedAlpha})`]],
        },
          conditions: [['true', `color('white', ${adjustedAlpha})`]],
        },
      });
    }
  }
}
