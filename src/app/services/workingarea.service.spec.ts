import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { WorkingAreaService } from './workingarea.service';
import { Geometry } from '../../models/geometry-interface';
import { provideHttpClient } from '@angular/common/http';

describe('WorkingAreaService', () => {
  let service: WorkingAreaService;
  let httpMock: HttpTestingController;

  const mockData: Array<Geometry> = [
    {
      id: 5008886,
      geojson: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              // First polygon (outer array for MultiPolygon)
              [10.437699758, 63.417539472],
              [10.437689368, 63.41756669],
              [10.437667327, 63.417592476],
              // Additional coordinates...
            ],
            [
              // Second polygon
              [10.437045031, 63.417565742],
              [10.43703602, 63.417589346],
              [10.437016905, 63.417611709],
              // Additional coordinates...
            ],
            [
              // Third polygon
              [10.436613171, 63.417787967],
              [10.436601407, 63.41781878],
              [10.436576453, 63.417847974],
              // Additional coordinates...
            ],
          ],
        },
      },
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkingAreaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(WorkingAreaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch area data for a specific inquiry ID', () => {
    const inquiryId = 12345;
    service.getArea(inquiryId).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(
      `http://127.0.0.1:8000/geometries/area/working_area/inquiry/${inquiryId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle errors correctly', () => {
    const inquiryId = 12345;
    service.getArea(inquiryId).subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'Something bad happened; please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      `http://127.0.0.1:8000/geometries/area/working_area/inquiry/${inquiryId}`
    );
    req.flush('Error occurred', { status: 404, statusText: 'Not Found' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
