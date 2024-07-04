import {
  Directive,
  ElementRef,
  OnInit,
  Output,
  EventEmitter,
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
  PolygonHierarchy,
  BoundingSphere,
  Math as CesiumMath,
} from 'cesium';
import { Geometry } from '../models/geometry-interface';
import { GeometryService } from './geometry.service';
import { ActivatedRoute } from '@angular/router';
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
  @Output() bboxExtracted = new EventEmitter<string>();
  inquiryId: number | undefined;
  products: Geometry[] = [];
  coords: number[][][][] = [];
  center!: Cartesian3;

  private viewer!: Viewer;

  constructor(
    private el: ElementRef,
    private geometryService: GeometryService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
    this.filterMapByInquiryId(this.inquiryId);

    this.initializeViewer();

    const cameraMoveEndListener = () => {
      console.log('Camera move end event detected');
      this.extractBbox();
      this.viewer.camera.moveEnd.removeEventListener(cameraMoveEndListener);
    };
    this.viewer.camera.moveEnd.addEventListener(cameraMoveEndListener);
  }

  /**
   * Initializes the Cesium Viewer and adds the tileset and clipping planes.
   */
  private async initializeViewer(): Promise<void> {
    this.viewer = new Viewer(this.el.nativeElement, {
      timeline: false,
      animation: false,
    });

    const distance = 200.0;

    const tileset = await Cesium3DTileset.fromIonAssetId(96188);
    this.viewer.scene.primitives.add(tileset);

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
    tileset.clippingPlanes = tilesetClippingPlanes;

    this.viewer.scene.globe.tileCacheSize = 10000;
    this.viewer.scene.screenSpaceCameraController.enableCollisionDetection =
      false;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
      new NearFarScalar(400.0, 0.0, 800.0, 1.0);
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
      viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 2.0 });
    }
  }

  /**
   * Extracts the bounding box of the current view and emits the coordinates.
   */
  private extractBbox(): void {
    const rectangle = this.viewer.camera.computeViewRectangle(
      this.viewer.scene.globe.ellipsoid
    );
    if (rectangle) {
      const west = CesiumMath.toDegrees(rectangle.west);
      const south = CesiumMath.toDegrees(rectangle.south);
      const east = CesiumMath.toDegrees(rectangle.east);
      const north = CesiumMath.toDegrees(rectangle.north);

      console.log('Extracted BBOX coordinates:', { west, south, east, north });

      const lowerLeft = proj4('EPSG:4326', 'EPSG:25833', [west, south]);
      const upperRight = proj4('EPSG:4326', 'EPSG:25833', [east, north]);
      console.log('Transformed BBOX coordinates:', { lowerLeft, upperRight });

      const bbox = `${lowerLeft[0]},${lowerLeft[1]},${upperRight[0]},${upperRight[1]}`;
      console.log('Projected BBOX in EPSG:25833:', bbox);

      this.bboxExtracted.emit(bbox);
    }
  }

  /**
   * Plots a polygon on the viewer.
   */
  private plotPolygon(coordinates: Cartesian3[], viewer: Viewer): void {
    viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(coordinates),
        material: Color.RED.withAlpha(0.5),
      },
    });
  }
}
