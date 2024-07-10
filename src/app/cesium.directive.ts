import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  OnInit,
  Output,
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
  Math as CesiumMath,
  BoundingSphere,
  HeadingPitchRange,
  PolygonHierarchy,
  Entity,
  GeoJsonDataSource,
  Cartesian2,
  ScreenSpaceEventType,
  defined,
  ScreenSpaceEventHandler,
  JulianDate,
  CallbackProperty,
  PositionProperty,
} from 'cesium';
import { CableMeasurementService } from './services/cable-measurement.service';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';
import { ParsedGeometry } from '../models/parsedgeometry-interface';
import proj4 from 'proj4';

// Define the source and target projections
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');

@Directive({
  selector: '[appCesium]',
  standalone: true,
})
export class CesiumDirective implements OnInit {
  @Input()
  alpha!: number;
  tileset!: Cesium3DTileset;
  polygons: Entity[] = [];
  @Output() bboxExtracted = new EventEmitter<string>();   
  @Output() selectedEntityChanged = new EventEmitter<Entity>();

  inquiryId: number | undefined;
  products: Geometry[] = [];
  coords: number[][][][] = [];
  center!: Cartesian3;
  private isEditing = false;
  private selectedEntity: Entity | null = null;

  private viewer!: Viewer;
  private handler: any;
  private currentPopup: HTMLElement | null = null;

  constructor(
    private el: ElementRef,
    private geometryService: GeometryService,
    private route: ActivatedRoute,
  ) {}

  // Service for fetching data from the backend
  private cableMeasurementService: CableMeasurementService = inject(
    CableMeasurementService
  );

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    this.filterMapByInquiryId(this.inquiryId);
 

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.initializeViewer();
    this.addSampleCable();



    const cameraMoveEndListener = () => {
      this.extractBbox();
      this.viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener);
    };
    this.viewer.camera.moveEnd.addEventListener(cameraMoveEndListener);

    // Set up a screen space event handler to select entities and create a popup
    this.viewer.screenSpaceEventHandler.setInputAction((movement: { position: Cartesian2; }) => {
      var pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        var entity = pickedObject.id;
        this.viewer.selectedEntity = entity;  // Set the selected entity
        // Create a popup next to the mouse click
        this.createPopup(movement.position, pickedObject);
      } else {
        this.viewer.selectedEntity = undefined;
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.viewer.selectedEntityChanged.addEventListener((entity: Entity) => {
      if (defined(entity)) {
        console.log('Entity selected: ', entity.id);
        this.selectedEntityChanged.emit(entity)
        console.log('emitafterselect', this.selectedEntityChanged)
      } else {
        console.log('No entity selected');
      }
    });
  }

  /**
   * Initializes the Cesium Viewer and adds the tileset and clipping planes.
   */
  private async initializeViewer(): Promise<void> {
    this.viewer = new Viewer(this.el.nativeElement, {
      timeline: false,
      animation: false,
      sceneModePicker: false,
    });

    const scene = this.viewer.scene;
    const globe = scene.globe;

    //TODO Refactor to own service
    this.cableMeasurementService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          console.log(data);
          // Ensure data is not undefined or null
          GeoJsonDataSource.load(data, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(1),
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

        // Set up a screen space event handler to select entities and create a popup
        this.viewer.screenSpaceEventHandler.setInputAction((movement: { position: Cartesian2; }) => {
          var pickedObject = this.viewer.scene.pick(movement.position);
          if (defined(pickedObject)) {
            var entity = pickedObject.id;
            this.viewer.selectedEntity = entity;  // Set the selected entity
            // Create a popup next to the mouse click
            //this.createPopup(movement.position, pickedObject);
          } else {
            this.viewer.selectedEntity = undefined;
          }
        }, ScreenSpaceEventType.LEFT_CLICK);
    
        this.viewer.selectedEntityChanged.addEventListener((entity: Entity) => {
          if (defined(entity)) {
            console.log('Entity selected: ', entity.id);
            this.selectedEntityChanged.emit(entity)
            console.log('emitafterselect', this.selectedEntityChanged)
          } else {
            console.log('No entity selected');
          }
        });
      

    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      1000.0,
      0.0,
      2000.0,
      1.0
    );

    const distance = 200.0;

    this.tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );


    const globeClippingPlanes = new ClippingPlaneCollection({
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

    const tilesetClippingPlanes = new ClippingPlaneCollection({
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

    this.viewer.scene.globe.clippingPlanes = globeClippingPlanes;
    this.tileset.clippingPlanes = tilesetClippingPlanes;

    this.viewer.scene.globe.tileCacheSize = 10000;
    this.viewer.scene.screenSpaceCameraController.enableCollisionDetection =
      false;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
      new NearFarScalar(1.0, 0.7, 5000.0, 0.7);
  }

  /**
   * Filters the map by inquiry ID and fetches geometries.
   */
  private filterMapByInquiryId(inquiryId: number | undefined): void {
    if (inquiryId) {
      this.geometryService.getGeometry(inquiryId).subscribe({
        next: (response: Geometry[]) => {
          this.products = response.map(geometry => {
            const parsedGeometry = geometry.geometry as ParsedGeometry;
            return { id: geometry.id, geometry: parsedGeometry };
          });

          this.extractCoordinates(this.products);
          if (this.coords.length > 0) {
            this.coords.forEach(coordSet => {
              const polygonCoordinates = coordSet[0].map(coordPair =>
                Cartesian3.fromDegrees(coordPair[0], coordPair[1])
              );
              this.plotPolygon(polygonCoordinates, this.viewer);
            });
          }
          this.updateMap(this.viewer);
          this.updateGlobeAlpha(1);
        },
        error: error => {
          console.error('Error fetching geometries:', error);
        },
      });
    }
  }

  /**
   * Extracts coordinates from geometries.
   */
  private extractCoordinates(geometries: Geometry[]): void {
    this.coords = geometries.reduce(
      (acc, geometry) => {
        const parsedGeometry = geometry.geometry as ParsedGeometry;
        if (parsedGeometry && parsedGeometry.coordinates) {
          acc.push(...parsedGeometry.coordinates);
        }
        return acc;
      },
      [] as number[][][][]
    );
  }

  /**
   * Updates the map view to fit the extracted coordinates.
   */
  private updateMap(viewer: Viewer): void {
    if (this.coords.length > 0) {
      const flatCoordinates = this.coords.flat(3);
      const positions = Cartesian3.fromDegreesArray(flatCoordinates);
      const boundingSphere = BoundingSphere.fromPoints(positions);
      this.center = boundingSphere.center;
      viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 1000), // Adjust the range as needed
      });
      this.changeHomeButton(viewer, boundingSphere);
    }
  }

  /**
   * Extracts the bounding box of the current view based on clipping planes and emits the coordinates.
   */
  private extractBbox(): void {
    const clippingPlanes = this.viewer.scene.globe.clippingPlanes;
    if (clippingPlanes) {
      const eastPlane = clippingPlanes.get(0);
      const westPlane = clippingPlanes.get(1);
      const northPlane = clippingPlanes.get(2);
      const southPlane = clippingPlanes.get(3);

      const distanceEast = eastPlane.distance;
      const distanceWest = westPlane.distance;
      const distanceNorth = northPlane.distance;
      const distanceSouth = southPlane.distance;

      // Calculate the coordinates based on the clipping distances and center
      const centerCartographic =
        this.viewer.scene.globe.ellipsoid.cartesianToCartographic(this.center);
      const centerLongitude = CesiumMath.toDegrees(
        centerCartographic.longitude
      );
      const centerLatitude = CesiumMath.toDegrees(centerCartographic.latitude);

      // Use proj4 to transform distances to geographic coordinates
      const center = proj4('EPSG:4326', 'EPSG:25833', [
        centerLongitude,
        centerLatitude,
      ]);

      const west = proj4('EPSG:25833', 'EPSG:4326', [
        center[0] - distanceWest,
        center[1],
      ]);
      const east = proj4('EPSG:25833', 'EPSG:4326', [
        center[0] + distanceEast,
        center[1],
      ]);
      const south = proj4('EPSG:25833', 'EPSG:4326', [
        center[0],
        center[1] - distanceSouth,
      ]);
      const north = proj4('EPSG:25833', 'EPSG:4326', [
        center[0],
        center[1] + distanceNorth,
      ]);

      const lowerLeft = proj4('EPSG:4326', 'EPSG:25833', [west[0], south[1]]);
      const upperRight = proj4('EPSG:4326', 'EPSG:25833', [east[0], north[1]]);
      const bbox = `${lowerLeft[0]},${lowerLeft[1]},${upperRight[0]},${upperRight[1]}`;

      this.bboxExtracted.emit(bbox);
    } else {
      console.error('No clipping planes found.');
    }
  }

  /**
   * Plots a polygon on the viewer.
   */
  private plotPolygon(coordinates: Cartesian3[], viewer: Viewer): void {
    const polygonEntity = viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(coordinates),
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

  private createPopup(screenPosition: Cartesian2, entity: Entity) {
    if (this.currentPopup) {
      this.currentPopup.remove();
    }

    const popup = document.createElement('div');
    popup.style.position = 'absolute';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.zIndex = '999';
    popup.style.left = `${screenPosition.x}px`;
    popup.style.top = `${screenPosition.y}px`;

    const button = document.createElement('button');
    button.innerText = this.isEditing ? 'Disable Editing' : 'Enable Editing';
    popup.appendChild(button);

    document.body.appendChild(popup);

    button.addEventListener('click', () => {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.enableEditing();
        button.innerText = 'Disable Editing';
      } else {
        this.disableEditing();
        button.innerText = 'Enable Editing';
        if (this.currentPopup) {
          this.currentPopup.remove();
          this.currentPopup = null;
      }
      }
    });

    this.currentPopup = popup;
  }

  private isDragging = false; // To keep track of the dragging state

private enableEditing() {
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.handler.setInputAction((movement: any) => {
        const pickedObject = this.viewer.scene.pick(movement.position);
        if (defined(pickedObject)) {
            this.selectedEntity = pickedObject.id as Entity;
            this.selectedEntityChanged.emit(pickedObject); // Emit the event
            console.log('totitties',this.selectedEntityChanged)
           
            // Disable camera interactions
            this.viewer.scene.screenSpaceCameraController.enableRotate = false;
            this.viewer.scene.screenSpaceCameraController.enableZoom = false;
            this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
            this.viewer.scene.screenSpaceCameraController.enableLook = false;
        }
    }, ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction((movement: any) => {
      if (this.isDragging && defined(this.selectedEntity)) {
          const cartesian = this.viewer.camera.pickEllipsoid(movement.endPosition);
          if (defined(cartesian)) {
              if (defined(this.selectedEntity.polyline?.positions)) {
                  const positions = this.selectedEntity.polyline.positions.getValue(JulianDate.now());
                  if (positions && positions.length > 0) {
                      const offset = Cartesian3.subtract(cartesian, positions[0], new Cartesian3());
                      const newPositions = positions.map((position: Cartesian3) => Cartesian3.add(position, offset, new Cartesian3()));
                      this.selectedEntity.polyline.positions = new CallbackProperty(() => newPositions, false);
                  }
              } else if (defined(this.selectedEntity.position)) {
                  this.selectedEntity.position = new CallbackProperty(() => cartesian, false) as unknown as PositionProperty;
              }
          }
      }
  }, ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(() => {
        if (this.isDragging) {
            this.isDragging = false;
        } else if (defined(this.selectedEntity)) {
            this.isDragging = true;
        }

        if (!this.isDragging) {
            // Re-enable camera interactions after dropping
            this.viewer.scene.screenSpaceCameraController.enableRotate = true;
            this.viewer.scene.screenSpaceCameraController.enableZoom = true;
            this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
            this.viewer.scene.screenSpaceCameraController.enableTilt = true;
            this.viewer.scene.screenSpaceCameraController.enableLook = true;
        }
    }, ScreenSpaceEventType.LEFT_UP);

    this.handler.setInputAction((movement: any) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (!defined(pickedObject)) {
          if (this.currentPopup) {
              this.currentPopup.remove();
              this.currentPopup = null;
          }
      }
  }, ScreenSpaceEventType.LEFT_CLICK);
}


private disableEditing() {
    if (this.handler) {
        this.handler.destroy();
        this.handler = null;
    }
    this.isDragging = false;
    this.selectedEntity = null;
    // Ensure camera interactions are re-enabled if editing is disabled
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
    this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    this.viewer.scene.screenSpaceCameraController.enableLook = true;
}

private addSampleCable() {
  const start = Cartesian3.fromDegrees(10.436776, 63.421800, 0);
  const end = Cartesian3.fromDegrees(10.437776, 63.421800, 0); // Slightly offset for visibility

  const sampleCable = this.viewer.entities.add({
      name: 'Sample Cable',
      polyline: {
          positions: [start, end],
          width: 5,
          material: Color.RED,
      }
  });

  const pointPosition = Cartesian3.fromDegrees(10.436776, 63.421500, 50); // Nearby point

  const samplePoint = this.viewer.entities.add({
      name: 'Sample Point',
      position: pointPosition,
      point: {
          pixelSize: 10,
          color: Color.BLUE
      }
  });
}

public updateEntityPosition(cartesian: Cartesian3) {
  if (this.selectedEntity) {
      if (this.selectedEntity.polyline?.positions) {
          const positions = this.selectedEntity.polyline.positions.getValue(JulianDate.now());
          const offset = Cartesian3.subtract(cartesian, positions[0], new Cartesian3());
          const newPositions = positions.map((position: Cartesian3) => Cartesian3.add(position, offset, new Cartesian3()));
          this.selectedEntity.polyline.positions = new CallbackProperty(() => newPositions, false);
      } else if (this.selectedEntity.position) {
          this.selectedEntity.position = new CallbackProperty(() => cartesian, false) as unknown as PositionProperty;
      }
  }
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
