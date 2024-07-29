import { TestBed } from '@angular/core/testing';
import { ClickedPointService } from './clickedpoint.service';

describe('ClickedPointService', () => {
  let service: ClickedPointService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClickedPointService],
    });
    service = TestBed.inject(ClickedPointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get clickedPointId', done => {
    service.setClickedPointId(123);
    service.clickedPointId$.subscribe(id => {
      expect(id).toBe(123);
      done();
    });
  });

  it('should set and get latitude', done => {
    const latitude = '63.4305';
    service.setLatitude(latitude);
    service.latitude$.subscribe(lat => {
      expect(lat).toBe(latitude);
      done();
    });
  });

  it('should set and get longitude', done => {
    const longitude = '10.3951';
    service.setLongitude(longitude);
    service.longitude$.subscribe(lon => {
      expect(lon).toBe(longitude);
      done();
    });
  });

  it('should trigger and reset zoom', done => {
    service.triggerZoom();
    service.zoomTrigger$.subscribe(zoom => {
      expect(zoom).toBe(true);
      done();
    });
  });

  it('should reset coordinates and zoom', done => {
    service.setClickedPointId(123);
    service.setLatitude('63.4305');
    service.setLongitude('10.3951');
    service.triggerZoom();

    service.resetCoordinates();
    service.clickedPointId$.subscribe(id => {
      expect(id).toBeNull();
    });
    service.latitude$.subscribe(lat => {
      expect(lat).toBeNull();
    });
    service.longitude$.subscribe(lon => {
      expect(lon).toBeNull();
    });
    service.zoomTrigger$.subscribe(zoom => {
      expect(zoom).toBe(false);
      done();
    });
  });
});
