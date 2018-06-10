#!/usr/bin/env node
'use strict';
const fs = require('fs');
const program = require('commander');
const stream = require('stream');
const streamify = require('stream-array');
const ldj = require('ldjson-stream');

function propertyToRow() {
  return new stream.Transform({
    objectMode: true,
    transform(property, encoding, callback) {
      callback(null, [
        true,
        property.key,
        property.value.type,
        property.value.taginfo.usersAll,
        property.value.taginfo.countAll,
        property.value.taginfo.valuesAll,
      ].join(',') + '\n');
    }
  });
}

program
  .description('Generate CSV file for all properties in a JSON schema')
	.usage('[options] <jsonschema> <csvfile>')
  .parse(process.argv);

function run(jsonSchemaFile, csvFile) {
	const schema = JSON.parse(fs.readFileSync(jsonSchemaFile));
  const properties = Object.keys(schema.properties).map((key) => ({
    key: key,
    value: schema.properties[key]
  }));
  streamify(properties)
		.pipe(propertyToRow())
    .pipe(fs.createWriteStream(csvFile))
		.on('end', () => {
		});
}

if (program.args.length === 2) {
	run(program.args[0], program.args[1]);
} else {
  program.help();
}
