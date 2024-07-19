import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { InquiryListComponent } from './inquiry-list.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DataService } from '../data.service';
import { Inquiry } from '../../models/inquiry-interface';
import { Router } from '@angular/router';
import { MapViewComponent } from '../map-view/map-view.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InquiryListComponent', () => {
  let component: InquiryListComponent;
  let fixture: ComponentFixture<InquiryListComponent>;
  let dataService: jasmine.SpyObj<DataService>;

  const mockData: Inquiry[] = [
    {
      inquiry_id: 1,
      name: 'Inquiry 1',
      description: 'Description 1',
      mail: 'email1@example.com',
      municipality: 'Municipality 1',
      address: 'Address 1',
      status: 'Open',
      processing_deadline: '2024-07-01',
      start_date: '2024-06-01',
      end_date: '2024-06-30',
      status_name: 'Open',
    },
    {
      inquiry_id: 2,
      name: 'Inquiry 2',
      description: 'Description 2',
      mail: 'email2@example.com',
      municipality: 'Municipality 2',
      address: 'Address 2',
      status: 'Closed',
      processing_deadline: '2024-07-02',
      start_date: '2024-06-02',
      end_date: '2024-06-29',
      status_name: 'Closed',
    },
  ];

  beforeEach(waitForAsync(() => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getData']);

    TestBed.configureTestingModule({
      imports: [
        InquiryListComponent,
        NoopAnimationsModule, // Import this for testing without animations
      ],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        provideHttpClientTesting(),
        provideRouter([
          { path: 'map-view', component: MapViewComponent },
          { path: 'inquiry-list', component: InquiryListComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InquiryListComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    dataService.getData.and.returnValue(of(mockData));
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data on initialization', () => {
    fixture.detectChanges();
    expect(component.products.length).toBe(2);
    expect(component.products).toEqual(mockData);
  });

  it('should filter data based on search input', waitForAsync(() => {
    fixture.detectChanges();
    const searchInput: HTMLInputElement =
      fixture.nativeElement.querySelector('#searchbar');
    searchInput.value = 'Inquiry 1';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Add a small delay to ensure the filter operation completes
    setTimeout(() => {
      expect(component.dt1.filteredValue?.length).toBe(1);
      expect(component.dt1.filteredValue?.[0].name).toBe('Inquiry 1');
    }, 500); // Adjust the delay time as needed
  }));

  it('should navigate to map view on inquiry click', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.onInquiryClick(1);

    expect(router.navigate).toHaveBeenCalledWith(['/map-view'], {
      queryParams: { inquiryId: '1' },
    });
  });
});
