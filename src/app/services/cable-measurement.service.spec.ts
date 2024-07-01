import { TestBed } from '@angular/core/testing';

import { CableMeasurementService } from '../cable-measurement.service';

describe('CableMeasurementService', () => {
  let service: CableMeasurementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CableMeasurementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
