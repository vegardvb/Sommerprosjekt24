import { Injectable } from '@angular/core';
import * as GeoTIFF from 'geotiff';

interface HeightmapData {
  width: number;
  height: number;
  heightmapData: Float32Array;
}

@Injectable({
  providedIn: 'root',
})
export class GeoTiffService {
  constructor() {}

  /**
   * Decode the GeoTIFF file and return heightmap data.
   * @param arrayBuffer - ArrayBuffer containing the GeoTIFF data.
   */
  async decodeGeoTiff(arrayBuffer: ArrayBuffer): Promise<HeightmapData> {
    try {
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const width = image.getWidth();
      const height = image.getHeight();

      // Ensure the return type of readRasters is properly handled
      const rasters = await image.readRasters({
        samples: [0], // Assuming you want the first sample
        interleave: true,
      });

      // Ensure the rasters[0] is a Float32Array
      if (!(rasters instanceof Float32Array)) {
        throw new Error('Unexpected raster data type');
      }

      const heightmapData = rasters as Float32Array;
      return { width, height, heightmapData };
    } catch (error) {
      console.error('Error decoding GeoTIFF file:', error);
      throw error;
    }
  }
}
