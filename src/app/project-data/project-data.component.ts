import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-project-data',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './project-data.component.html',
  styleUrl: './project-data.component.css',
  providers: [DataService],
})
export class ProjectDataComponent implements OnInit {
  details: any;
  sharedData: any[] = [];

  projectName: string | null = '';

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('name');
  }
}
