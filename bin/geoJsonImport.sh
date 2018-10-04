#!/usr/bin/env node

const importer = require('../lib/geoJsonImport');

const program = require('commander');
const fs = require('fs');

let jsonFile;

program
  .version('0.0.0', '-v, --version')
  .arguments('<JSONfile>')
  .action(function (json) {
     jsonFile = json;
  });

program.parse(process.argv);

importer.getMissingGeoJson((err, results) => {
  if (err) {
    console.error(err.message);
    process.exit(0);
  }

  const json = JSON.stringify(results);

  if (jsonFile) {
    fs.writeFile(jsonFile, json, 'utf8', () => {
      console.log(`GPS data written to ${jsonFile}`);
      console.log('Done\nCheerio!');
      process.exit(0);
    });
  }
  else {
    console.log('Done\nCheerio!');
    process.exit(0);
  }
});
