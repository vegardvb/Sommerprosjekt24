import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './data.service';

@NgModule({
  imports: [TableModule, BrowserModule, InquiryListComponent],
  declarations: [],
  providers: [DataService],
  bootstrap: [],
})
export class AppModule {}
