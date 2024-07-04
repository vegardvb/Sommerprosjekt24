import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './data.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownComponent } from './dropdown/dropdown.component';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CableMeasurementInfoComponent } from './cable-measurement-info/cable-measurement-info.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TerrainService } from './services/terrain.service';
import { CesiumDirective } from './cesium.directive';
import { MapViewComponent } from './map-view/map-view.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CableMeasurementInfoComponent,
    CesiumDirective,
    DropdownComponent,
    FormsModule,
    InquiryListComponent,
    MapViewComponent,
    TableModule,
    SidenavComponent,
  ],
  providers: [DataService, provideAnimationsAsync(), TerrainService],
  bootstrap: [],
})
export class AppModule {}
