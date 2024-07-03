import { TestBed } from '@angular/core/testing';
import { CableInfoService } from '../cable-info.service';
import { HttpClientModule } from '@angular/common/http';

describe('CableInfoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [CableInfoService],
    });
  });

  it('should be created', () => {
    const service: CableInfoService = TestBed.inject(CableInfoService);
    expect(service).toBeTruthy();
  });
});
