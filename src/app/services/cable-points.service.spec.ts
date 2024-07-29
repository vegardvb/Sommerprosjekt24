import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CablePointsService } from './cable-points.service';
import { CablePoints } from '../../models/cable_points';
import { provideHttpClient } from '@angular/common/http';

describe('CablePointsService', () => {
  let service: CablePointsService;
  let httpMock: HttpTestingController;

  const mockData: CablePoints[] = [
    {
      inquiry_id: 5007581,
      geojson: [
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                point_id: 2636,
                measurement_id: 354,
                metadata: {
                  x: 282992.26,
                  y: 7024326.76,
                  lat: 63.281915,
                  lon: 10.671535,
                  PDOP: 1.1,
                  height: 238.83,
                  comment: '',
                  fixType: 'frtk',
                  accuracy: 0.04,
                  timestamp: 1631196478200,
                  imgFileName: '',
                  antennaHeight: 2,
                  numSatellites: 11,
                  numMeasurements: 3,
                  verticalAccuracy: 0.1,
                },
              },
              geometry: {
                type: 'Point',
                coordinates: [10.671535, 63.281915, 238.83],
              },
            },
            // Add more features if needed
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CablePointsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CablePointsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data for a specific inquiry ID', () => {
    service.getData(5007581).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/cable_points/inquiry/5007581'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle errors correctly', () => {
    const errorMessage = 'test 404 error';
    service.getData(5007581).subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'Something bad happened; please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      'http://127.0.0.1:8000/geometries/measurements/cable_points/inquiry/5007581'
    );
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
