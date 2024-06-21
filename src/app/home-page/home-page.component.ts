import { Component } from '@angular/core';
import { ProjectListComponent } from '../project-list/project-list.component';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';

@Component({
    selector: 'app-home-page',
    standalone: true,
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.css',
    imports: [ProjectListComponent, NavbarComponent, FooterComponent]
})
export class HomePageComponent {

}
