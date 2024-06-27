import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { Math as cesiumMath, Cartesian2, Cartesian3 } from 'cesium';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective],
})
export class MapViewComponent implements OnInit {
  inquiryId: string | undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      this.filterMapByInquiryId(this.inquiryId);
    });
  }

  filterMapByInquiryId(inquiryId: string | undefined) {
    if (inquiryId) {
      console.log('Filtering map for inquiry ID:', inquiryId);
      // TODO: Fetch and display the relevant data on the map
    }
  }

  viewModel = {
    translucencyEnabled: true,
    fadeByDistance: true,
    showVectorData: false,
    alpha: 0.8,
  };

  updateCesium(): void {
    const event = new CustomEvent('viewModelChange', {
      detail: this.viewModel,
    });
    window.dispatchEvent(event);
  }

  computeCircle(radius: number) {
    const positions = [];
    for (let i = 0; i < 360; i++) {
      const radians = cesiumMath.toRadians(i);
      positions.push(
        new Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians))
      );
    }
    return positions;
  }
}
