
## Overview

Component: En spesifikk byggestein i nettside som er en del av den totale DOM.
Eksempel:
Button, navbar, Cesium vindu

Opererer som definert i eget HTML template og kan kombineres med andre komponenter i hoved HTML template.

Directive: Logikk for å samhandle med DOM. Styre hvordan UI blir presentert og behaviour.

Opererer generelt basert på CSS selectors i DOM.

Eksempel:
Attribute directives:
color-directive e.l
Logikk for endring av farge, endring av farge ved hover etc..

Structural directives:
authentication-directive e.l
Fjerne eller inkludere elementer i DOM basert på authentisering etc..

Service: En operasjon eller tjeneste tilgjengelig for samhandling mellom komponenter. 
Eksempel:
Reusable business logic, state management og utility functions.

Opererer ved hjelp av importering direkte i komponent gitt at komponent har tilgang til spesifisert provider.


### Button Component example

Component: 
---
import { Component } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html', // Reference to external HTML file
  styleUrls: ['./button.component.css']   // Reference to external CSS file
})
export class ButtonComponent {
  isPressed = false;

  togglePressed() {
    this.isPressed = !this.isPressed;
  }
}
---

Directive (Hover):
---
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverEffect]'
})
export class HoverEffectDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = 'red'; // Color when hovered
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = null; // Reset to default
  }
}
---

---
@Injectable({
  providedIn: 'root'
})
export class ButtonStateService {
  private pressedSource = new BehaviorSubject<boolean>(false);
  public pressed$ = this.pressedSource.asObservable();

  togglePressed() {
    const current = this.pressedSource.value;
    this.pressedSource.next(!current);
  }
}
---


### Feature modules og Standalone

Features modules er samligner av components, directives og services som er tett koblet sammen og kan grupperes for å systematisk strukturere applikasjonen i følge modulært design.

Ett skifte mot å bruke standalone framfor feature modules som har mer overhead og er større ved mindre moduler.

Men for Cesium som er en stor modul med mye egen konfigurasjon og state så vil det være naturlig og separere det som en feature module. 

## Detaljert

### Component
Utgjør hovedblokkene i applikasjonen. Alt er delt opp i components som virker som typescript classes med referanse til ett css script og ett js script som en React component.

- Selector field:
  - Type selector: HTML Tag e.l
  - Attribute: eks type, src o.l
  - Class selector: ".menu-item"

Angular lager en instans av hver component hvor HTML inkluderer en referanse til selector field i HTML fil som renderes til DOM.

Dette spesifiseres ved bruk av template field for å beskrive hvor dette vil bli gjort.

ng-content representerer det som er "inni" en componenten på HTML nivå slik at det kan redigere utsiden.


ng-content kan brukes i sammehenger hvor man lager komponenter som tar utgangspunkt i statiske elementer i siden.
---
<!-- Component template -->
<div class="card-shadow">
  <ng-content select="card-title"></ng-content>
  <div class="card-divider"></div>
  <ng-content select="card-body"></ng-content>
</div>

<!-- Using the component -->
<custom-card>
  <card-title>Hello</card-title>
  <card-body>Welcome to the example</card-body>
</custom-card>

<!-- Rendered DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    <card-body>Welcome to the example</card-body>
  </div>
</custom-card>
---



### Service
En service brukes for Dependency injection slik at komponenter kan dele logikk. Muligens også ett directive.

Bruker @Injectable og definerer hvilket html element som er provider. Mottaker kan da importere servicen og behandle det som ett objekt. 

---
import {Injectable} from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class CalculatorService {
  add(x: number, y: number) {
    return x + y;
  }
}
---
---
import { Component } from '@angular/core';
import { CalculatorService } from './calculator.service';
@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculatorService = inject(CalculatorService);
  totalCost = this.calculatorService.add(50, 25);
}
'
---

### Directive
Adds behaviour. Brukes når du skal modifisere DOM med objekter e.l fra scripts til å dynamisk endre DOM.

Bruker de innebygde klassene her også som switchcase ,for-loop og alt det der.

Types:
 - Components
 - Attribute directives
 - Structural directives

#### Attribute directives
For endringer av attributes

Har base classes av directives til å gjøre dette.

Common directives	Details
NgClass	Adds and removes a set of CSS classes.
NgStyle	Adds and removes a set of HTML styles.
NgModel	Adds two-way data binding to an HTML form element.

---
<!-- toggle the "special" class on/off with a property -->
<div [ngClass]="isSpecial ? 'special' : ''">This div is special</div>
---

---
currentClasses: Record<string, boolean> = {};
...
  setCurrentClasses() {
    // CSS classes: added/removed per current state of component properties
    this.currentClasses = {
      saveable: this.canSave,
      modified: !this.isUnchanged,
      special: this.isSpecial,
    };
  }
---
I dette tilfelle settes det flere classes til et html element som kan dynamisk endres for html elementet ved bruk av ett Record med disse boolean som forteller om elementet er en del av en klasse. Ett Record er ett map med Type safety. Kan tenkes som ett vanlig map i Java. Setter da classes til html elementet som det ville vært i vanlig html.


Ng-style implementeres på samme måte.


#### Structural directives
Common built-in structural directives	Details
NgIf	Conditionally creates or disposes of subviews from the template.
NgFor	Repeat a node for each item in a list.
NgSwitch	A set of directives that switch among alternative views.

---
<app-item-detail *ngIf="isActive" [item]="item"></app-item-detail>
---

### Template syntax
Variabler kan defineres slik som i Java med private, public osv osv.
Dette gjøres i html templates hvor variabler som er definert i relatert script kan brukes dersom de er tilgjengelige. 

Interpolation kan gjøres med {{variable}} i HTML templates.

For dynamiske attributes på HTML elementer så kan det brukes attr

"The brackets, [], cause Angular to evaluate the right-hand side of the assignment as a dynamic expression."
---
<!-- Dynamically setting an aria-label attribute -->
<button [attr.aria-label]="dynamicLabel">Click me</button>

@Component({
  // Component metadata
})
export class MyComponent {
  dynamicLabel = 'Description of the button';
}
---

#### Event handling
For å registere metoder som blir kalt i relaterte komponenter så legges det inn event med funksjonen som skal bli kalt dersom det inntreffer. 

Observer pattern. Samme som vanlig javascript.

---
<button type="button" (click)="deleteHero()">Delete hero</button>
---


#### Binding
Angular templates lager binidings som holder styr på oppdateringer i.f.m events og oppdateringer som skjer der. 

Examples of binding include:

text interpolations
property binding
event binding
two-way binding



