# osm-simple-features
Defines an opinionated mapping from OSM to simple GeoJSON features with multiple layers and defined schemas.


## taginfo

We use taginfo to derive the first phase JSON schema of the OSM simple feature model.

https://taginfo.openstreetmap.org/download


# Schemas

## Phase 0

In phase 0 we machine generate a JSON schema trying to capture all keys with a wiki page and values from taginfo.
If a key seems to have prevalent tags we start assuming we assign enum types to those keys.

## Phase 1

In phase 1 we curate the full on layer tagging schema and actively add or remove certain properties from the schema.

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
