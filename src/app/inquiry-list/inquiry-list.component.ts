import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

export interface Product {
  hendvendelseId?: string;
  adress?: string;
  description?: string;
  status?: string;
  municipality?: string;
  post?: string;
  organization?: string;
  deadline?: string;
  email?: string;
}

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
export class InquiryListComponent {
  products: Product[];
  searchValue: string | undefined;
  globalFilterFields: string[] = [
    'id',
    'navn',
    'beskrivelse',
    'kunde_epost',
    'kommune',
    'gateadresse',
    'status',
    'behandlingsfrist',
    'fra_dato',
    'til_dato',
  ];
  selectedProduct!: Product;

  @ViewChild('dt1') dt1!: Table; // ViewChild reference to access p-table component

  constructor(private router: Router) {
    this.products = [
      {
        hendvendelseId: '1000',
        adress: 'Product 1',
        description: 'blabla',
        status: 'Category 1',
        municipality: 'trondheim',
        post: 'hei',
        organization: 'geomatikk',
        deadline: '2015-03-25',
        email: 'thea',
      },
      {
        hendvendelseId: '1001',
        adress: 'Product 2',
        description: 'blabla',
        status: 'Category 2',
      },
      {
        hendvendelseId: '1002',
        adress: 'Product 3',
        description: 'blabla',
        status: 'Category 3',
      },
    ];
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase(); // Get search value
    this.dt1.filter(value, 'global', 'contains'); // Apply global filter
  }

  onInquiryClick(inquiryId: string | undefined): void {
    if (inquiryId) {
      this.router.navigate(['/map-view'], {
        queryParams: { inquiryId: inquiryId },
      });
    }
  }

  onRowSelect() {
    console.log('Row selected:'); // Legg til den faktiske funksjonaliteten her
  }
}
