#!/usr/bin/env node

const importer = require('../lib/geoJsonImport');

const program = require('commander');

const fs = require('fs');

program
  .version('0.0.0', '-v, --version')
  .arguments('<JSONfile>')
  .action(function (json) {
     jsonFile = json;
  });

program.parse(process.argv);

if (typeof jsonFile === 'undefined') {
  console.error('No JSON file provided!');
  process.exit(0);
}

let json;
try {
  json = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
  console.log(json);
} catch(e) {
  console.error('File does not exist. Check to make sure the file path to your JSON is correct.');
  process.exit(0);
}

importer.loadSavedGeoJson(json, (err, results) => {
  if (err) {
    console.error(err.message);
    process.exit(0);
  }

  console.log('Done\nCheerio!');
  process.exit(0);
});
