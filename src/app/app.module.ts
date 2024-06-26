import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InquiryListComponent } from './inquiry-list/inquiry-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  imports: [TableModule, BrowserModule, InquiryListComponent, AppComponent],
  declarations: [],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
