import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common'; // Import this for Angular common directives
import { ToastModule } from 'primeng/toast';

export interface Product {
  name?: string;
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
    'name',
    'adress',
    'description',
    'status',
    'municipality',
    'post',
    'organization',
    'deadline',
    'email',
  ];
  selectedProduct!: Product;

  @ViewChild('dt1') dt1!: Table; // ViewChild reference to access p-table component

  constructor() {
    this.products = [
      {
        name: '1000',
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
        name: '1001',
        adress: 'Product 2',
        description: 'blabla',
        status: 'Category 2',
      },
      {
        name: '1002',
        adress: 'Product 3',
        description: 'blabla',
        status: 'Category 3',
      },
    ];
  }

  //  ngOnInit() {}

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase(); // Get search value
    this.dt1.filter(value, 'global', 'contains'); // Apply global filter
  }

  onRowSelect() {
    console.log('Row selected:'); // Legg til den faktiske funksjonaliteten her
  }
}
