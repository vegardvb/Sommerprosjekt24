import {
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  CesiumTerrainProvider,
  Color,
  ConstantProperty,
  ClippingPlane,
  ClippingPlaneCollection,
  defined,
  Entity,
  GeoJsonDataSource,
  JulianDate,
  Math as CesiumMath,
  NearFarScalar,
  PositionProperty,
  PointGraphics,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Transforms,
  Viewer,
} from 'cesium';
import { ActivatedRoute } from '@angular/router';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { CableMeasurementService } from './services/cable-measurement.service';
import { CablePointsService } from './services/cable_points.service';
import proj4 from 'proj4';
import * as turf from '@turf/turf';
import { WorkingAreaService } from './services/workingarea_service';
import { lastValueFrom } from 'rxjs';

// Define the source and target projections
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs');

@Directive({
  selector: '[appCesium]',
  standalone: true,
})
/**
 * Represents a Cesium directive that provides a Cesium viewer for 3D visualization of a cable network.
 * This directive initializes the Cesium viewer, loads the necessary data, and handles user interactions.
 */
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
  private cablePointService: CablePointsService = inject(CablePointsService);

  /**
   * Initializes the component after Angular has initialized all data-bound properties.
   * This method is called once after the first `ngOnChanges` method is called.
   * @returns A promise that resolves when the initialization is complete.
   */
  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    this.initializeViewer();
    this.extractCoordinates();
    this.loadCables();
    this.loadWorkingArea();
    this.loadCablePoints();

    const cameraMoveEndListener = () => {
      this.extractBbox();
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
        this.selectedEntityChanged.emit(entity);
        if (entity.polyline) {
          this.pointEntities.forEach(pointEntity => {
            if (pointEntity.point) {
              pointEntity.point.show = new ConstantProperty(true);
            }
          });
        }
      } else {
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
   * Initializes the Cesium viewer and sets up the necessary configurations.
   * @returns A promise that resolves when the viewer is initialized.
   */
  private async initializeViewer(): Promise<void> {
    this.viewer = new Viewer(this.el.nativeElement, {
      timeline: false,
      animation: false,
      sceneModePicker: false,
    });

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

    try {
      this.tileset = await Cesium3DTileset.fromIonAssetId(96188);
      this.viewer.scene.primitives.add(this.tileset);
    } catch (error) {
      console.error('Error loading Cesium tileset:', error);
    }

    this.initializeGlobeClippingPlanes();
    this.initializeTilesetClippingPlanes();
  }

  private initializeGlobeClippingPlanes(): void {
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

    this.viewer.scene.globe.clippingPlanes = globeClippingPlanes;
  }

  private initializeTilesetClippingPlanes(): void {
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

    this.tileset.clippingPlanes = tilesetClippingPlanes;
  }

  /**
   * Extracts coordinates from the geometry service and performs calculations based on the extracted data.
   * @returns A promise that resolves when the coordinates have been extracted and calculations have been performed.
   */
  private async extractCoordinates(): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.geometryService.getGeometry(this.inquiryId)
      );
      if (!data || !data[0].geojson) throw new Error('No data received');

      const geoJson = data[0].geojson;
      await GeoJsonDataSource.load(geoJson, {
        fill: Color.BLUE.withAlpha(0),
        strokeWidth: 0,
        markerSize: 1,
        credit: "Provided by Petter's Cable measurement service",
      });

      this.calculateDimensions(data[0].geojson.geometry.coordinates);
      this.setCenterCoordinates(data[0].geojson.properties.center.coordinates);
    } catch (error) {
      console.error('Error extracting coordinates:', error);
    }
  }

  private calculateDimensions(coordinates: number[][][]): void {
    const bottomLeftCoord = coordinates[0][0];
    const topRightCoord = coordinates[0][2];
    const bottomLeft = turf.point(bottomLeftCoord);

    const bottomRight = turf.point([topRightCoord[0], bottomLeftCoord[1]]);
    this.width =
      turf.distance(bottomLeft, bottomRight, { units: 'meters' }) / 2 + 100;

    const topLeft = turf.point([bottomLeftCoord[0], topRightCoord[1]]);
    this.height =
      turf.distance(bottomLeft, topLeft, { units: 'meters' }) / 2 + 100;
  }

  private setCenterCoordinates(centerCoordinates: number[]): void {
    if (!centerCoordinates || centerCoordinates.length < 2)
      throw new Error('Invalid center coordinates');

    this.center = Cartesian3.fromDegrees(
      centerCoordinates[0],
      centerCoordinates[1],
      700
    );

    this.viewer.camera.flyTo({
      destination: this.center,
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-90.0),
        roll: 0.0,
      },
      pitchAdjustHeight: 1000,
    });
    this.changeHomeButton(this.viewer, this.center);
  }

  /**
   * Extracts the bounding box (bbox) coordinates based on the clipping distances and center.
   * Emits the bbox as a string using the `bboxExtracted` event.
   * If no clipping planes are found, an error message is logged to the console.
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
   * Changes the home button view of the Cesium viewer.
   * @param viewer - The Cesium viewer instance.
   * @param centerCoordinates - The Cartesian3 coordinates representing the center of the view.
   */
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

  /**
   * Enables entity selection by adding an input action to the handler.
   */
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

  /**
   * Enables editing functionality for the Cesium viewer.
   * Allows the user to interact with entities on the viewer, such as selecting and dragging them.
   */
  private enableEditing() {
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);

    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(pickedObject); // Emit the event

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
  }

  /**
   * Loads the cables data and visualizes them on the Cesium viewer.
   */
  private loadCables(): void {
    this.cableMeasurementService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(1),
            strokeWidth: 3,
            markerSize: 1, // Size of the marker
            credit: "Provided by Petter's Cable measurement service",
          })
            .then((dataSource: GeoJsonDataSource) => {
              // Add picking and moving functionality to cables
              dataSource.entities.values.forEach(entity => {
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
        }
      },
    });
  }

  /**
   * Loads cable points data and visualizes them on the Cesium viewer.
   * @private
   * @returns {void}
   */
  private loadCablePoints(): void {
    this.cablePointService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          const lineStringFeatures = data[0].geojson;

          lineStringFeatures.forEach(geojson => {
            const allPositions: Cartesian3[] = [];

            GeoJsonDataSource.load(geojson, {
              stroke: Color.BLUEVIOLET,
              fill: Color.BLUEVIOLET.withAlpha(1),
              strokeWidth: 3,
              markerSize: 1, // Size of the marker
              credit: "Provided by Petter's Cable measurement service",
            })
              .then((dataSource: GeoJsonDataSource) => {
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
          });
        }
      },
    });
  }

  /**
   * Loads the working area data and displays it on the Cesium viewer.
   */
  private loadWorkingArea(): void {
    this.workingAreaService.getArea(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(0.3),
            strokeWidth: 2,
            markerSize: 1, // Size of the marker
            credit: "Provided by Petter's Cable measurement service",
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
        }
      },
    });
  }

  /**
   * Updates the position of the selected entity.
   * If the selected entity has a polyline, it updates the positions of the polyline based on the provided cartesian coordinates.
   * If the selected entity does not have a polyline but has a position, it updates the position of the entity itself.
   * @param cartesian The new cartesian coordinates to update the entity position.
   */
  public updateEntityPosition(cartesian: Cartesian3) {
    if (this.selectedEntity?.polyline) {
      if (this.selectedEntity.polyline?.positions) {
        const positions = this.selectedEntity.polyline.positions.getValue(
          JulianDate.now()
        );
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
      }
    }
  }

  /**
   * Updates the alpha value of the globe.
   * @param alpha - The alpha value to set.
   */
  public updateGlobeAlpha(alpha: number): void {
    // Adjust globe base color translucency
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
  }

  /**
   * Sets the visibility of the tileset.
   * @param visible - A boolean value indicating whether the tileset should be visible or not.
   */
  setTilesetVisibility(visible: boolean) {
    if (this.tileset) {
      this.tileset.show = visible;
    }
  }
  /**
   * Sets the visibility of all polygons in the directive.
   * @param visible - A boolean value indicating whether the polygons should be visible or not.
   */
  setPolygonsVisibility(visible: boolean) {
    this.polygons.forEach(polygon => {
      polygon.show = visible;
    });
  }

  /**
   * Loads terrain from the specified URL and sets it as the terrain provider for the Cesium viewer.
   * @param url - The URL of the terrain data.
   * @returns A promise that resolves when the terrain is successfully loaded.
   */
  public async loadTerrainFromUrl(url: string): Promise<void> {
    try {
      const terrainProvider = await CesiumTerrainProvider.fromUrl(url, {
        requestVertexNormals: true,
      });
      this.viewer.terrainProvider = terrainProvider;
    } catch (error) {
      console.error('Error loading terrain into Cesium:', error);
    }
  }

  /**
   * Sets the editing mode for the Cesium directive.
   * @param isEditing - A boolean value indicating whether the editing mode should be enabled or disabled.
   */
  public setEditingMode(isEditing: boolean) {
    this.isEditing = isEditing;
    if (isEditing) {
      this.enableEditing();
    } else {
      this.disableEditing();
    }
  }
}
