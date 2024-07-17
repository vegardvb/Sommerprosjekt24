# SQL konvensjon

**: For relasjoner mellom tables som f.eks
measurement**point
inquiry\_\_inquiry_measurement

Geometry_with_details:

Bygges med Postgres json funksjoner sammen med PostGIS

st_asgeojson uten integer : Trenger bare BBOX på collection WGS84 skal være standard på alle mål og
ved default blir det oppgitt crs som beskriver om det ikke er WGS84 (ESPG:4326)

json_build_object :
(ish)
{
"type" : "Feature",

  <!-- Må være på denne formen for å være gyldig geojson -->

"geometry":
{
"LineString",
"coordinates": [
[
10.342793,
63.351296
],
[
10.3427,
63.350894
],
[
10.3431,
63.35064
]
],
}
"properties": {
"metadata" : {
27 (punkt_id) : {"x": 267093.22, "y": 7033197.31, "lat": 63.351296, "lon": 10.342793, "PDOP": 1, "height": 99.76, "comment": "", "fixType": "rtk", "accuracy": 0.86, "timestamp": 1607499898284, "numSatellites": 10, "numMeasurements": 1, "verticalAccuracy": 0.87},
28 (punkt_id) : {"x": 267093.22, "y": 7033197.31, "lat": 63.351296, "lon": 10.342793, "PDOP": 1, "height": 99.76, "comment": "", "fixType": "rtk", "accuracy": 0.86, "timestamp": 1607499898284, "numSatellites": 10, "numMeasurements": 1, "verticalAccuracy": 0.87}
.....
......
.......
}
}
}

## Metadata ledning

Er jo i utganspunktet ute etter avik i ledningen så må jo naturligvis da gi en liste over alle punkter med relevant metadata samt faktisk geometry for scene hvor punkter er sammensatt av disse ledningene.

Klassifisere ledninger opp i mot metadata til punkter. Slik at dersom en ledning hovres eller skal inspiseres så er den relatert til noe metadata. Gir derfor en samling av all geometri som skal vises fra hvor det er seperert i ledninger og punkter. Ledninger får en key som relaterer til de faktiske punktene den er sammmensatt av slik at disse loades inn når den trykkes på e.l

Så total gis det 2 store JSON objekter. 1 til scenen med geometri. Og ett tilleggs objekt for alle punkter som ledninger er sammensatt av med deres metadata hvor ledninger inneholder ID'en sin i properties som relaterer til en samling av punkter relatert gjennom den ID'en.

Kan bruke array_to_json for å transformere vanlige verdier til json og legge til metadata

- Hvert point med properties
- Legge til metadata
- Tilrettelegging for POST til å endre ledningsmålinger.
