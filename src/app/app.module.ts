import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './data.service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

@NgModule({
  imports: [TableModule, BrowserModule, InquiryListComponent],
  declarations: [],
  providers: [DataService, provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [],
})
export class AppModule {}
