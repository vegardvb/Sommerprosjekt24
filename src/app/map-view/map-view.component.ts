import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
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
}
