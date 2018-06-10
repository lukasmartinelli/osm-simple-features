# osm-simple-features

Defines an opinionated mapping from OSM to simple GeoJSON features with multiple layers and defined schemas.


## taginfo

We use taginfo to derive the first phase JSON schema of the OSM simple feature model.

https://taginfo.openstreetmap.org/download


# Schemas

## Phase 0

In phase 0 we generate a JSON schema trying to capture all keys with a wiki page and values from taginfo. This version of the schema is generated using code and is meant to be an initial catch all layer documenting which keys are available to us.

## Phase 1

In phase 1 we remove tags that are import specific or hyperlocal from the full on layer tagging schema.

Phase 1 should contain a single layer full property schema supporting all tags that are then dispensed into layers in Phase 2.

## Phase 2

In phase 2 we split out the features into individual layers with their own loose JSON schema.

## Phase 3

A tight and curated JSON schema for every layer from phase 2.


```
wget https://taginfo.openstreetmap.org/download/taginfo-wiki.db.bz2
bzip2 -d taginfo-wiki.db.bz2
```

```
wget -O dc.osm.pbf https://download.geofabrik.de/north-america/us/district-of-columbia-latest.osm.pbf
osmium export dc.osm.pbf \
        -f geojsonseq \
        --omit-rs
```
