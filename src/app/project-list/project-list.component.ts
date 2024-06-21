import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common'; // Import this for Angular common directives
import { ToastModule } from 'primeng/toast';



export interface Product {
  id?: string;
  name?: string;
  price?: number;
  category?: string;
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, ToastModule], 
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  products: Product[];
  searchValue: string | undefined;
  globalFilterFields: string[] = ['id', 'name', 'price', 'category']; // Define globalFilterFields
  selectedProduct!: Product;


  @ViewChild('dt1') dt1!: Table; // ViewChild reference to access p-table component

  constructor() {
    this.products = [
      { id: '1000', name: 'Product 1', price: 100, category: 'Category 1' },
      { id: '1001', name: 'Product 2', price: 200, category: 'Category 2' },
      { id: '1002', name: 'Product 3', price: 300, category: 'Category 3' },
    
    ];
  }



  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase(); // Get search value
    this.dt1.filter(value, 'global', 'contains'); // Apply global filter
  }

  onRowSelect(event: any) {
    console.log("Row selected:", event.data); // Legg til den faktiske funksjonaliteten her
  }


}
