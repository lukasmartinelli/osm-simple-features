#!/usr/bin/env node
'use strict';
const fs = require('fs');
const program = require('commander');

program
  .description('Remove specified keys from JSON schema')
	.usage('[options] <json-schema>')
	.option('--exclude-keys [file]>', 'File of line delimited keys to exclude')
  .parse(process.argv);

function run(schemaFile, excludeKeys) {
  const exclude = new Set(fs.readFileSync(excludeKeys).toString().split('\n').map((s) => s.trim()).filter((s) => !!s));
  const schema = JSON.parse(fs.readFileSync(schemaFile));
  Object.keys(schema.properties)
    .filter((k) => exclude.has(k))
    .forEach((k) => {
      delete schema.properties[k];
    });
  console.log(JSON.stringify(schema));
}

if (program.args.length === 1) {
	run(program.args[0], program.excludeKeys);
}
