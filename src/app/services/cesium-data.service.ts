import { Inject, Injectable } from '@angular/core';
import {
  GeoJsonDataSource,
  Color,
  Viewer,
  CesiumTerrainProvider,
  Entity,
  ConstantProperty,
  PointGraphics,
  HeightReference,
  Cartesian3,
  JulianDate,
  Property,
  CallbackProperty,
  defined,
  PropertyBag,
} from 'cesium';
import { lastValueFrom } from 'rxjs';
import { CableMeasurementService } from './cable-measurement.service';
import { CablePointsService } from './cable-points.service';
import { WorkingAreaService } from './workingarea.service';

@Injectable({
  providedIn: 'root',
})
export class CesiumDataService {
  constructor(
    @Inject(CableMeasurementService)
    private cableMeasurementService: CableMeasurementService,
    private cablePointsService: CablePointsService,
    private workingAreaService: WorkingAreaService
  ) {}

  /**
   * Loads the cables data and visualizes them on the Cesium viewer.
   */
  async loadCables(
    viewer: Viewer,
    inquiryId: number | undefined
  ): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.cableMeasurementService.getData(inquiryId)
      );
      if (data) {
        const geoJson = data[0].geojson;
        const dataSource = await GeoJsonDataSource.load(geoJson, {
          stroke: Color.BLUE,
          fill: Color.BLUE.withAlpha(1),
          strokeWidth: 3,
          markerSize: 1,
          credit: 'Provided by Cable measurement service',
        });

        dataSource.entities.values.forEach(entity => {
          if (!entity.polyline) {
            entity.point = new PointGraphics({
              color: Color.BLUE,
              pixelSize: 10,
              outlineColor: Color.WHITE,
              outlineWidth: 2,
              show: new ConstantProperty(true),
            });
            viewer.entities.add(entity);
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
  async loadCablePoints(
    viewer: Viewer,
    inquiryId: number | undefined,
    pointEntities: Entity[]
  ): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.cablePointsService.getData(inquiryId)
      );
      if (data) {
        const lineStringFeatures = data[0].geojson;

        for (const geojson of lineStringFeatures) {
          const allPositions: Cartesian3[] = [];
          const dataSource = await GeoJsonDataSource.load(geojson, {
            stroke: Color.BLUEVIOLET,
            fill: Color.BLUEVIOLET.withAlpha(1),
            strokeWidth: 3,
            markerSize: 1,
            credit: 'Provided by Cable measurement service',
          });

          viewer.dataSources.add(dataSource);

          const groupEntities: Entity[] = [];

          dataSource.entities.values.forEach(entity => {
            if (entity.position) {
              entity.point = new PointGraphics({
                color: Color.BLUE,
                pixelSize: 10,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
                show: new ConstantProperty(false),
              });
              groupEntities.push(entity);

              pointEntities.push(entity);
              const position = entity.position.getValue(JulianDate.now());
              if (position) {
                allPositions.push(position);
              }
            }
          });

          // Create a polyline for each group of entities
          if (groupEntities.length > 1) {
            viewer.entities.add({
              polyline: {
                positions: new CallbackProperty(() => {
                  return groupEntities
                    .map(entity => {
                      return entity.position?.getValue(JulianDate.now());
                    })
                    .filter(position => position !== undefined);
                }, false),
                width: 4.5,
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

  private disablePolygonClick(entity: Entity): void {
    if (defined(entity.properties)) {
      entity.properties = new PropertyBag();

      entity.properties['nonPickable'] = true;
    }
  }
  /**
   * Loads the working area data and displays it on the Cesium viewer.
   */
  async loadWorkingArea(
    viewer: Viewer,
    inquiryId: number | undefined,
    polygons: Entity[]
  ): Promise<void> {
    try {
      const data = await lastValueFrom(
        this.workingAreaService.getArea(inquiryId)
      );
      if (data) {
        const geoJson = data[0].geojson;
        const dataSource = await GeoJsonDataSource.load(geoJson, {
          stroke: Color.PALEVIOLETRED,
          fill: Color.PALEVIOLETRED.withAlpha(0.1),
          strokeWidth: 2,
          markerSize: 1,
          credit: 'Provided by Cable measurement service',
        });

        viewer.dataSources.add(dataSource);

        dataSource.entities.values.forEach(entity => {
          if (entity.polygon) {
            entity.polygon.heightReference =
              HeightReference.CLAMP_TO_GROUND as unknown as Property;
            polygons.push(entity);
            viewer.entities.add(entity);
            this.disablePolygonClick(entity);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load working area data:', error);
    }
  }

  /**
   * Loads terrain from the specified URL and sets it as the terrain provider for the Cesium viewer.
   * @param url - The URL of the terrain data.
   * @returns A promise that resolves when the terrain is successfully loaded.
   */
  async loadTerrainFromUrl(viewer: Viewer, url: string): Promise<void> {
    try {
      const terrainProvider = await CesiumTerrainProvider.fromUrl(url, {
        requestVertexNormals: true,
      });
      viewer.terrainProvider = terrainProvider;
    } catch (error) {
      console.error('Error loading terrain into Cesium:', error);
    }
  }
}
