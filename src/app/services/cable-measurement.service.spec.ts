import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CableMeasurementService } from './cable-measurement.service';
import { MeasurementGeometry } from '../../models/measurement_geometry';
import { provideHttpClient } from '@angular/common/http';

describe('CableMeasurementService', () => {
  let service: CableMeasurementService;
  let httpMock: HttpTestingController;

  const mockData: MeasurementGeometry[] = [
    {
      inquiry_id: 5008886,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [10.43381764, 63.420500704, 9.313225746154785e-10],
            },
            properties: {
              metadata: {
                x: 272234.23255651677,
                y: 7040507.334902815,
                lat: 63.42050070399997,
                lon: 10.433817640000001,
                PDOP: 0.8,
                height: 9.313225746154785e-10,
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
                [10.436264005, 63.422777449, 0],
                // Additional coordinates...
              ],
            },
            properties: {
              measurement_id: 823,
            },
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CableMeasurementService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CableMeasurementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data for a specific inquiry ID', () => {
    service.getData(5008886).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/inquiry/5008886'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle errors correctly', () => {
    const errorMessage = 'test 404 error';
    service.getData(5008886).subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'Something bad happened; please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/inquiry/5008886'
    );
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
