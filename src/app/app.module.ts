import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProjectListComponent } from './project-list/project-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { DataService } from './data.service';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [TableModule, BrowserModule, ProjectListComponent, CommonModule],
  declarations: [],
  providers: [DataService],
})
export class AppModule {}
