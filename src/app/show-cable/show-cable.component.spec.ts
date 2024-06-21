import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCableComponent } from './show-cable.component';

describe('ShowCableComponent', () => {
  let component: ShowCableComponent;
  let fixture: ComponentFixture<ShowCableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowCableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowCableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
