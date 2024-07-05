import { TestBed } from '@angular/core/testing';
import { SidenavComponent } from './sidenav.component';
import { SidenavService } from './sidenav.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CableInfoService } from '../cable-info.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

class ActivatedRouteStub {
  private subject = new BehaviorSubject(convertToParamMap({}));
  paramMap = this.subject.asObservable();

  setParamMap(params: {}) {
    this.subject.next(convertToParamMap(params));
  }
}

describe('SidenavComponent', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], 
      declarations: [], 
      providers: [
        SidenavService,
        CableInfoService,
        { provide: ActivatedRoute, useClass: ActivatedRouteStub }
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SidenavComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

});
