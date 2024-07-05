import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import {
  Viewer,
  ClippingPlane,
  ClippingPlaneCollection,
  Color,
  Cesium3DTileset,
  NearFarScalar,
  Cartesian3,
  Transforms,
  Terrain,
  CesiumTerrainProvider,
  Math as CesiumMath,
  BoundingSphere,
  HeadingPitchRange,
  PolygonHierarchy,
  Entity,
  EntityCollection,
  GeoJsonDataSource,
} from 'cesium';
import { CableMeasurementService } from './services/cable-measurement.service';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';
import { ParsedGeometry } from '../models/parsedgeometry-interface';

@Directive({
  selector: '[appCesium]',
  standalone: true,
})
export class CesiumDirective implements OnInit {
  @Input()
  alpha!: number;
  tileset!: Cesium3DTileset;
  polygons: Entity[] = [];
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
    private route: ActivatedRoute,
    private mapview: MapViewComponent
  ) {}

  // Service for fetching data from the backend
  private cableMeasurementService: CableMeasurementService = inject(
    CableMeasurementService
  );

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    console.log('cesiumid', this.inquiryId);
    this.filterMapByInquiryId(this.inquiryId);

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.viewer = new Viewer(this.el.nativeElement, {
      timeline: false,
      animation: false,
      sceneModePicker: false,
      // Use flat ellipsoid surface
    });

    const scene = this.viewer.scene;
    const globe = scene.globe;

    this.cableMeasurementService.getData().subscribe({
      next: data => {
        if (data) {
          console.log(data);
          // Ensure data is not undefined or null
          GeoJsonDataSource.load(data, {
            stroke: Color.RED,
            fill: Color.RED.withAlpha(0.5),
            strokeWidth: 3,
            credit: "Provided by Petter's Cable measurement service",
          })
            .then((dataSource: GeoJsonDataSource) => {
              this.viewer.dataSources.add(dataSource);
              this.viewer.zoomTo(dataSource);
            })
            .catch(error => {
              console.error('Failed to load GeoJSON data:', error);
            });
        } else {
          console.error('No data received from service');
        }
      },
      error: err => {
        console.error('Error fetching data:', err);
      },
    });

    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      1000.0,
      0.0,
      2000.0,
      1.0
    );

    //var position2 = Cartographic.toCartesian(this.center);
    const distance = 200.0;

    this.tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );

    this.tileset.clippingPlanes = new ClippingPlaneCollection({
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

    this.viewer.scene.setTerrain(
      new Terrain(CesiumTerrainProvider.fromIonAssetId(1))
    );

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
  }

  filterMapByInquiryId(inquiryId: number | undefined): void {
    console.log(inquiryId);
    if (inquiryId) {
      console.log('Filtering map for inquiry ID in cesium:', inquiryId);
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

          //this.updateMap();
          console.log('stops after update');
          console.log('insidedsojf', this.coords[0][0][0]);
          if (this.coords.length > 0) {
            for (let i = 0; i < this.coords.length; i++) {
              const polygonCoordinates = this.coords[i][0].map(coordPair =>
                Cartesian3.fromDegrees(coordPair[0], coordPair[1])
              );
              // console.log('stops after pyl');

              this.plotPolygon(polygonCoordinates, this.viewer);
              // console.log('polygon', polygonCoordinates);
            }
          }
          this.updatemap(this.viewer);
          this.updateGlobeAlpha(1);

          // console.log('Converted Coordinates:', this.coords);
          // console.log('Centroid:', this.center);
        },
        error: error => {
          console.error('Error fetching geometries:', error);
        },
        complete: () => {
          console.log('Fetching geometries completed.');
        },
      });
    }
  }

  private extractCoordinates(geometries: Geometry[]): void {
    this.coords = []; // Clear any existing coordinates
    geometries.forEach(geometry => {
      const parsedGeometry = geometry.geometry as ParsedGeometry;
      if (parsedGeometry && parsedGeometry.coordinates) {
        this.coords.push(...parsedGeometry.coordinates);
        console.log('THIS.COORDS', this.coords);
      }
    });

    // if (this.coords.length > 0) {
    //   const firstCoordinatePair = this.coords[0][0];
    //   const lon = firstCoordinatePair[0]
    //   const lat = firstCoordinatePair[1]
    //   console.log('lon', lon)

    //   console.log('First Coordinate Pair:', firstCoordinatePair);

    // }
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
      console.log('flatcoords', flatcoordinates);
      //bounding map
      this.center = boundingsphere.center;
      //fly camera to
      viewer.camera.flyToBoundingSphere(boundingsphere, {
        offset: new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 1000), // Adjust the range as needed
      });
      this.changeHomeButton(viewer, boundingsphere);
    }
  }

  private plotPolygon(coordinates: Cartesian3[], viewer: Viewer): void {
    const pol = new PolygonHierarchy(coordinates);
    console.log('plg', pol);
    const polygonEntity = viewer.entities.add({
      polygon: {
        hierarchy: pol,
        material: Color.RED.withAlpha(0.5),
      },
    });
    this.polygons.push(polygonEntity);
  }
  private changeHomeButton(viewer: Viewer, boundingsphere: BoundingSphere) {
    // Change the home button view
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true; // Cancel the default home view
        viewer.camera.flyToBoundingSphere(boundingsphere, {
          offset: new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 1000), // Adjust the range as needed
        });
      }
    );
  }

  public updateGlobeAlpha(alpha: number): void {
    // Adjust globe base color translucency
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
  }

  setTilesetVisibility(visible: boolean) {
    if (this.tileset) {
      this.tileset.show = visible;
    }
  }
  setPolygonsVisibility(visible: boolean) {
    this.polygons.forEach(polygon => {
      polygon.show = visible;
    });
  }
}
