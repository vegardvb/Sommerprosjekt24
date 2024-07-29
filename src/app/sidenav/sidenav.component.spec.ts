import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidenavComponent } from './sidenav.component';
import { SidenavService } from './sidenav.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import {
  Entity,
  Cartesian3,
  ConstantPositionProperty,
  JulianDate,
  Math as CesiumMath,
  Cartographic,
} from 'cesium';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;
  let sidenavServiceSpy: jasmine.SpyObj<SidenavService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockActivatedRoute = {
      queryParams: of({ inquiryId: 123 }),
    };

    const sidenavServiceMock = jasmine.createSpyObj('SidenavService', [
      'setSidenavWidth',
      'updateCoordinates',
    ]);
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [SidenavComponent, MatSnackBarModule, ReactiveFormsModule],
      providers: [
        { provide: SidenavService, useValue: sidenavServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    sidenavServiceSpy = TestBed.inject(
      SidenavService
    ) as jasmine.SpyObj<SidenavService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set side navigation width within bounds', () => {
    const minWidth = component.sidenavMinWidth;
    const maxWidth = component.sidenavMaxWidth;
    component.setSidenavWidth(minWidth - 100);
    expect(component.sidenavWidth).toBe(minWidth);

    component.setSidenavWidth(maxWidth + 100);
    expect(component.sidenavWidth).toBe(maxWidth);
  });

  it('should update selected entity and set coordinates', () => {
    const mockEntity = new Entity({
      position: new ConstantPositionProperty(
        Cartesian3.fromDegrees(10, 20, 30)
      ),
    });

    component.updateSelectedEntity(mockEntity);
    expect(component.selectedEntity).toBe(mockEntity);

    const cartographic = mockEntity.position
      ? Cartographic.fromCartesian(
          mockEntity.position.getValue(JulianDate.now())!
        )
      : null;
    if (cartographic) {
      expect(component.longitude).toBeCloseTo(
        CesiumMath.toDegrees(cartographic.longitude)
      );
      expect(component.latitude).toBeCloseTo(
        CesiumMath.toDegrees(cartographic.latitude)
      );
      expect(component.height).toBeCloseTo(cartographic.height);
    } else {
      fail('cartographic is null');
    }
  });

  it('should clear selected entity and reset coordinates', () => {
    component.selectedEntity = new Entity();
    component.longitude = 10;
    component.latitude = 20;
    component.height = 30;

    component.clearSelectedEntity();

    expect(component.selectedEntity).toBeNull();
    expect(component.longitude).toBe(0);
    expect(component.latitude).toBe(0);
    expect(component.height).toBe(0);
  });

  it('should toggle editing mode and emit event', () => {
    spyOn(component.editingToggled, 'emit');
    component.toggleEditing();
    expect(component.isEditing).toBeTrue();
    expect(component.editingToggled.emit).toHaveBeenCalledWith(true);

    component.toggleEditing();
    expect(component.isEditing).toBeFalse();
    expect(component.editingToggled.emit).toHaveBeenCalledWith(false);
  });

  it('should start resizing with correct initial values', () => {
    const mockEvent = { clientX: 100 } as MouseEvent;
    component.startResizing(mockEvent);
    expect(component.resizingEvent.isResizing).toBeTrue();
    expect(component.resizingEvent.startingCursorX).toBe(mockEvent.clientX);
    expect(component.resizingEvent.startingWidth).toBe(
      component.sidenavService.sidenavWidth
    );
  });

  it('should stop resizing', () => {
    component.stopResizing();
    expect(component.resizingEvent.isResizing).toBeFalse();
  });

  it('should update sidenav width while resizing', () => {
    component.resizingEvent = {
      isResizing: true,
      startingCursorX: 100,
      startingWidth: 250,
    };
    const mockEvent = { clientX: 150 } as MouseEvent;
    component.updateSidenavWidth(mockEvent);
    expect(sidenavServiceSpy.setSidenavWidth).toHaveBeenCalledWith(300);
  });
});
