import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { Math as cesiumMath, Cartesian2 } from 'cesium';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective],
})
export class MapViewComponent implements OnInit {
  [x: string]: any;
  inquiryId: number | undefined;
  CesiumDirective!: CesiumDirective;

  constructor(
    private route: ActivatedRoute ){}



  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      this.filterMapById(this.inquiryId);
    });
  }

  filterMapById(inquiryId: number | undefined) {
    if (inquiryId) {
      console.log('Filtering map for inquiry ID:', inquiryId);
    }
  }
}