

## Terminologi:
- GLSL: OpenGL shading language. Programmeringspråk for og lage skygger o.l
- Mixins: Tilsvarende ett interface, men er mer i sammenhengen med og gi metoder o.l som kan brukes direkte. Dette er ikke en kontrakt og kan derfor utnyttes i form av Polymorphism.

## Hiearki:
Likt flutter. Alt er delt opp i Widgets hvor Viewer er base widget som er i toppen av hiearkiet. 

- Viewer
    - Base Widget for å  bygge applikasjoner. Samler alle widgets som brukes til en package altså en full løsning som kan brukes. Fungerer som en mediator som styrer alle widgets i scenen.
- Widget
    - 

## Notes

### Primitives
Primitives er brukt for statiske elementer i scenen ulikt entities som har et API som egener seg for dynamisk data og kan oppdatere seg med utgangspunkt i datasource.

Når man bruker primitives i scenen skal de typisk samles i collections med relatete primitiver. Hvor den totale samlingen av primitives skal prioritere og ha få collections med mange elementer over flere collectoins med få elementer.






