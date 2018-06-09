#!/usr/bin/env node
'use strict';
const fs = require('fs');
const program = require('commander');
const ldj = require('ldjson-stream');

function propertyForKey(key) {
	const schema = {
		'type': 'string'
	};
	if (key.prevalent_values.length > 0 && key.detailed_values.length && key.values_all < 30000) {
		schema.examples = key.detailed_values
			.filter((d) => {
				return (d.description || d.in_wiki || (d.fraction > 0.10 && d.count > 20) || d.count > 5000);
			})
			.map((d) => d.value);
	}

	if (schema.examples && schema.examples.indexOf('yes') >= 0 && schema.examples.indexOf('no') < 0) {
		schema.examples.push('no');
	}
	return schema;
}

function schemaForFeature(keys) {
	const properties = {};
	keys.forEach((key) => {
		properties[key.key] = propertyForKey(key);
	});
	const schema = {
		'type': 'object',
		'definitions': {},
		'$schema': 'http://json-schema.org/draft-07/schema#',
		'properties': properties
	};
	return schema;
}

program
  .description('Generate JSON schema for all documented taginfo keys and tags')
	.usage('[options] <key-stats>')
  .parse(process.argv);

function run(keyStatsFile) {
	const keys = [];
	fs.createReadStream(keyStatsFile)
		.pipe(ldj.parse())
		.on('data', (key) => {
			keys.push(key);
		})
		.on('end', () => {
			console.log(JSON.stringify(schemaForFeature(keys)));
		});
}

if (program.args.length === 1) {
	run(program.args[0]);
}
