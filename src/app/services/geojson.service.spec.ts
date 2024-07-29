import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { GeojsonService } from './geojson.service';
import { GeoJSON } from '../../models/geojson.model';
import { provideHttpClient } from '@angular/common/http';

describe('GeojsonService', () => {
  let service: GeojsonService;
  let httpMock: HttpTestingController;

  const mockData: GeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [10.436766048, 63.417562716, 204.00000000301182],
        },
        properties: {
          metadata: {
            x: 272312.67862788687,
            y: 7040228.678656538,
            lat: 63.417562715999985,
            lon: 10.436766048,
            pdop: 0.8,
            height: 204.00000000301182,
            fixType: 'rtk',
            accuracy: 0.014,
            timestamp: 1720595755444,
            antennaHeight: 1.8,
            numSatellites: 23,
            numMeasurements: 3,
            verticalAccuracy: 0.018,
          },
          point_id: 4218,
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [10.4365867, 63.4220992, 103.486],
            [10.4365917, 63.4220991, 103.483],
            [10.4365872, 63.4221003, 103.485],
            // Additional coordinates...
          ],
        },
        properties: {
          measurement_id: 822,
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [10.4367408, 63.422342, 103.556],
            [10.4367052, 63.4222975, 103.568],
            [10.436264005, 63.422777449, 100],
            // Additional coordinates...
          ],
        },
        properties: {
          measurement_id: 823,
        },
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GeojsonService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(GeojsonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and process GeoJSON data for a specific inquiry ID', () => {
    service.getData(5008886).subscribe(() => {
      expect(service.getFeatures()).toEqual(mockData.features);
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/inquiry/5008886'
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ geojson: mockData }]);
  });

  it('should handle errors correctly', () => {
    service.getData(5008886).subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'An error occurred while fetching GeoJSON data. Please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/inquiry/5008886'
    );
    req.flush('404 Not Found', { status: 404, statusText: 'Not Found' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
