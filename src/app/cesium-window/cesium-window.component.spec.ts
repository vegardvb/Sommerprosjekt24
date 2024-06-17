import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesiumWindowComponent } from './cesium-window.component';

describe('CesiumWindowComponent', () => {
  let component: CesiumWindowComponent;
  let fixture: ComponentFixture<CesiumWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CesiumWindowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CesiumWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
