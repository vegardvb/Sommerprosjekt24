import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapViewComponent } from './map-view.component';
import { ActivatedRoute, Params } from '@angular/router';
import { TerrainService } from '../services/terrain.service';
import { CesiumImageService } from '../services/image/cesium-image.service';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;
  let terrainServiceSpy: jasmine.SpyObj<TerrainService>;
  let cesiumImageServiceSpy: jasmine.SpyObj<CesiumImageService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({ inquiryId: 123 } as Params),
    };

    terrainServiceSpy = jasmine.createSpyObj('TerrainService', [
      'fetchGeoTIFF',
      'processGeoTIFF',
    ]);
    cesiumImageServiceSpy = jasmine.createSpyObj('CesiumImageService', [
      'setBillboardsVisibility',
    ]);

    await TestBed.configureTestingModule({
      imports: [MapViewComponent],
      providers: [
        { provide: TerrainService, useValue: terrainServiceSpy },
        { provide: CesiumImageService, useValue: cesiumImageServiceSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;

    // Mock the viewer property
    component['viewer'] = jasmine.createSpyObj('Viewer', ['']);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct inquiryId from queryParams', () => {
    expect(component['inquiryId']).toBe(123);
  });

  it('should unsubscribe from all subscriptions on destroy', () => {
    const queryParamsSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    const bboxSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    const entitySubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    const editingSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    const geoJsonSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);

    component['queryParamsSubscription'] = queryParamsSubscription;
    component['bboxSubscription'] = bboxSubscription;
    component['entitySubscription'] = entitySubscription;
    component['editingSubscription'] = editingSubscription;
    component['geoJsonSubscription'] = geoJsonSubscription;

    component.ngOnDestroy();

    expect(queryParamsSubscription.unsubscribe).toHaveBeenCalled();
    expect(bboxSubscription.unsubscribe).toHaveBeenCalled();
    expect(entitySubscription.unsubscribe).toHaveBeenCalled();
    expect(editingSubscription.unsubscribe).toHaveBeenCalled();
    expect(geoJsonSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should set billboards visibility when toggleBillboards is called', () => {
    const event = { target: { checked: false } } as unknown as Event;
    component.toggleBillboards(event);
    expect(component.billboardsVisible).toBeFalse();
    expect(cesiumImageServiceSpy.setBillboardsVisibility).toHaveBeenCalledWith(
      component['viewer'],
      false
    );
  });

  it('should call handleEntityDeselection when an entity is deselected', () => {
    spyOn(component.sidenavComponent, 'clearSelectedEntity');
    component.handleEntityDeselection();

    expect(component.sidenavComponent.clearSelectedEntity).toHaveBeenCalled();
  });
});
