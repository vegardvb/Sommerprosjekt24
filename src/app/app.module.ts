import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProjectListComponent } from './project-list/project-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    TableModule,
    BrowserModule,
    ProjectListComponent,
    AppComponent
  ],
  declarations: [
  ],
  providers: [
  ],
  bootstrap: []
})
export class AppModule { }
