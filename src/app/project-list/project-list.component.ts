import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common'; // Import this for Angular common directives
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

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
  vet_ikke?: string;
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
  ],

  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  providers: [DataService],
})
export class ProjectListComponent implements OnInit {
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
    'vet ikke',
  ];
  selectedProduct!: Product;
  data: any;

  @ViewChild('dt1') dt1!: Table;

  constructor(
    private router: Router,
    private dataService: DataService
  ) {
    this.products = [];
  }
  ngOnInit(): void {
    this.dataService.getData().subscribe(
      response => {
        this.data = response;
        this.products = [];

        for (let sublist of this.data) {
          let product: Product = {
            name: sublist[0] || '',
            adress: sublist[1] || '',
            description: sublist[2] || '',
            status: sublist[3] || '',
            municipality: sublist[4] || '',
            post: sublist[5] || '',
            organization: sublist[6] || '',
            deadline: sublist[7] || '',
            email: sublist[8] || '',
            vet_ikke: sublist[9] || '',
          };

          this.products.push(product);
        }
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase();
    this.dt1.filter(value, 'global', 'contains');
  }

  onRowSelect(event: any) {
    console.log('Row selected:', event.data.name);

    this.router.navigate(['/project-data', event.data.name]);
  }
}
