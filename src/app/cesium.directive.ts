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
} from 'cesium';
//import { CableMeasurementService } from './services/cable-measurement.service';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';

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
    console.log('ngoninit')
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    this.filterMapByInquiryId(this.inquiryId);
 

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    this.initializeViewer();
    this.loadCables();



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


     const globeClippingPlanes = new ClippingPlaneCollection({
       modelMatrix: Transforms.eastNorthUpToFixedFrame(this.center),
       planes: [
         new ClippingPlane(new Cartesian3(1.0, 0.0, 0.0), distance),
         new ClippingPlane(new Cartesian3(-1.0, 0.0, 0.0), distance),
         new ClippingPlane(new Cartesian3(0.0, 1.0, 0.0), distance),
         new ClippingPlane(new Cartesian3(0.0, -1.0, 0.0), distance),
       ],
       unionClippingRegions: true,
       edgeWidth: 1,
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

    


   /* const url = this.constructGeoTIFFUrl([1167898,7059451, 1168399, 7060147])
    console.log(url)
    this.loadGeoTIFF('https://wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25833?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&FORMAT=GeoTIFF&COVERAGE=nhm_dtm_topo_25833&BBOX=272669,7037582,273109,7038148&CRS=EPSG:25833&RESPONSE_CRS=EPSG:25833&WIDTH=440&HEIGHT=566')

    // Test loading the GeoTIFF
fetch(url)
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
})
.then(blob => {
  console.log('GeoTIFF successfully fetched:', blob);

  // Create a blob URL for the GeoTIFF
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'geotiff.tif'; // Specify the file name

  // Append the link to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);

  // Revoke the blob URL
  URL.revokeObjectURL(blobUrl);

})
.catch(error => {
    console.error('Error loading GeoTIFF:', error);
});*/
  }

  public updateGlobeAlpha(alpha: number): void {
    console.log('updateglobealpha')
    // Adjust globe base color translucency
    this.viewer.scene.globe.translucency.enabled = true;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
      console.log('updateglobealpha')
  }

  /**
   * Filters the map by inquiry ID and fetches geometries.
   */
  private filterMapByInquiryId(inquiryId: number | undefined): void {
    if (inquiryId) {
      this.geometryService.getGeometry(inquiryId).subscribe({
        next: (response: Geometry[]) => {
          this.products = response.map(geometry => {
            const parsedGeometry = geometry.st_asgeojson as ParsedGeometry;
            return { id: geometry.id, st_asgeojson: parsedGeometry };
          });
          
         this.extractCoordinates(this.products)
       
          if (this.coords.length > 0) {
            console.log(this.coords)
            this.coords.forEach(coordlist => {
                const polygonCoordinates = coordlist.map(coordinate =>
                  Cartesian3.fromDegrees(coordinate[0], coordinate[1])
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
    console.log('filtermap')


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
  /**
   * Extracts coordinates from geometries.
   */
  private extractCoordinates(geometries: Geometry[]): void {
    console.log('extractcoordinates')
    this.coords = geometries.reduce(
      (acc, geometry) => {
        const parsedGeometry = geometry.st_asgeojson as ParsedGeometry;
        if (parsedGeometry && parsedGeometry.coordinates) {
          acc.push(...parsedGeometry.coordinates);
        }
        return acc;
      },
      [] as number[][][]
    );
    console.log('ec', this.coords);
    console.log('ec', this.coords[0][0][0]);
  }
  

  /**
   * Updates the map view to fit the extracted coordinates.
   */
  private updateMap(viewer: Viewer): void {
    console.log('updatemap')
    if (this.coords.length > 0) {
      const flatCoordinates = this.coords.flat(3);
      const positions = Cartesian3.fromDegreesArray(flatCoordinates);
      const boundingSphere = BoundingSphere.fromPoints(positions);
      this.center = boundingSphere.center;
      console.log(this.center)
      viewer.camera.flyToBoundingSphere(boundingSphere, {
        offset: new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 1000), // Adjust the range as needed
      });
      this.changeHomeButton(viewer, boundingSphere);
    }
    console.log('updatemap')
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
  private changeHomeButton(viewer: Viewer, boundingsphere: BoundingSphere) {
    console.log('changehome')
    // Change the home button view
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function (e) {
        e.cancel = true; // Cancel the default home view
        viewer.camera.flyToBoundingSphere(boundingsphere, {
          offset: new HeadingPitchRange(0, -CesiumMath.PI_OVER_TWO, 1000), // Adjust the range as needed
        });
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
}

private loadCables(): void {
  const geoJsonData = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "point_id": 4218,
          "metadata": {
            "x": 272340.264,
            "y": 7040733.727,
            "lat": 63.4220986,
            "lon": 10.436597,
            "PDOP": 0.8,
            "height": 103.483,
            "fixType": "rtk",
            "accuracy": 0.014,
            "timestamp": 1720595755444,
            "antennaHeight": 1.8,
            "numSatellites": 23,
            "numMeasurements": 3,
            "verticalAccuracy": 0.018
          }
        },
        "geometry": {
          "type": "Point",
          "coordinates": [10.436597, 63.4220986]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": 822
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [10.4365917, 63.4220991],
            [10.4365872, 63.4221003],
            [10.4365867, 63.4220992],
            [10.4365879, 63.4221158],
            [10.4365434, 63.4221234],
            [10.4365389, 63.4221244],
            [10.4365019, 63.4221486],
            [10.4364934, 63.4221787],
            [10.4366107, 63.4222048]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "id": 823
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [10.4365594, 63.422287],
            [10.4366929, 63.4222636],
            [10.436654, 63.4222757],
            [10.436654, 63.4222894],
            [10.4366804, 63.4222987],
            [10.4367052, 63.4222975],
            [10.4367435, 63.4222931],
            [10.4367737, 63.4223016],
            [10.436777, 63.4223184],
            [10.4367408, 63.422342],
            [10.4367039, 63.4223357],
            [10.436749, 63.4223266],
            [10.4368225, 63.4223407],
            [10.4368495, 63.4223585],
            [10.4368392, 63.4223663],
            [10.4367735, 63.4223829],
            [10.4368763, 63.4223725]
          ]
        }
      }
    ]
  };
 
  GeoJsonDataSource.load(geoJsonData, {
    stroke: Color.BLUE,
    fill: Color.BLUE.withAlpha(1),
    strokeWidth: 3,
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
 
  console.log('loadCables');
}
/*
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
}*/
}
function convertDegreesToMeters(lon: any, lat: any) {
  const proj4 = window.proj4;
  const fromProj = 'EPSG:4326';
  const toProj = 'EPSG:25833';
  const [x, y] = proj4(fromProj, toProj, [lon, lat]);
  return [x, y];
}

