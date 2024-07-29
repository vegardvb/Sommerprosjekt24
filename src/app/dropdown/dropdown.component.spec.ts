import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';

describe('DropdownComponent', () => {
  let component: DropdownComponent;
  let fixture: ComponentFixture<DropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MultiSelectModule,
        CommonModule,
        DropdownComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cables array correctly', () => {
    expect(component.cables).toEqual([
      { name: 'Fiber', code: 'F' },
      { name: 'Electrical', code: 'E' },
      { name: 'Drain pipe', code: 'DP' },
      { name: 'Tractor pipe', code: 'TP' },
    ]);
  });

  it('should correctly identify selected cables', () => {
    component.selectedCables = [{ name: 'Fiber', code: 'F' }];
    expect(component.isSelected({ name: 'Fiber', code: 'F' })).toBe(true);
    expect(component.isSelected({ name: 'Electrical', code: 'E' })).toBe(false);
  });

  it('should return the correct style for each cable type', () => {
    expect(component.getSymbolStyle({ name: 'Fiber', code: 'F' })).toEqual({
      color: 'blue',
    });
    expect(component.getSymbolStyle({ name: 'Electrical', code: 'E' })).toEqual(
      { color: 'red' }
    );
    expect(
      component.getSymbolStyle({ name: 'Drain pipe', code: 'DP' })
    ).toEqual({ color: 'green' });
    expect(
      component.getSymbolStyle({ name: 'Tractor pipe', code: 'TP' })
    ).toEqual({ color: 'orange' });
    expect(component.getSymbolStyle({ name: 'Unknown', code: 'X' })).toEqual(
      {}
    );
  });

  it('should have a default sidebar width', () => {
    expect(component.sideBarWidth).toBe('150');
  });
});
