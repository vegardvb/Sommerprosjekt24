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
  Entity,
  GeoJsonDataSource,
  Cartesian2,
  ScreenSpaceEventType,
  defined,
  ScreenSpaceEventHandler,
  JulianDate,
  CallbackProperty,
  PositionProperty,
  PointGraphics,
  ConstantProperty,
} from 'cesium';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import * as turf from '@turf/turf';
import { CableMeasurementService } from './services/cable-measurement.service';
import { WorkingAreaService } from './services/workingarea.service';
import { CablePointsService } from './services/cable-points.service';

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
  coords: number[][][] = [];
  bbox: number[] = [];
  pointEntities: Entity[] = [];
  center!: Cartesian3;
  isEditing = false;
  private selectedEntity: Entity | null = null;

  private viewer!: Viewer;
  private handler!: ScreenSpaceEventHandler;
  tilesetClippingPlanes!: ClippingPlaneCollection;
  globeClippingPlanes!: ClippingPlaneCollection;
  width!: number;
  height!: number;

  constructor(
    private el: ElementRef,
    private route: ActivatedRoute
  ) {}

  // Service for fetching data from the backend
  private cableMeasurementService: CableMeasurementService = inject(
    CableMeasurementService
  );
  private geometryService: GeometryService = inject(GeometryService);
  private workingAreaService: WorkingAreaService = inject(WorkingAreaService);
  private CablePointService: CablePointsService = inject(CablePointsService);

  async ngOnInit(): Promise<void> {
    console.log('ngoninit');
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    this.extractCoordinates();
    this.initializeViewer();
    this.loadCables();
    this.loadWorkingArea();
    this.loadCablepoints();

    const cameraMoveEndListener = () => {
      //this.extractBbox();
      this.viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener);
    };
    this.viewer.camera.moveEnd.addEventListener(cameraMoveEndListener);

    // Set up a screen space event handler to select entities and create a popup
    this.viewer.screenSpaceEventHandler.setInputAction(
      (movement: { position: Cartesian2 }) => {
        const pickedObject = this.viewer.scene.pick(movement.position);
        if (defined(pickedObject)) {
          const entity = pickedObject.id;
          this.viewer.selectedEntity = entity; // Set the selected entity
        } else {
          this.viewer.selectedEntity = undefined;
        }
      },
      ScreenSpaceEventType.LEFT_CLICK
    );

    this.viewer.selectedEntityChanged.addEventListener((entity: Entity) => {
      if (defined(entity)) {
        console.log('Entity selected: ', entity.id);
        this.selectedEntityChanged.emit(entity);
        console.log('emitafterselect', this.selectedEntityChanged);

        if (entity.polyline) {
          console.log(entity.point);
          this.pointEntities.forEach(pointEntity => {
            if (pointEntity.point) {
              pointEntity.point.show = new ConstantProperty(true);
            }
          });
        }
      } else {
        console.log('No entity selected');
        // Hide points when no entity is selected
        this.pointEntities.forEach(pointEntity => {
          if (pointEntity.point) {
            pointEntity.point.show = new ConstantProperty(false);
          }
        });
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
    this.viewer.infoBox.destroy();

    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.enableEntitySelection();

    const scene = this.viewer.scene;
    const globe = scene.globe;

    globe.translucency.frontFaceAlphaByDistance = new NearFarScalar(
      1000.0,
      0.0,
      2000.0,
      1.0
    );

    this.tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );

    console.log(this.center);

    const globeClippingPlanes = new ClippingPlaneCollection({
      modelMatrix: Transforms.eastNorthUpToFixedFrame(this.center),
      planes: [
        new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), this.width),
        new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), this.width),
        new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), this.height),
        new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), this.height),
      ],
      unionClippingRegions: true,
      edgeWidth: 1,
      edgeColor: Color.RED,
      enabled: true,
    });

    const tilesetClippingPlanes = new ClippingPlaneCollection({
      modelMatrix: Transforms.eastNorthUpToFixedFrame(this.center),
      planes: [
        new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), this.width),
        new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), this.width),
        new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), this.height),
        new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), this.height),
      ],
      unionClippingRegions: true,
      edgeWidth: 1,
      edgeColor: Color.RED,
      enabled: true,
    });

    this.viewer.scene.globe.clippingPlanes = globeClippingPlanes;
    this.tileset.clippingPlanes = tilesetClippingPlanes;

    this.viewer.scene.screenSpaceCameraController.enableCollisionDetection =
      false;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
      new NearFarScalar(1.0, 0.7, 5000.0, 0.7);
  }

  

  /**
   * Extracts coordinates from geometries.
   */
  private extractCoordinates(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.geometryService.getGeometry(this.inquiryId).subscribe({
        next: data => {
          if (data) {
            console.log('data received from geometry', data);

            const geoJson = data[0].geojson; // URL or object containing your GeoJSON data

            GeoJsonDataSource.load(geoJson, {
              fill: Color.BLUE.withAlpha(0),
              strokeWidth: 0,
              markerSize: 1, // Size of the marker
              credit: 'Provided by Petters Cable measurement service',
            })
              .then(() => {
                const bottomLeftCoord =
                  data[0].geojson.geometry.coordinates[0][0];
                const topRightCoord =
                  data[0].geojson.geometry.coordinates[0][2];

                const bottomLeft = turf.point(bottomLeftCoord);

                // Calculate width
                const bottomRight = turf.point([
                  topRightCoord[0],
                  bottomLeftCoord[1],
                ]);
                this.width =
                  turf.distance(bottomLeft, bottomRight, { units: 'meters' }) /
                    2 +
                  100;

                // Calculate height
                const topLeft = turf.point([
                  bottomLeftCoord[0],
                  topRightCoord[1],
                ]);
                this.height =
                  turf.distance(bottomLeft, topLeft, { units: 'meters' }) / 2 +
                  100;

                console.log('Width:', this.width, 'Height:', this.height);

                // Extract the center coordinates from the GeoJSON properties
                const centerCoordinates =
                  data[0].geojson.properties.center.coordinates;
                if (!centerCoordinates || centerCoordinates.length < 2) {
                  reject(new Error('Invalid center coordinates'));
                  return;
                }
                this.center = Cartesian3.fromDegrees(
                  centerCoordinates[0],
                  centerCoordinates[1],
                  700
                );
                console.log('Center coordinates:', this.center);

                // Fly to the center coordinates
                this.viewer.camera.flyTo({
                  destination: this.center,
                  orientation: {
                    heading: CesiumMath.toRadians(0.0), // Set the heading of the camera in radians
                    pitch: CesiumMath.toRadians(-90.0), // Set the pitch of the camera in radians
                    roll: 0.0, // Set the roll of the camera
                  },
                  pitchAdjustHeight: 1000,
                });
                this.changeHomeButton(this.viewer, this.center);

                console.log('Finished processing');
                resolve();
              })
              .catch(error => reject(error));
          } else {
            reject(new Error('No data received'));
          }
        },
        error: error => reject(error),
      });
    });
  }

  
  private changeHomeButton(viewer: Viewer, centerCoordinates: Cartesian3) {
    // Change the home button view
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true; // Cancel the default home view
        viewer.camera.flyTo({
          destination: centerCoordinates,
          orientation: {
            heading: CesiumMath.toRadians(0.0), // Set the heading of the camera in radians
            pitch: CesiumMath.toRadians(-90.0), // Set the pitch of the camera in radians
            roll: 0.0, // Set the roll of the camera
          },
          pitchAdjustHeight: 1000,
        });
      }
    );
  }
  private enableEntitySelection() {
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    }, ScreenSpaceEventType.LEFT_DOWN);
  }

  private isDragging = false; // To keep track of the dragging state

  private enableEditing() {
    console.log('enableediting');
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(pickedObject); // Emit the event
        console.log('totitties', this.selectedEntityChanged);

        // Disable camera interactions
        this.viewer.scene.screenSpaceCameraController.enableRotate = false;
        this.viewer.scene.screenSpaceCameraController.enableZoom = false;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
        this.viewer.scene.screenSpaceCameraController.enableLook = false;
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
      if (this.isDragging && defined(this.selectedEntity)) {
        const cartesian = this.viewer.camera.pickEllipsoid(
          movement.endPosition
        );
        if (defined(cartesian)) {
          if (defined(this.selectedEntity.polyline?.positions)) {
            const positions = this.selectedEntity.polyline.positions.getValue(
              JulianDate.now()
            );
            if (positions && positions.length > 0) {
              const offset = Cartesian3.subtract(
                cartesian,
                positions[0],
                new Cartesian3()
              );
              const newPositions = positions.map((position: Cartesian3) =>
                Cartesian3.add(position, offset, new Cartesian3())
              );
              this.selectedEntity.polyline.positions = new CallbackProperty(
                () => newPositions,
                false
              );
            }
          } else if (defined(this.selectedEntity.position)) {
            this.selectedEntity.position = new CallbackProperty(
              () => cartesian,
              false
            ) as unknown as PositionProperty;
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
  }

  private disableEditing() {
    console.log('disableediting');
    if (this.handler) {
      this.handler.destroy();
    }
    this.isDragging = false;
    this.selectedEntity = null;
    // Ensure camera interactions are re-enabled if editing is disabled
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
    this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    this.viewer.scene.screenSpaceCameraController.enableLook = true;
    console.log('disableediting');
    //fkpdofkp
  }

  private loadCables(): void {
    this.cableMeasurementService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(1),
            strokeWidth: 3,
            markerSize: 1, // Size of the marker
            credit: 'Provided by Petters Cable measurement service',
          })
            .then((dataSource: GeoJsonDataSource) => {
              // Add picking and moving functionality to cables
              dataSource.entities.values.forEach(entity => {

                console.log('entity', entity);
                console.log(entity.polyline);
                if (!entity.polyline) {
                  entity.point = new PointGraphics({
                    color: Color.BLUE,
                    pixelSize: 10,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2,
                    show: new ConstantProperty(true),
                  });
                  this.viewer.entities.add(entity);
                }
              });
            })
            .catch(error => {
              console.error('Failed to load GeoJSON data:', error);
            });
          console.log('loadcables');
        }
      },
    });
  }

  private loadCablepoints(): void {
    this.CablePointService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          console.log('data received from service', data[0]);
          const LineStringfeatures = data[0].geojson;

          LineStringfeatures.forEach(geojson => {
            const allPositions: Cartesian3[] = [];

            GeoJsonDataSource.load(geojson, {
              stroke: Color.BLUEVIOLET,
              fill: Color.BLUEVIOLET.withAlpha(1),
              strokeWidth: 3,
              markerSize: 1, // Size of the marker
              credit: 'Provided by Petters Cable measurement service',
            })
              .then((dataSource: GeoJsonDataSource) => {
                console.log('do we have datasource? ', dataSource);
                this.viewer.dataSources.add(dataSource);

                // Add picking and moving functionality to cables
                dataSource.entities.values.forEach(entity => {
                  if (entity.position) {
                    entity.point = new PointGraphics({
                      color: Color.BLUE,
                      pixelSize: 10,
                      outlineColor: Color.WHITE,
                      outlineWidth: 2,
                      show: new ConstantProperty(false),
                    });
                    this.pointEntities.push(entity);
                    const position = entity.position.getValue(JulianDate.now());
                    if (position) {
                      allPositions.push(position);
                    }
                  }
                });
                // Create a polyline that connects the points
                if (allPositions.length > 1) {
                  this.viewer.entities.add({
                    polyline: {
                      positions: allPositions,
                      width: 3,
                      material: Color.BLUEVIOLET,
                    },
                  });
                }
              })
              .catch(error => {
                console.error('Failed to load GeoJSON data:', error);
              });
            console.log('loadcables');
          });
        }
      },
    });
  }

  private loadWorkingArea(): void {
    this.workingAreaService.getArea(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          console.log('data received from service33', data);
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(0.3),
            strokeWidth: 2,
            markerSize: 1, // Size of the marker
            credit: 'Provided by Petters Cable measurement service',
          })
            .then((dataSource: GeoJsonDataSource) => {
              this.viewer.dataSources.add(dataSource);

              // Add picking and moving functionality to cables
              dataSource.entities.values.forEach(entity => {
                this.polygons.push(entity);
                this.viewer.entities.add(entity);
              });
            })
            .catch(error => {
              console.error('Failed to load GeoJSON data:', error);
            });
          console.log('loadcables');
        }
      },
    });
  }

  public updateEntityPosition(cartesian: Cartesian3) {
    console.log('updateentityposition');
    if (this.selectedEntity?.polyline) {
      console.log('before', this.selectedEntity.position);
      if (this.selectedEntity.polyline?.positions) {
        const positions = this.selectedEntity.polyline.positions.getValue(
          JulianDate.now()
        );
        console.log('before', positions);
        const offset = Cartesian3.subtract(
          cartesian,
          positions[0],
          new Cartesian3()
        );
        const newPositions = positions.map((position: Cartesian3) =>
          Cartesian3.add(position, offset, new Cartesian3())
        );
        this.selectedEntity.polyline.positions = new CallbackProperty(
          () => newPositions,
          false
        );
      } else if (this.selectedEntity.position) {
        this.selectedEntity.position = new CallbackProperty(
          () => cartesian,
          false
        ) as unknown as PositionProperty;
        console.log('after', this.selectedEntity.position);
      }
    }
    console.log('updateentityposition');
  }

  public updateGlobeAlpha(alpha: number): void {
    console.log('updateglobealpha');
    // Adjust globe base color translucency
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
    console.log('updateglobealpha');
  }

  setTilesetVisibility(visible: boolean) {
    console.log('settilesetvisibility');
    if (this.tileset) {
      this.tileset.show = visible;
    }
    console.log('settilesetvisibility');
  }
  setPolygonsVisibility(visible: boolean) {
    console.log('setpolygonsetvisibility');
    this.polygons.forEach(polygon => {
      polygon.show = visible;
    });
    console.log('setpolygonsetvisibility');
  }

  setEditingMode(isEditing: boolean) {
    console.log('seteditingmode');
    this.isEditing = isEditing;
    console.log('editign', isEditing);
    if (isEditing) {
      this.enableEditing();
    } else {
      this.disableEditing();
    }
    console.log('seteditingmode');
  }
}
