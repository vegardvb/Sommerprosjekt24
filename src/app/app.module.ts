import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './data.service';
import { TerrainService } from './services/terrain.service';

@NgModule({
  imports: [TableModule, BrowserModule, InquiryListComponent],
  declarations: [],
  providers: [DataService, TerrainService],
  bootstrap: [],
})
export class AppModule {}
