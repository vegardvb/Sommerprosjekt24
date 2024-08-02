import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-sidenav-link',
  templateUrl: './sidenav-link.component.html',
  styleUrls: ['./sidenav-link.component.scss'],
  standalone: true,
  imports: [RouterModule, DropdownComponent],
})
export class SidenavLinkComponent {
  @Input()
  routerLink?: string;

  @Input()
  routerLinkActiveOptions: { exact: boolean } = { exact: false };

  constructor(private router: Router) {}

  navigateAndReload(event: Event, routerLink?: string): void {
    event.preventDefault();
    if (routerLink) {
      this.router.navigate([routerLink]).then(() => {
        window.location.reload();
      });
    }
  }
}
