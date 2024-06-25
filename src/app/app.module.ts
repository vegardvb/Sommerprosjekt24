import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProjectListComponent } from './project-list/project-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ProjectDataComponent } from './project-data/project-data.component';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './data.service';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    TableModule,
    BrowserModule,
    ProjectListComponent,
    ProjectDataComponent,
    CommonModule,
    HttpClientModule,
  ],
  declarations: [],
  providers: [DataService],
  bootstrap: [],
})
export class AppModule {}
