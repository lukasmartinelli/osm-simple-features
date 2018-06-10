#!/usr/bin/env node
'use strict';
const fs = require('fs');
const program = require('commander');
const ldj = require('ldjson-stream');

function propertyForKey(key) {
	const schema = {
		type: 'string',
    taginfo: {
      usersAll: key.users_all,
      countAll: key.count_all,
      valuesAll: key.values_all,
      prevalentValues: key.prevalent_values.map((v) => v.value)
    }
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
	.option('--min-users [users]>', 'Min users required using the key to include key in schema', 40)
  .parse(process.argv);

function run(keyStatsFile, minUsers) {
	const keys = [];
	fs.createReadStream(keyStatsFile)
		.pipe(ldj.parse())
		.on('data', (key) => {
      if (key.users_all >= minUsers) {
        keys.push(key);
      }
		})
		.on('end', () => {
			console.log(JSON.stringify(schemaForFeature(keys)));
		});
}

if (program.args.length === 1) {
	run(program.args[0], parseInt(program.minUsers, 10));
}
