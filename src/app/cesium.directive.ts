import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  OnInit,
  Output,
  contentChild,
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
  PointGraphics,
  SingleTileImageryProvider,
  Rectangle,
  Camera,
} from 'cesium';
//import { CableMeasurementService } from './services/cable-measurement.service';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
import * as turf from '@turf/turf';
import { ParsedGeometry } from '../models/parsedgeometry-interface';
import proj4 from 'proj4';
import { fromUrl } from 'geotiff';
import { CableMeasurementService } from './services/cable-measurement.service';


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
  bbox: number[] =[];
  center!: Cartesian3;
  isEditing = false;
  private selectedEntity: Entity | null = null;

  private viewer!: Viewer;
  private handler: any;
  tilesetClippingPlanes!: ClippingPlaneCollection;
  globeClippingPlanes!: ClippingPlaneCollection;
  width!: number;
  height!: number;
  

  constructor(
    private el: ElementRef,
    private route: ActivatedRoute,
  ) {}

  // Service for fetching data from the backend
  private cableMeasurementService: CableMeasurementService = inject(
    CableMeasurementService
  );
  private geometryService: GeometryService = inject(
    GeometryService
  );

  async ngOnInit(): Promise<void> {
    console.log('ngoninit')
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    
    //this.filterMapByInquiryId(this.inquiryId);
    
 this.extractCoordinates()
 console.log('1',this.height)

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.initializeViewer();
    console.log('2',this.height)
    this.loadCables();

    

    console.log('3',this.height)



    const cameraMoveEndListener = () => {
      //this.extractBbox();
      this.viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener);
    };
    this.viewer.camera.moveEnd.addEventListener(cameraMoveEndListener);
  

    // Set up a screen space event handler to select entities and create a popup
    this.viewer.screenSpaceEventHandler.setInputAction((movement: { position: Cartesian2; }) => {
      var pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        var entity = pickedObject.id;
        this.viewer.selectedEntity = entity;  // Set the selected entity
      } else {
        this.viewer.selectedEntity = undefined;

      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.viewer.selectedEntityChanged.addEventListener((entity: Entity) => {
      if (defined(entity)) {
        this.selectedEntityChanged.emit(entity)
      } else {
      }
    });
    console.log('4',this.height)
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

     
    

    

    const distance = 500.0;

    this.tileset = this.viewer.scene.primitives.add(
      await Cesium3DTileset.fromIonAssetId(96188)
    );

    console.log(this.center)

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


    //   const mcoords = this.coords.map(coord => 
    //     convertDegreesToMeters(coord[0], coord[1])

    // );

    


   
  }

  /**
   * Filters the map by inquiry ID and fetches geometries.
   */
  private filterMapByInquiryId(inquiryId: number | undefined): void {
    


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
              stroke: Color.BLUE,
              fill: Color.BLUE.withAlpha(0.5),
              strokeWidth: 3,
              markerSize: 1, // Size of the marker
              credit: "Provided by Petters Cable measurement service",
            }).then((dataSource: GeoJsonDataSource) => {
              this.viewer.dataSources.add(dataSource);
  
              const bottomLeftCoord = data[0].geojson.geometry.coordinates[0][0];
              const topRightCoord = data[0].geojson.geometry.coordinates[0][2];
  
              const bottomLeft = turf.point(bottomLeftCoord);
              const topRight = turf.point(topRightCoord);
  
              // Calculate width
              const bottomRight = turf.point([topRightCoord[0], bottomLeftCoord[1]]);
              this.width = (turf.distance(bottomLeft, bottomRight, { units: 'meters' }) / 2) +100;
  
              // Calculate height
              const topLeft = turf.point([bottomLeftCoord[0], topRightCoord[1]]);
              this.height = (turf.distance(bottomLeft, topLeft, { units: 'meters' }) / 2) +100;
  
              console.log('Width:', this.width, 'Height:', this.height);
  
              // Extract the center coordinates from the GeoJSON properties
            const centerCoordinates = data[0].geojson.properties.center.coordinates;
            if (!centerCoordinates || centerCoordinates.length < 2) {
              reject(new Error('Invalid center coordinates'));
              return;
            }
            this.center = Cartesian3.fromDegrees(centerCoordinates[0], centerCoordinates[1],700);
            console.log('Center coordinates:', this.center);

            // Fly to the center coordinates
            this.viewer.camera.flyTo({
              destination: this.center,
              orientation: {
                heading: CesiumMath.toRadians(0.0), // Set the heading of the camera in radians
                pitch: CesiumMath.toRadians(-90.0), // Set the pitch of the camera in radians
                roll: 0.0 // Set the roll of the camera
              },
              pitchAdjustHeight: 1000
            });
  
              console.log('Finished processing');
              resolve();
            }).catch(error => reject(error));
          } else {
            reject(new Error('No data received'));
          }
        },
        error: error => reject(error)
      });
    });
  }
  /**
   * Updates the map view to fit the extracted coordinates.
   */
  private updateMap(viewer: Viewer): void {
      // Camera.DEFAULT_VIEW_RECTANGLE = rectangle
      // this.changeHomeButton(viewer, rectangle);
    }
  
  // /**
  //  * Extracts the bounding box of the current view based on clipping planes and emits the coordinates.
  //  */
  // private extractBbox(): void {
  //   const clippingPlanes = this.viewer.scene.globe.clippingPlanes;
  //   if (clippingPlanes) {
  //     const eastPlane = clippingPlanes.get(0);
  //     const westPlane = clippingPlanes.get(1);
  //     const northPlane = clippingPlanes.get(2);
  //     const southPlane = clippingPlanes.get(3);

  //     const distanceEast = eastPlane.distance;
  //     const distanceWest = westPlane.distance;
  //     const distanceNorth = northPlane.distance;
  //     const distanceSouth = southPlane.distance;

  //     // Calculate the coordinates based on the clipping distances and center
  //     const centerCartographic =
  //       this.viewer.scene.globe.ellipsoid.cartesianToCartographic(this.center);
  //     const centerLongitude = CesiumMath.toDegrees(
  //       centerCartographic.longitude
  //     );
  //     const centerLatitude = CesiumMath.toDegrees(centerCartographic.latitude);

  //     // Use proj4 to transform distances to geographic coordinates
  //     const center = proj4('EPSG:4326', 'EPSG:25833', [
  //       centerLongitude,
  //       centerLatitude,
  //     ]);

  //     const west = proj4('EPSG:25833', 'EPSG:4326', [
  //       center[0] - distanceWest,
  //       center[1],
  //     ]);
  //     const east = proj4('EPSG:25833', 'EPSG:4326', [
  //       center[0] + distanceEast,
  //       center[1],
  //     ]);
  //     const south = proj4('EPSG:25833', 'EPSG:4326', [
  //       center[0],
  //       center[1] - distanceSouth,
  //     ]);
  //     const north = proj4('EPSG:25833', 'EPSG:4326', [
  //       center[0],
  //       center[1] + distanceNorth,
  //     ]);

  //     const lowerLeft = proj4('EPSG:4326', 'EPSG:25833', [west[0], south[1]]);
  //     const upperRight = proj4('EPSG:4326', 'EPSG:25833', [east[0], north[1]]);
  //     const bbox = `${lowerLeft[0]},${lowerLeft[1]},${upperRight[0]},${upperRight[1]}`;

  //     this.bboxExtracted.emit(bbox);
  //   } else {
  //     console.error('No clipping planes found.');
  //   }
  // }

  /**
   * Plots a polygon on the viewer.
   */
  private plotPolygon(coordinates: Cartesian3[], viewer: Viewer): void {

    console.log('plotpolygon')
    const polygonEntity = viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(coordinates),
        material: Color.RED.withAlpha(0.5),
      },
    });
    this.polygons.push(polygonEntity);
    console.log('polygons')
    console.log('plotpolygon')
  }
  private changeHomeButton(viewer: Viewer, retangle: Rectangle) {
    console.log('changehome')
    // Change the home button view
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true; // Cancel the default home view
        Camera.DEFAULT_VIEW_RECTANGLE = retangle;
      }
    );
    console.log('changehome')
  }
  private enableEntitySelection() {
    console.log('enablentity')
    this.handler.setInputAction((movement: any) => {
      const pickedObject = this.viewer.scene.pick(movement.position);
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    }, ScreenSpaceEventType.LEFT_DOWN);
    console.log('enablentity')
  }

 

private isDragging = false; // To keep track of the dragging state

private enableEditing() {
  console.log('enableediting')
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
  }, ScreenSpaceEventType.LEFT_CLICK);
  console.log('enableediting')
}


private disableEditing() {
  console.log('disableediting')
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
    console.log('disableediting')
    //fkpdofkp
}

private loadCables(): void {
  this.cableMeasurementService.getData(this.inquiryId).subscribe({
    next: data => {
      if (data) {
        console.log('data received from service', data);
        GeoJsonDataSource.load(data[0].geojson, {
          stroke: Color.BLUE,
          fill: Color.BLUE.withAlpha(1),
          strokeWidth: 3,
          markerSize: 1, // Size of the marker
          credit: "Provided by Petters Cable measurement service",
        })
        .then((dataSource: GeoJsonDataSource) => {
          this.viewer.dataSources.add(dataSource);

          // Add picking and moving functionality to cables
          dataSource.entities.values.forEach(entity => {
            if (entity.polyline?.positions) {
              const coordinates = entity.polyline.positions.getValue(JulianDate.now());
              coordinates.forEach((position: any, index: any) => {
                const pointEntity = new Entity({
                  position,
                  point: new PointGraphics({
                    color: Color.BLUE,
                    pixelSize: 10,
                    outlineColor: Color.WHITE,
                    outlineWidth: 2,
                  }),
                });
                this.viewer.entities.add(pointEntity);
              });
            }
            if (entity.position) {
              entity.point = new PointGraphics({
                color: Color.BLUE,
                pixelSize: 10,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
              });
            }
          });
        })
        .catch(error => {
          console.error('Failed to load GeoJSON data:', error);
        });
        console.log('loadcables');
      }
    }
  });
}



public updateEntityPosition(cartesian: Cartesian3) {
  console.log('updateentityposition')
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
  console.log('updateentityposition')
}


  public updateGlobeAlpha(alpha: number): void {
    console.log('updateglobealpha')
    // Adjust globe base color translucency
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
      console.log('updateglobealpha')
  }

  setTilesetVisibility(visible: boolean) {
    console.log('settilesetvisibility')
    if (this.tileset) {
      this.tileset.show = visible;
    }
    console.log('settilesetvisibility')
  }
  setPolygonsVisibility(visible: boolean) {
    console.log('setpolygonsetvisibility')
    this.polygons.forEach(polygon => {
      polygon.show = visible;
    });
    console.log('setpolygonsetvisibility')
  }

  setEditingMode(isEditing: boolean) {
    console.log('seteditingmode')
    this.isEditing = isEditing;
    console.log('editign', isEditing)
    if (isEditing) {
      this.enableEditing();
    } else {
      this.disableEditing();
    }
    console.log('seteditingmode')
  }

  constructGeoTIFFUrl(bbox: any) {
    const baseUrl = 'https://wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25833';
    const params = new URLSearchParams({
        SERVICE: 'WCS',
        VERSION: '1.0.0',
        REQUEST: 'GetCoverage',
        FORMAT: 'GeoTIFF',
        COVERAGE: 'nhm_dtm_topo_25833',
        BBOX: bbox.join(','),
        CRS: 'EPSG:25833',
        RESPONSE_CRS: 'EPSG:25833',
        WIDTH: '440',
        HEIGHT: '566'
    });
    return `${baseUrl}?${params.toString()}`;
}
async loadGeoTIFF(url: any) {
  try {
      // Fetch the GeoTIFF
      const tiff = await fromUrl(url);
      const image = await tiff.getImage();
      
      // Read the raster data
      const raster = await image.readRasters();
      const values = raster[0]; // Assuming single band GeoTIFF

      // Get dimensions and bounding box
      const width = image.getWidth();
      const height = image.getHeight();
      const bbox = image.getBoundingBox(); // Get bounding box from image

      // Create a canvas to draw the raster data
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context!==null) {
      const imageData = context.createImageData(width, height);

      if (Array.isArray(values) || values instanceof Float32Array || values instanceof Uint8Array) {
        // Find min and max values for scaling
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        // Populate the image data
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const scaledValue = ((value - min) / range) * 255;
            imageData.data[i * 4] = scaledValue; // Red
            imageData.data[i * 4 + 1] = scaledValue; // Green
            imageData.data[i * 4 + 2] = scaledValue; // Blue
            imageData.data[i * 4 + 3] = 255; // Alpha
        }

        context.putImageData(imageData, 0, 0);

        // Create an imagery provider from the canvas
        const imageryProvider = new SingleTileImageryProvider({
            url: canvas.toDataURL(),
            rectangle: Rectangle.fromDegrees(
                bbox[0], bbox[1], bbox[2], bbox[3]
            )
        });
        // Add the imagery layer to the Cesium viewer
      this.viewer.scene.imageryLayers.addImageryProvider(imageryProvider); }
}

      
  } catch (error) {
      console.error('Error loading GeoTIFF:', error);
  }
}
}
function convertDegreesToMeters(lon: any, lat: any) {
  const proj4 = window.proj4;
  const fromProj = 'EPSG:4326';
  const toProj = 'EPSG:25833';
  const [x, y] = proj4(fromProj, toProj, [lon, lat]);
  return [x, y];
}

