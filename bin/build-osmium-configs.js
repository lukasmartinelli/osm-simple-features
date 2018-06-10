#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const program = require('commander');
const stream = require('stream');
const streamify = require('stream-array');
const ldj = require('ldjson-stream');
const yaml = require('js-yaml');
const areaKeys = require('id-area-keys').areaKeys;

function buildFilterExpressions(mapping) {
  const objectTypeFilter = mapping.object_types.map((t) => {
    if (t === 'way') return 'w';
    if (t === 'node') return 'n';
    if (t === 'relation') return 'r';
    if (t === 'area') return 'a';
    throw new Error(`Unsupported type ${t}`);
  }).join('');
  const filterTags = mapping.filter_tags;


  return Object.keys(filterTags).map((key) => {
    const value = filterTags[key];
    if (value === "*" || value === null) {
      return `${objectTypeFilter}/${key}`;
    }
    if (Array.isArray(value)) {
      return `${objectTypeFilter}/${key}=${value.join(',')}`;
    }
  });
}

function buildConfig(mapping) {
  mapping = Object.assign({
    linear_tags: [],
    area_tags: [],
    exclude_tags: [],
    include_tags: []
  }, mapping);

  if (mapping.area_tags === 'iD') {
    mapping.area_tags = Object.keys(areaKeys).map((key) => {
      const values = areaKeys[key];
      if (Object.keys(values).length === 0) {
        return key;
      }
      return key + '=' + Object.keys(values).join(',');
    });
  }

  let extraIncludeTags = [];
  if (mapping.include_tags_mixins) {
    if (mapping.include_tags_mixins.indexOf('name') >= 0) {
      extraIncludeTags = extraIncludeTags.concat(yaml.safeLoad(
        fs.readFileSync(path.join(__dirname, '../layers/mixins/name.yml')),
        { encoding: 'utf8' }
      ));
    }
  }

  return {
    attributes: {
      type: 'osm:type',
      id: 'osm:id',
      version: 'osm:version',
      timestamp: 'osm:timestamp',
      changeset: false,
      uid: false,
      user: false,
      way_nodes: false
    },
    linear_tags: mapping.linear_tags,
    area_tags: mapping.area_tags,
    exclude_tags: [],
    include_tags: mapping.include_tags.concat(extraIncludeTags)
  };
}

program
  .description('Build a osmium filter expressions file and osmium export config file from a single mapping file')
  .usage('[options] <layer-mapping-file> <osmium-export-config-file> <osmium-filter-expressions-file')
  .parse(process.argv);

function run(mappingConfigFile, osmiumConfigFile, filterExpressionsFile) {
  const mapping = yaml.safeLoad(
    fs.readFileSync(mappingConfigFile,
    { encoding: 'utf8' })
  ).mapping;
  const config = buildConfig(mapping);
  const filters = buildFilterExpressions(mapping);
  fs.writeFileSync(
    osmiumConfigFile,
    JSON.stringify(config, null, 2),
    { encoding: 'utf8' }
  );
  fs.writeFileSync(
    filterExpressionsFile,
    filters.join('\n'),
    { encoding: 'utf8' }
  );
}

if (program.args.length === 3) {
  run(program.args[0], program.args[1], program.args[2]);
} else {
  program.help();
}
