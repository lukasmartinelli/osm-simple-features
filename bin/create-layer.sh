#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

function extract_layer() {
  local pbf_file="$1"
  local layer_name="$2"
  local work_dir="./build"
  mkdir -p "$work_dir"

  echo "Building config files for osmium tags-filter and export in ${work_dir}"
  ./bin/build-osmium-configs.js "./layers/${layer_name}.yml" "${work_dir}/${layer_name}.config.json" "${work_dir}/${layer_name}.filter.txt"

  local filtered_pbf="${work_dir}/${layer_name}.osm.pbf"
  echo "Filtering PBF file ${pbf_file} to $filtered_pbf"
  # cp $pbf_file "${work_dir/${layer_name}.osm.pbf"
  osmium tags-filter --overwrite --expressions "${work_dir}/${layer_name}.filter.txt" --output "$filtered_pbf" --fsync "$pbf_file"

  local ldgeojson_file="${work_dir}/${layer_name}.geojson"
  echo "Creating simple GeoJSON features from $filtered_pbf in $ldgeojson_file"
  osmium export "$filtered_pbf" --overwrite -f geojsonseq --omit-rs --config "${work_dir}/${layer_name}.config.json" --output "$ldgeojson_file"

  echo "Successfully created simple GeoJSON features in $ldgeojson_file"
}

extract_layer "$1" "$2"
