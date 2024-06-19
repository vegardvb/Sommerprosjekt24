import { Directive, OnInit , ElementRef} from '@angular/core';

@Directive({
  selector: '[cesium_container]',
  standalone: true
})
export class CesiumDirective implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    console.log('CesiumDirective initialized');
    const viewer = new Cesium.Viewer(this.el.nativeElement);
  }

}
