import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CableMeasurementService } from './cable-measurement.service';

describe('CableMeasurementService', () => {
  let service: CableMeasurementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CableMeasurementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
