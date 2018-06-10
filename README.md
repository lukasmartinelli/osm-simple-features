# osm-simple-features

Defines an opinionated mapping from OSM to simple GeoJSON features with multiple layers and defined schemas.

## Layers

The mapping from the OSM free tagging scheme to layers is defined in `layers` as YAML
configuration files.


```
wget -O dc.osm.pbf https://download.geofabrik.de/north-america/us/district-of-columbia-latest.osm.pbf
osmium export dc.osm.pbf \
        -f geojsonseq \
        --omit-rs
```
