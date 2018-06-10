#!/usr/bin/env node
'use strict';
const fs = require('fs');
const program = require('commander');
const yaml = require('js-yaml');
const ldj = require('ldjson-stream');
const stream = require('stream');

function filterGeometryTypes(geomTypes) {
  // if no explicit filtering set we allow everything
  if (!geomTypes) return stream.PassThrough();
  const types = new Set(geomTypes);
  return new stream.Transform({
    objectMode: true,
    transform(geojson, encoding, callback) {
      if (!geojson.geometry || !geojson.geometry.type) return callback(null);
      const isLine = geojson.geometry.type === 'LineString' || geojson.geometry.type === 'MultiLineString';
      const isPoly = geojson.geometry.type === 'Polygon' || geojson.geometry.type === 'MultiPolygon';
      const isPoint = geojson.geometry.type === 'Point';

      if (isLine && types.has('linestring')) {
        callback(null, geojson);
      } else if (isPoint && types.has('point')) {
        callback(null, geojson);
      } else if (isPoly && types.has('polygon')) {
        callback(null, geojson);
      } else {
        callback(null);
      }
    }
  });
}

program
  .description('Generate JSON schema for all documented taginfo keys and tags')
  .usage('[options] <layer-mapping-file>')
  .parse(process.argv);

function run(mappingConfigFile) {
  const mapping = yaml.safeLoad(
    fs.readFileSync(mappingConfigFile,
    { encoding: 'utf8' })
  ).mapping;

  process.stdin
    .pipe(ldj.parse())
    .pipe(filterGeometryTypes(mapping.geometry_types))
    .pipe(ldj.serialize())
    .pipe(process.stdout);
}

if (program.args.length === 1) {
  run(program.args[0]);
}
