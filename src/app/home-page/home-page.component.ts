import { Component } from '@angular/core';
import { InquiryListComponent } from '../inquiry-list/inquiry-list.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  imports: [InquiryListComponent, NavbarComponent, FooterComponent],
})
export class HomePageComponent {}
