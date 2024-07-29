import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidenavLinkComponent } from './sidenav-link.component';
import { RouterModule, provideRouter } from '@angular/router';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SidenavLinkComponent', () => {
  let component: SidenavLinkComponent;
  let fixture: ComponentFixture<SidenavLinkComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidenavLinkComponent,
        RouterModule,
        // Provide router with an empty configuration, which is typical in a test setup.
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavLinkComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default routerLinkActiveOptions as { exact: false }', () => {
    expect(component.routerLinkActiveOptions).toEqual({ exact: false });
  });

  it('should render the routerLink if provided', () => {
    const testLink = '/test-link';
    component.routerLink = testLink;
    fixture.detectChanges();

    const linkElement = debugElement.query(By.css('a')).nativeElement;
    expect(linkElement.getAttribute('ng-reflect-router-link')).toBe(testLink);
  });
});
