Spørsmål
- Valg av rammeverk, Angular.
- Geoide modell? med modul eller Geomatikk API
- Kravspeksifikasjon konkret på ark?
- Snakk me UX/UI for design av applikasjons grensesnitt
- Konvertering mellom koordinatsystem
- Keeper og Xledger


## Issues
- Geoide modell
- Krav spesifikasjon 
- Interface for parsing av CSV over til JSON? GeoJSONDatasource?
- FASTAPI python. Research?
- Angular web dev 
- Test rammeverk?

## Geomatikk
Lat,lon, height
Meter over havet/Ortometerisk
NN2000

Geoide modell
Global mean sea level
Gjennomsnittlig høyde over havet.

Dokumentasjon til API:
https://ws.geonorge.no/transformering/v1/#/

Link til transformasjonskoder:
https://register.geonorge.no/epsg-koder/wgs84-geografisk
https://register.geonorge.no/epsg-koder/nn2000-hoyde

## Webdev

Eksempel utgangspunkt
https://cesium.com/blog/2023/02/14/gilytics-plans-energy-systems-with-cesiumjs/

Back-end:
- Tilgang til Prod database for innhenting av data? eller dummy database?
- Interface som enten jobber direkte med utgangspunkt i JSON. 
  Eller som alternativt jobber med en database slik at implementasjonen tillater å bruke alle typer språk og utviklingsverktøy.

Front-end: 
- Dynamisk camera som kan modifiseres etter behov. Eller camera movements som er intuitiv og enkel og bruke i denne sammenhengen. 
- Transparency, evt. layers for å kunne vise fram ledninger. Knapp som kan toggle dette?
- Grensesnitt med buttons e.l som er brukervennlig og er slik at 
bruker kan enkelt dra nytte fra programmet
- Legge inn waypoints/points på kartet

- Front-end Rammeverk som Angular eller React til å lage dette til en hel
applikasjon.
  - Visual
      - Kan ha features som history, eksempelvis scener lagre hvor brukeren sist var. Redux e.l eller table i datbase med bruker innstillinger?
      - Applikasjon som kan kjøre lokalt med muligheten for flere instanser o.l av cesium for visualisering. 
      - Modifisere objekter i scenen e.l for planlegging som igjen kan lagres e.l
      - Oppbevare den gamle data/layers i cache e.l og ikke i scenen for performance så alt slipper og være inne i Cesium?
  - Performance
    - Custom rendering "https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/"

