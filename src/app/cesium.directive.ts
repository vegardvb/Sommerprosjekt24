import { Directive, ElementRef, OnInit } from '@angular/core';
import {
  Viewer,
  ClippingPlane,
  ClippingPlaneCollection,
  Color,
  Cesium3DTileset,
  NearFarScalar,
  Cartesian3,
  Transforms,
  // Terrain,
  // CesiumTerrainProvider,
  PolygonHierarchy,
  BoundingSphere,
} from 'cesium';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import { ParsedGeometry } from '../models/parsedgeometry-interface';

@Directive({
  selector: '[appCesium]',
  standalone: true,
})
export class CesiumDirective implements OnInit {
  //constants for data from database
  inquiryId: number | undefined; // Accept inquiry ID as input
  products: Geometry[] = [];
  coords: number[][][][] = []; // List to hold converted coordinates
  center!: Cartesian3; // To hold the center of the polygon

  //constants for cesium
  private viewer!: Viewer;

  constructor(
    private el: ElementRef,
    private geometryService: GeometryService,
    private route: ActivatedRoute
  ) {}

  // // Service for fetching data from the backend

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    this.filterMapByInquiryId(this.inquiryId);

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.viewer = new Viewer(this.el.nativeElement, {
      timeline: false,
      animation: false,
      // Use flat ellipsoid surface
    });

    const scene = this.viewer.scene;
    const globe = scene.globe;

    //var position2 = Cartographic.toCartesian(this.center);
    const distance = 200.0;

    const tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );

    tileset.clippingPlanes = new ClippingPlaneCollection({
      modelMatrix: Transforms.eastNorthUpToFixedFrame(this.center),
      planes: [
        new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), distance), // East
        new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), distance), // West
        new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), distance), // North
        new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), distance), // South
      ],
      unionClippingRegions: true,
      edgeWidth: 3,
      edgeColor: Color.RED,
      enabled: true,
    });

    // this.viewer.scene.setTerrain(
    //   new Terrain(CesiumTerrainProvider.fromIonAssetId(1))
    // );

    globe.clippingPlanes = new ClippingPlaneCollection({
      modelMatrix: Transforms.eastNorthUpToFixedFrame(this.center),
      planes: [
        new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), distance),
        new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), distance),
        new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), distance),
        new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), distance),
      ],
      unionClippingRegions: true,
      edgeWidth: 3,
      edgeColor: Color.RED,
      enabled: true,
    });

    globe.tileCacheSize = 10000;
    scene.screenSpaceCameraController.enableCollisionDetection = false;
    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      400.0,
      0.0,
      800.0,
      1.0
    );
  }

  filterMapByInquiryId(inquiryId: number | undefined): void {
    if (inquiryId) {
      this.geometryService.getGeometry(inquiryId).subscribe({
        next: (response: Geometry[]) => {
          this.products = response.map(geometry => {
            const parsedGeometry = geometry.geometry as ParsedGeometry;
            return {
              id: geometry.id,
              geometry: parsedGeometry,
            };
          });

          this.extractCoordinates(this.products);

          if (this.coords.length > 0) {
            for (let i = 0; i < this.coords.length; i++) {
              const polygonCoordinates = this.coords[i][0].map(coordPair =>
                Cartesian3.fromDegrees(coordPair[0], coordPair[1])
              );

              this.plotPolygon(polygonCoordinates, this.viewer);
            }
          }
          this.updatemap(this.viewer);
        },
        error: error => {
          console.error('Error fetching geometries:', error);
        },
        complete: () => {},
      });
    }
  }

  private extractCoordinates(geometries: Geometry[]): void {
    this.coords = []; // Clear any existing coordinates
    geometries.forEach(geometry => {
      const parsedGeometry = geometry.geometry as ParsedGeometry;
      if (parsedGeometry && parsedGeometry.coordinates) {
        this.coords.push(...parsedGeometry.coordinates);
      }
    });
  }

  private updatemap(viewer: Viewer): void {
    if (this.coords.length > 0) {
      // create boundingsphere around work area
      const flatcoordinates = this.coords.flatMap(innerarray =>
        innerarray.flat()
      );
      const flattercoordinates = flatcoordinates.flatMap(innerarray =>
        innerarray.flat()
      );

      const positions = Cartesian3.fromDegreesArray(flattercoordinates);

      const boundingsphere = BoundingSphere.fromPoints(positions);
      //bounding map
      this.center = boundingsphere.center;
      //fly camera to
      viewer.camera.flyToBoundingSphere(boundingsphere, {
        duration: 2.0,
      });
    }
  }

  plotPolygon(coordinates: Cartesian3[], viewer: Viewer): void {
    const pol = new PolygonHierarchy(coordinates);
    viewer.entities.add({
      polygon: {
        hierarchy: pol,
        material: Color.RED.withAlpha(0.5),
      },
    });
  }
}
