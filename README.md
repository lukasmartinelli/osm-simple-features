# osm-simple-features

Provides tools and an opinionated mapping to convert the OSM objects into simple GeoJSON features with multiple layers and well defined schemas.


## Layers

The mapping from the OSM free tagging scheme to layers is defined in `layers` as YAML
configuration files.

## How to use

Install.

```bash
# to create layers
$ npm install
$ brew install osmium-tool
# if you want to create tiles for previewing
$ brew install tippecanoe
```

Create the `building` layer from an OSM extract.

```bash
# download extract
$ wget -O dc.osm.pbf https://download.geofabrik.de/north-america/us/district-of-columbia-latest.osm.pbfa
# create layer from extract
$ npm run create-layer ./dc.osm.pbf building
Building config files for osmium tags-filter and export in ./build
Filtering PBF file ./dc.osm.pbf to ./build/building.osm.pbf
Creating simple GeoJSON features from ./build/building.osm.pbf in ./build/building.geojson
Successfully created simple GeoJSON features in ./build/building.geojson
```

Create vector tiles from that layer for preview.

```bash
$ npm run create-tiles building
```

### Layer Mapping

A layer mapping configuration file defines **which data elements and their tags** are mapped into their own layer.

```yaml
mapping:
  # define which object types you want to match
  object_types:
  - node
  - way
  - relation
  # define the tags that need to be matched for this layer
  filter_tags:
    building:
    - yes
  # define the tags to treat closed ways as linestrings
  linear_tags:
  - building!=*
  # define the tags indicating this object is an area not an outline
  area_tags:
  - building
  # define the tags to keep, all other tags are thrown away when transforming into simple features
  include_tags:
  - building
  - height
```

# Layers

The out of the box layers are oriented toward the [**primary features of OpenStreetMap**](https://wiki.openstreetmap.org/wiki/Map_Features#Primary_features).
