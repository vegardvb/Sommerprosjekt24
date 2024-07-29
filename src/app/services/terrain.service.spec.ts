import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TerrainService } from './terrain.service';
import { provideHttpClient } from '@angular/common/http';

describe('TerrainService', () => {
  let service: TerrainService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TerrainService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TerrainService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch a GeoTIFF file from the server', () => {
    const mockResponse = { file_path: '/path/to/geotiff.tif' };
    const bbox = '272669,7037582,273109,7038148';
    const width = 440;
    const height = 566;

    service.fetchGeoTIFF(bbox, width, height).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/fetch-geotiff?bbox=${bbox}&width=${width}&height=${height}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should process a GeoTIFF file on the server', () => {
    const mockResponse = { tileSetUrl: 'http://localhost:8000/tileset/1' };
    const filePath = '/path/to/geotiff.tif';

    service.processGeoTIFF(filePath).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/process-geotiff?file_path=${encodeURIComponent(filePath)}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle errors correctly when fetching GeoTIFF', () => {
    service.fetchGeoTIFF('272669,7037582,273109,7038148', 440, 566).subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'Something bad happened; please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/fetch-geotiff?bbox=272669,7037582,273109,7038148&width=440&height=566`
    );
    req.flush('Error occurred', { status: 404, statusText: 'Not Found' });
  });

  it('should handle errors correctly when processing GeoTIFF', () => {
    service.processGeoTIFF('/path/to/geotiff.tif').subscribe({
      next: () => fail('expected an error, not data'),
      error: error =>
        expect(error.message).toContain(
          'Something bad happened; please try again later.'
        ),
    });

    const req = httpMock.expectOne(
      `${service['apiUrl']}/process-geotiff?file_path=${encodeURIComponent('/path/to/geotiff.tif')}`
    );
    req.flush('Error occurred', { status: 500, statusText: 'Server Error' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
