import { TestBed } from '@angular/core/testing';
import { HomePageComponent } from './home-page.component';
import { DataService } from '../data.service';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('HomePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [DataService, provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
