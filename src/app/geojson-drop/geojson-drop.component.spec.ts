import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeojsonDropComponent } from './geojson-drop.component';

describe('GeojsonDropComponent', () => {
  let component: GeojsonDropComponent;
  let fixture: ComponentFixture<GeojsonDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeojsonDropComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GeojsonDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
