import { TestBed } from '@angular/core/testing';
import { CableInfoService } from './cable-info.service';
import { CableMeasurementInfoComponent } from './cable-measurement-info/cable-measurement-info.component';
import { HttpClientModule } from '@angular/common/http'; 

describe('CableInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, CableMeasurementInfoComponent], 
      providers: [CableInfoService],
    });
  });

  it('should be created', () => {
    const service: CableInfoService = TestBed.inject(CableInfoService);
    expect(service).toBeTruthy();
  });
});
