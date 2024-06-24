import { Component } from '@angular/core';
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
export class ProjectDataComponent {
  details: any;

  projectName: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {
    this.projectName = this.route.snapshot.paramMap.get('name');

    this.dataService.getDetails().subscribe(
      (data) => {
        this.details = data; // Assign response to your variable
        console.log('Details:', this.details);
      },
      (error) => {
        console.error('Error:', error);
        // Handle error as needed
      },
    );
  }
}
