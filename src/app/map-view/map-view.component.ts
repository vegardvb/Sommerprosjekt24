import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';


@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective],
})
export class MapViewComponent implements OnInit {
  inquiryId: number | undefined;
  @ViewChild(
    CesiumDirective, { static: true }
  )
  cesiumDirective!: CesiumDirective;
  alpha = 1;

  constructor(
    private route: ActivatedRoute 
  ){}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });
  }

  public updateAlpha(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.alpha = inputElement.valueAsNumber;
    this.cesiumDirective.updateGlobeAlpha(this.alpha)
  }
}
