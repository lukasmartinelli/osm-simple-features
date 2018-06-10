#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

function extract_layer() {
  local layer_name="$1"
  local work_dir="./build"
  local ldgeojson_file="${work_dir}/${layer_name}.geojson"
  local mbtiles_file="${work_dir}/${layer_name}.mbtiles"
  echo "Creating tiles for preview from $ldgeojson_file in $mbtiles_file"
  tippecanoe \
      --read-parallel \
      --no-tile-size-limit \
      --force -o "$mbtiles_file" \
      -zg \
      -l "$layer_name" \
      --exclude '@version' --exclude '@changeset' \
      --exclude '@timestamp' --exclude '@type' "$ldgeojson_file"

  mbview "$mbtiles_file"
}

extract_layer "$1"
