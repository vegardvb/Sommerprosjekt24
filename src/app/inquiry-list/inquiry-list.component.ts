import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { DataService } from '../data.service';
import { Inquiry } from '../../models/inquiry-interface';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-inquiry-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DropdownModule,
  ],
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.css'],
})
export class InquiryListComponent implements OnInit {
  products: Inquiry[] = [];
  sortedProducts: Inquiry[] = [];
  searchValue: string | undefined;
  globalFilterFields: string[] = [
    'id',
    'name',
    'description',
    'status_name',
    'organization',
    'mail',
    'address',
    'municipality',
    'processing_deadline',
    'start_date',
    'end_date',
  ];
  selectedProduct!: Inquiry;
  @ViewChild('dt1') dt1!: Table;

  sortState: { [key: string]: number } = {
    inquiry_id: 0,
    name: 0,
    description: 0,
    status: 0,
    mail: 0,
    municipality: 0,
    address: 0,
    processing_deadline: 0,
    start_date: 0,
    end_date: 0,
    status_name: 0,
  };
  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataService.getData().subscribe({
      next: (response: Inquiry[]) => {
        this.products = response.map(inquiry => ({
          inquiry_id: inquiry.inquiry_id,
          name: inquiry.name,
          description: inquiry.description,
          mail: inquiry.mail,
          municipality: inquiry.municipality,
          address: inquiry.address,
          status: inquiry.status,
          processing_deadline: inquiry.processing_deadline,
          start_date: inquiry.start_date,
          end_date: inquiry.end_date,
          status_name: inquiry.status_name,
        }));
        this.sortedProducts = [...this.products];
      },
      error: error => {
        console.error('Error fetching data:', error);
      },
      complete: () => {},
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    if (this.dt1) {
      this.dt1.filter(value, 'global', 'contains');
    }
  }

  onInquiryClick(inquiryId: number | undefined): void {
    if (inquiryId) {
      this.router.navigate(['/map-view'], {
        queryParams: { inquiryId: inquiryId.toString() },
      });
    }
  }
  asKeyOfInquiry(field: string): keyof Inquiry {
    return field as keyof Inquiry;
  }

  sortBy(field: keyof Inquiry): void {
    if (!Object.prototype.hasOwnProperty.call(this.sortState, field)) return;

    this.sortState[field]++;
    if (this.sortState[field] > 2) {
      this.sortState[field] = 0;
    }

    switch (this.sortState[field]) {
      case 1:
        this.sortedProducts.sort((a, b) =>
          (a[field] ?? '') > (b[field] ?? '') ? 1 : -1
        );
        break;
      case 2:
        this.sortedProducts.sort((a, b) =>
          (a[field] ?? '') < (b[field] ?? '') ? 1 : -1
        );
        break;
      default:
        this.sortedProducts = [...this.products];
        break;
    }
  }
}
