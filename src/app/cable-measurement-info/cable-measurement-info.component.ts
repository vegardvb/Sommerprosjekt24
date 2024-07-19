import { Component, OnInit } from '@angular/core';
import { CableInfoService } from '../cable-info.service';
import { CableInfo } from '../../models/cable-info';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FieldsetModule } from 'primeng/fieldset';
import { TreeTableModule } from 'primeng/treetable';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-cable-measurement-info',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FieldsetModule,
    TreeTableModule,
    AccordionModule,
  ],
  templateUrl: './cable-measurement-info.component.html',
  styleUrls: ['./cable-measurement-info.component.css'],
})
export class CableMeasurementInfoComponent implements OnInit {
  cableInfo: CableInfo[] = [];
  inquiryId: string | null = null;

  constructor(
    private cableInfoService: CableInfoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      if (this.inquiryId) {
        this.fetchCableInfo(this.inquiryId);
      } else {
        console.error('Inquiry ID not found in the query parameters');
      }
    });
  }

  fetchCableInfo(inquiry_id: string): void {
    this.cableInfoService.getData(inquiry_id).subscribe({
      next: (response: CableInfo[]) => {
        this.cableInfo = response;
      },
      error: error => {
        console.error('Error fetching data:', error);
      },
      complete: () => {},
    });
  }
}
