
# Backis 101

## Endring av metadata

### Tanke
Enkleste måte tror jeg blir og lage endpoint som tar input av Features i Geojson form[https://www.ibm.com/docs/en/db2/11.5?topic=formats-geojson-format]som brukes
i front-end. Dette er definert i geojson_models som kan bruker direkte i FastAPI ettersom det er Pydantic[https://docs.pydantic.dev/latest/] modeller (Veldig likt models i front-end).
---
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [
              10.436597,
              63.4220986,
              103.483
            ]
          },
          "properties": {
            "metadata": {
              "x": 272340.264,
              "y": 7040733.727,
              "lat": 63.4220986,
              "lon": 10.436597,
              "PDOP": 0.8,
              "height": 103.483,
              "fixType": "rtk",
              "accuracy": 0.014,
              "timestamp": 1720595755444,
              "antennaHeight": 1.8,
              "numSatellites": 23,
              "numMeasurements": 3,
              "verticalAccuracy": 0.018
            },
            "point_id": 4218
          }
---

### Materialized views og views

"point_id" kan så bli brukt til å oppdatere opprinnelig TABLE altså public.ledning_innmaaling_punkt table i public schema. Og deretter
refresh'e alle relaterte materialized views til å reflektere endringene som er gjort på punktene.

Hovedsakling skal dette være "Measurement", "Measurement_Point" og "Point" 
ettersom de er utgangspunktet til de sentrale views som omhandler measurements og points 
og trengs og refreshe.

*Views Hiearki for measurements(geometries/measurements/inquiry/{inquiry_id}) endpoint*:
measurement_geometry_by_inquiry (endpoint for alle measurements)
    - "Measurements_by_inquiry"
    - "Measurements_as_GeoJSON_3D"
        - "Standalone_points_by_Measurement_as_GeoJSON"
        - "Cables_as_GeoJSON_3D"

Ettersom normale views fungerer slik som queries *tror jeg i utganspunktet* at dette skal automatisk bli oppdatert dersom de tildligere nevnte relaterte materialized 
views blir oppdatert. Altså "Measurement", "Measurement_Point" og "Point"

### Oppdatere punkt

For å definere punkt som skal endres filtreres det ved å bruke en UPDATE clause med 
WHERE som presiserer punktet som skal endres. Noe som blir å tilsvare 
noe slikt:
---
UPDATE ledningsmaaling_innmaaling_punkt
SET metadata = :metadata
WHERE id = 4218
---
":metadata" her er da variabelen(placeholder) slik som sql_executer tolker dette 
og er tiltenkt at skal inkludere json med metadata'n på samme format som sendt.

### API håndtering
Istedefor å definere procedures og triggers osv som kan blir litt mer vanskelig så tror jeg det blir enklest å gjøre ved å 
bygge et sql statment som string og execute dette direkte noe likt dette.
---
*Generert av Certified Backis Chat GPT*
def update_table_raw_sql(table_name, update_params, condition_params):
    set_clause = ", ".join([f"{key} = :{key}" for key in update_params.keys()])
    where_clause = " AND ".join([f"{key} = :{key}" for key in condition_params.keys()])
    sql_statement = f"UPDATE {table_name} SET {set_clause} WHERE {where_clause};"
    return sql_statement
---
Blir mest sannsynelig noe mer komplisert ettersom metadata og geometry må endres med omhu men framgangsmåten tror
jeg fortsatt er enkelest er å lage ett sql statement v.h.a string manimulation og json parsing. Kan bruke innebygd geojson modul
og vanlig json modul for å parse geojson som blir gitt.

I tilegg så forholder alle modeller som er definert seg til "__geo_interface__" som ideelt sett bør prøve og 
bruke slik at vi kan utnytte polymorphi på all geometri. 

## Refactoring
I retrospekt så burde faktisk de kompliserte views gjort om til tables inne i schemaet. Dette ville muligens gjort håndtering av endringer mye lettere og implementere,
men har rukket og implementere dette. Ihvertfall de mest omfattende og øverste views i hiearkiet kunne nok bli tables av seg selv og dermed bare refreshe nye entiteter som 
kommer inn. Tilslutt så er triggers på de faktiske tables som gjør at det oppdateres ved nye verdier "end-goal"'et slik at schema blir en mindre oversiktlig versjon i 
denne sammenhengen av public schema med ledningsinnmålinger og relaterte henvendelser i fokus.







