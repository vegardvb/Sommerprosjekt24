import { TestBed } from '@angular/core/testing';

import { GeojsonParserService } from './geojson-parser.service';

describe('GeojsonParserService', () => {
  let service: GeojsonParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeojsonParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
