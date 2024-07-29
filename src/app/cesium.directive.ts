import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
  Inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  ClippingPlane,
  ClippingPlaneCollection,
  defined,
  CallbackProperty,
  PointGraphics,
  ConstantProperty,
  CesiumTerrainProvider,
  JulianDate,
  NearFarScalar,
  PositionProperty,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Transforms,
  Math as CesiumMath,
  Entity,
  GeoJsonDataSource,
  Viewer,
  HeightReference,
  Property,
} from 'cesium';
import { CableMeasurementService } from './services/cable-measurement.service';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import proj4 from 'proj4';
import * as turf from '@turf/turf';
import { Subscription, lastValueFrom } from 'rxjs';
import { CablePointsService } from './services/cable-points.service';
import { ClickedPointService } from './services/clickedpoint.service';
import { WorkingAreaService } from './services/workingarea.service';
import { CesiumImageService } from './services/image/cesium-image.service';
import { CesiumInteractionService } from './services/cesium.interaction.service';

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
export class CesiumDirective implements OnInit, OnDestroy, OnChanges {
  @Input()
  alpha!: number;
  @Input() geoJson!: string;
  tileset!: Cesium3DTileset;
  polygons: Entity[] = [];
  @Output() bboxExtracted = new EventEmitter<string>();
  @Output() selectedEntityChanged = new EventEmitter<Entity>();

  private inquiryId: number | undefined;
  private pointEntities: Entity[] = [];
  private center!: Cartesian3;
  private selectedEntity: Entity | null = null;

  private viewer!: Viewer;
  private handler!: ScreenSpaceEventHandler;
  private width!: number;
  private height!: number;
  private clickedPointId: number | null = null;
  private latitude: string | null = null;
  private longitude: string | null = null;
  private subscriptions: Subscription = new Subscription();
  private isDragging = false; // To keep track of the dragging state
  isEditing = false;

  constructor(
    private el: ElementRef,
    private route: ActivatedRoute,
    @Inject(ClickedPointService)
    private clickedPointService: ClickedPointService,
    private cesiumInteractionService: CesiumInteractionService,
    private cesiumImageService: CesiumImageService,
    @Inject(CableMeasurementService)
    private cableMeasurementService: CableMeasurementService,
    private geometryService: GeometryService,
    private workingAreaService: WorkingAreaService,
    private cablePointService: CablePointsService
  ) {}

  /**
   * Initializes the component after Angular has initialized all data-bound properties.
   * This method is called once after the first `ngOnChanges` method is called.
   * @returns A promise that resolves when the initialization is complete.
   */
  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    await this.initializeViewer();
    await this.extractCoordinates();
    this.initializeGlobeClippingPlanes();
    await this.loadCables();
    await this.loadWorkingArea();
    await this.loadCablePoints();
    this.cesiumImageService.loadImages(this.viewer, this.inquiryId);
    this.cesiumInteractionService.setupClickHandler(this.viewer);

    const cameraMoveEndListener = () => {
      this.extractBbox();
      this.viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener);
    };
    this.viewer.camera.moveEnd.addEventListener(cameraMoveEndListener);
    const infobox = this.viewer.infoBox;
    infobox.destroy();

    // Set up a screen space event handler to select entities and create a popup
    this.viewer.screenSpaceEventHandler.setInputAction(
      (movement: { position: Cartesian2 }) => {
        const pickedObject = this.viewer.scene.pick(movement.position);
        if (defined(pickedObject)) {
          const entity = pickedObject.id;
          this.viewer.selectedEntity = entity; // Set the selected entity
          this.clickedPointId =
            this.viewer.selectedEntity?.properties?.['point_id']._value;

          if (this.clickedPointId) {
            this.clickedPointService.setClickedPointId(this.clickedPointId);
          }
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
        this.pointEntities.forEach(pointEntity => {
          if (pointEntity.point) {
            pointEntity.point.show = new ConstantProperty(false);
          }
        });
      }
    });

    this.subscriptions.add(
      this.clickedPointService.latitude$.subscribe(lat => {
        this.latitude = lat;
      })
    );

    this.subscriptions.add(
      this.clickedPointService.longitude$.subscribe(lon => {
        this.longitude = lon;
      })
    );

    this.subscriptions.add(
      this.clickedPointService.zoomTrigger$.subscribe(trigger => {
        if (trigger) {
          this.zoomToCoordinates();
          this.clickedPointService.resetCoordinates();
          this.clickedPointService.resetZoomTrigger();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['geoJson']) {
      this.handleGeoJsonUpload(changes['geoJson'].currentValue);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.cesiumInteractionService.dispose();
  }

  private zoomToCoordinates() {
    if (this.latitude && this.longitude) {
      const position = Cartesian3.fromDegrees(
        parseFloat(this.longitude),
        parseFloat(this.latitude),
        130
      );
      this.viewer.camera.flyTo({
        destination: position,
        duration: 3,
      });
    } else {
      console.warn('Latitude or longitude is not defined');
    }
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
  }

  private initializeGlobeClippingPlanes(): void {
    if (!this.center) {
      console.error(
        'Center is not defined. Clipping planes initialization skipped.'
      );
      return;
    }

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
      if (
        data &&
        data[0] &&
        data[0].geojson &&
        data[0].geojson.properties &&
        data[0].geojson.properties.center &&
        data[0].geojson.properties.center.coordinates
      ) {
        this.setCenterCoordinates(
          data[0].geojson.properties.center.coordinates
        );
      } else {
        console.error('Invalid data or missing coordinates');
      }
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
        this.clickedPointId =
          this.selectedEntity?.properties?.['point_id']._value;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    }, ScreenSpaceEventType.LEFT_DOWN);
  }

  /**
   * Enables editing functionality for the Cesium viewer.
   * Allows the user to interact with entities on the viewer, such as selecting and dragging them.
   */
  private enableEditing() {
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // let originalCoordinates: Cartographic | undefined;

    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;

        this.selectedEntityChanged.emit(this.selectedEntity); // Emit the event

        // if (defined(this.selectedEntity.position)) {
        //   const originalCoordinatesCartesian =
        //     this.selectedEntity.position.getValue(
        //       JulianDate.now()
        //     ) as Cartesian3;
        //   originalCoordinates = Cartographic.fromCartesian(
        //     originalCoordinatesCartesian
        //   );
        //   //console.log('Original Coordinates:', originalCoordinates);
        // }

        // Disable camera interactions
        this.disableCameraInteractions();
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction((movement: { endPosition: Cartesian2 }) => {
      if (this.isDragging && defined(this.selectedEntity)) {
        const cartesian = this.viewer.camera.pickEllipsoid(
          movement.endPosition
        );
        // if (originalCoordinates && cartesian) {
        //   const cartographic = Cartographic.fromCartesian(cartesian);
        //   cartographic.height = originalCoordinates.height;
        //   cartesian = Cartesian3.fromRadians(
        //     cartographic.latitude,
        //     cartographic.longitude,
        //     cartographic.height
        //   );
        // }
        if (defined(cartesian)) {
          if (defined(this.selectedEntity.position)) {
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
    }, ScreenSpaceEventType.LEFT_UP);
  }

  private disableEditing() {
    if (this.handler) {
      this.handler.destroy();
    }
    this.isDragging = false;
    this.selectedEntity = null;
    this.enableCameraInteractions();
  }

  /**
   * Loads the cables data and visualizes them on the Cesium viewer.
   */
  private async loadCables(): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.cableMeasurementService.getData(this.inquiryId)
      );
      if (data) {
        const geoJson = data[0].geojson;
        const dataSource = await GeoJsonDataSource.load(geoJson, {
          stroke: Color.BLUE,
          fill: Color.BLUE.withAlpha(1),
          strokeWidth: 3,
          markerSize: 1, // Size of the marker
          credit: "Provided by Petter's Cable measurement service",
        });

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
      }
    } catch (error) {
      console.error('Failed to load cables data:', error);
    }
  }

  /**
   * Loads the cable points data and visualizes it in Cesium.
   * @returns A promise that resolves when the cable points data is loaded and visualized.
   */
  private async loadCablePoints(): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.cablePointService.getData(this.inquiryId)
      );
      if (data) {
        const lineStringFeatures = data[0].geojson;

        for (const geojson of lineStringFeatures) {
          const allPositions: Cartesian3[] = [];
          const dataSource = await GeoJsonDataSource.load(geojson, {
            stroke: Color.BLUEVIOLET,
            fill: Color.BLUEVIOLET.withAlpha(1),
            strokeWidth: 3,
            markerSize: 1, // Size of the marker
            credit: "Provided by Petter's Cable measurement service",
          });

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
        }
      }
    } catch (error) {
      console.error('Failed to load cable points data:', error);
    }
  }

  /**
   * Loads the working area data and displays it on the Cesium viewer.
   */
  private async loadWorkingArea(): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.workingAreaService.getArea(this.inquiryId)
      );
      if (data) {
        const geoJson = data[0].geojson;
        const dataSource = await GeoJsonDataSource.load(geoJson, {
          stroke: Color.PALEVIOLETRED,
          fill: Color.PALEVIOLETRED.withAlpha(0.1),
          strokeWidth: 2,
          markerSize: 1, // Size of the marker
          credit: "Provided by Petter's Cable measurement service",
        });

        this.viewer.dataSources.add(dataSource);

        // Add picking and moving functionality to cables
        dataSource.entities.values.forEach(entity => {
          if (entity.polygon) {
            entity.polygon.heightReference =
              HeightReference.CLAMP_TO_GROUND as unknown as Property;
            this.polygons.push(entity);
            this.viewer.entities.add(entity);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load working area data:', error);
    }
  }
  /**
   * Updates the position of the selected entity.
   * If the selected entity has a polyline, it updates the positions of the polyline based on the provided cartesian coordinates.
   * If the selected entity does not have a polyline but has a position, it updates the position of the entity itself.
   * @param cartesian The new cartesian coordinates to update the entity position.
   */
  public updateEntityPosition(cartesian: Cartesian3) {
    if (this.selectedEntity?.position) {
      this.selectedEntity.position = new CallbackProperty(
        () => cartesian,
        false
      ) as unknown as PositionProperty;
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
    if (isEditing) {
      this.enableEditing();
    } else {
      this.disableEditing();
    }
  }

  /**
   * Handles the upload of GeoJSON data and displays it on the Cesium viewer.
   * @param geoJsonText - The GeoJSON data to be loaded.
   */
  public async handleGeoJsonUpload(geoJsonText: object) {
    try {
      const dataSource = await GeoJsonDataSource.load(geoJsonText, {
        stroke: Color.TURQUOISE,
        fill: Color.TURQUOISE.withAlpha(1),
        strokeWidth: 3,
        markerSize: 1, // Size of the marker
        credit: 'Provided by Jess',
      });

      this.viewer.dataSources.add(dataSource);
      this.viewer.zoomTo(dataSource);

      // Add picking and moving functionality to cables
      dataSource.entities.values.forEach(entity => {
        if (entity.polygon) {
          entity.polygon.heightReference =
            HeightReference.CLAMP_TO_GROUND as unknown as Property;
          this.polygons.push(entity);
          this.viewer.entities.add(entity);
        }
      });
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
      // Optionally, add user feedback or additional error handling here
    }
  }

  /**
   * Disables camera interactions.
   */
  private disableCameraInteractions() {
    this.viewer.scene.screenSpaceCameraController.enableRotate = false;
    this.viewer.scene.screenSpaceCameraController.enableZoom = false;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
    this.viewer.scene.screenSpaceCameraController.enableLook = false;
  }

  /**
   * Enables camera interactions.
   */
  private enableCameraInteractions() {
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.viewer.scene.screenSpaceCameraController.enableZoom = true;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
    this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    this.viewer.scene.screenSpaceCameraController.enableLook = true;
  }
}
