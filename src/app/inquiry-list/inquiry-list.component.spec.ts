import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InquiryListComponent } from './inquiry-list.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DataService } from '../data.service';
import { Inquiry } from '../../models/inquiry-interface';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('InquiryListComponent', () => {
  let component: InquiryListComponent;
  let fixture: ComponentFixture<InquiryListComponent>;
  let dataService: DataService;
  let router: Router;

  const mockInquiries: Inquiry[] = [
    {
      id: 1,
      navn: 'Inquiry 1',
      beskrivelse: 'Description 1',
      kunde_epost: 'email1@example.com',
      kommune: 'Kommune 1',
      gateadresse: 'Address 1',
      status: 'Status 1',
      behandlingsfrist: '2022-01-01',
      fra_dato: '2022-01-01',
      til_dato: '2022-01-01',
    },
    {
      id: 2,
      navn: 'Inquiry 2',
      beskrivelse: 'Description 2',
      kunde_epost: 'email2@example.com',
      kommune: 'Kommune 2',
      gateadresse: 'Address 2',
      status: 'Status 2',
      behandlingsfrist: '2022-02-01',
      fra_dato: '2022-02-01',
      til_dato: '2022-02-01',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), provideRouter([]), DataService],
      declarations: [InquiryListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InquiryListComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    router = TestBed.inject(Router);
  });

  it('should fetch and display inquiries', () => {
    spyOn(dataService, 'getData').and.returnValue(of(mockInquiries));
    fixture.detectChanges();

    expect(component.products.length).toBe(2);
    expect(component.products).toEqual(mockInquiries);
  });

  it('should filter inquiries based on search input', () => {
    spyOn(dataService, 'getData').and.returnValue(of(mockInquiries));
    fixture.detectChanges();

    component.searchValue = 'Inquiry 1';
    component.onSearch({ target: { value: 'Inquiry 1' } } as unknown as Event);
    fixture.detectChanges();

    const filteredInquiries = component.products.filter(inquiry =>
      inquiry.navn.toLowerCase().includes('inquiry 1'.toLowerCase())
    );

    expect(filteredInquiries.length).toBe(1);
    expect(filteredInquiries[0].navn).toBe('Inquiry 1');
  });

  it('should navigate to map view on inquiry click', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.onInquiryClick(1);

    expect(navigateSpy).toHaveBeenCalledWith(['/map-view'], {
      queryParams: { inquiryId: '1' },
    });
  });
});
