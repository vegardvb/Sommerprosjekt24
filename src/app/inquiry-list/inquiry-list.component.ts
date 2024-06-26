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
          id: inquiry.id,
          navn: inquiry.navn,
          beskrivelse: inquiry.beskrivelse,
          kunde_epost: inquiry.kunde_epost,
          kommune: inquiry.kommune,
          gateadresse: inquiry.gateadresse,
          status: inquiry.status,
          behandlingsfrist: inquiry.behandlingsfrist,
          fra_dato: inquiry.fra_dato,
          til_dato: inquiry.til_dato,
        }));
      },
      error: error => {
        console.error('Error fetching data:', error);
      },
      complete: () => {
        console.log('Data fetching completed.');
      },
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
