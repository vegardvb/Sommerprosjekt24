import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { DataService } from '../data.service';
import { Inquiry } from '../../models/inquiry-interface';

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
  products: Inquiry[] = [];
  searchValue: string | undefined;
  globalFilterFields: string[] = [
    'id',
    'name',
    'description',
    'organization',
    'email',
    'municipality',
    'adress',
    'status',
    'processing',
    'deadline',
    'start date',
    'end date',
  ];

  selectedProduct!: Inquiry;

  @ViewChild('dt1') dt1!: Table;
  inquiries: Array<Inquiry> = [];

  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.dataService.getData().subscribe(
      response => {
        this.inquiries = response;

        this.products = [];

        for (const inquiry of this.inquiries) {
          inquiry.id = inquiry['id'] || 0;
          inquiry.navn = inquiry['navn'] || '';
          inquiry.beskrivelse = inquiry['beskrivelse'] || '';
          inquiry.kunde_epost = inquiry['kunde_epost'] || '';
          inquiry.kommune = inquiry['kommune'] || '';
          inquiry.gateadresse = inquiry['gateadresse'] || '';
          inquiry.status = inquiry['status'] || '';
          inquiry.behandlingsfrist = inquiry['behandlingsfrist'] || '';
          inquiry.fra_dato = inquiry['fra_dato'] || '';
          inquiry.til_dato = inquiry['til_dato'] || '';

          this.products.push({
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
          });
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
}
