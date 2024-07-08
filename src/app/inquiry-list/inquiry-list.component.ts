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
  ],
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.css'],
})
export class InquiryListComponent implements OnInit {
  products: Inquiry[] = [];
  searchValue: string | undefined;
  globalFilterFields: string[] = [
    'id',
    'name',
    'description',
    'organization',
    'mail',
    'municipality',
    'status',
    'processing_deadline',
    'start_date',
    'end_date',
    'status_name',
  ];
  selectedProduct!: Inquiry;

  @ViewChild('dt1') dt1!: Table;

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
          adress: inquiry.adress,
          status: inquiry.status,
          processing_deadline: inquiry.processing_deadline,
          start_date: inquiry.start_date,
          end_date: inquiry.end_date,
          status_name: inquiry.status_name,
        }));
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
}
