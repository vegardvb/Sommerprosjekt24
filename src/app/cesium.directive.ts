import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
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
  ScreenSpaceEventType,
  defined,
  ScreenSpaceEventHandler,
  JulianDate,
  CallbackProperty,
  PositionProperty,
  PointGraphics,
  ConstantProperty,
  CesiumTerrainProvider,
  GeoJsonDataSource,
  Cartesian2,
} from 'cesium';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import { ParsedGeometry } from '../models/parsedgeometry-interface';
import proj4 from 'proj4';
import { CableMeasurementService } from './services/cable-measurement.service';
import { CablePointsService } from './services/cable_points.service';
import { WorkingAreaService } from './services/workingarea_service';
import * as turf from '@turf/turf';

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
  coords: number[][][] = [];
  bbox: number[] = [];
  pointEntities: Entity[] = [];
  center!: Cartesian3;
  isEditing = false;
  private selectedEntity: Entity | null = null;
  private viewer!: Viewer;
  private handler!: ScreenSpaceEventHandler;
  private isDragging = false;
  tilesetClippingPlanes!: ClippingPlaneCollection;
  globeClippingPlanes!: ClippingPlaneCollection;
  width!: number;
  height!: number;

  constructor(
    private el: ElementRef,
    private route: ActivatedRoute,
    private cableMeasurementService: CableMeasurementService,
    private geometryService: GeometryService,
    private workingAreaService: WorkingAreaService,
    private cablePointsService: CablePointsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    this.filterMapByInquiryId(this.inquiryId);

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.initializeViewer();

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
   * Initializes the Cesium Viewer and adds the tileset and clipping planes.
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

    this.tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );

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
            const geoJson = data[0].geojson; // URL or object containing your GeoJSON data

            GeoJsonDataSource.load(geoJson, {
              fill: Color.BLUE.withAlpha(0),
              strokeWidth: 0,
              markerSize: 1, // Size of the marker
              credit: 'Provided by Cable measurement service',
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
                const boundingSphere = new BoundingSphere(this.center, 0);
                this.changeHomeButton(this.viewer, boundingSphere);

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

  private filterMapByInquiryId(inquiryId: number | undefined): void {
    if (inquiryId) {
      this.geometryService.getGeometry(inquiryId).subscribe({
        next: (response: Geometry[]) => {
          this.products = response.map(geometry => {
            const parsedGeometry = geometry.geojson as ParsedGeometry;
            return { id: geometry.id, geojson: parsedGeometry };
          });

          this.extractCoordinates();
          if (this.coords.length > 0) {
            this.coords.forEach((coordSet: number[][]) => {
              const polygonCoordinates = coordSet.map((coordPair: number[]) =>
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

  private enableEntitySelection() {
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    }, ScreenSpaceEventType.LEFT_DOWN);
  }

  private enableEditing() {
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(this.selectedEntity); // Emit the event

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

  private loadCables(): void {
    this.cableMeasurementService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(1),
            strokeWidth: 3,
            markerSize: 1, // Size of the marker
            credit: 'Provided by Cable measurement service',
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

  private loadCablePoints(): void {
    this.cablePointsService.getData(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          const LineStringfeatures = data[0].geojson;

          LineStringfeatures.forEach(geojson => {
            const allPositions: Cartesian3[] = [];

            GeoJsonDataSource.load(geojson, {
              stroke: Color.BLUEVIOLET,
              fill: Color.BLUEVIOLET.withAlpha(1),
              strokeWidth: 3,
              markerSize: 1, // Size of the marker
              credit: 'Provided by Cable measurement service',
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

  private loadWorkingArea(): void {
    this.workingAreaService.getArea(this.inquiryId).subscribe({
      next: data => {
        if (data) {
          GeoJsonDataSource.load(data[0].geojson, {
            stroke: Color.BLUE,
            fill: Color.BLUE.withAlpha(0.3),
            strokeWidth: 2,
            markerSize: 1, // Size of the marker
            credit: 'Provided by Cable measurement service',
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

  public setEditingMode(isEditing: boolean) {
    this.isEditing = isEditing;
    if (isEditing) {
      this.enableEditing();
    } else {
      this.disableEditing();
    }
  }
}
