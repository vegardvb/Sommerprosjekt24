import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToggleService {
  private toggleSubject = new Subject<void>();

  toggle$ = this.toggleSubject.asObservable();

  toggleView(): void {
    this.toggleSubject.next();
  }
}
