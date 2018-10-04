#!/usr/bin/env node

const fs = require('fs');

const helper = require('../lib/leafletHelper');

const program = require('commander');

program
  .version('0.0.0', '-v, --version')
  .arguments('<outFile>')
  .action(function (out) {
     outFile = out;
  });

program.parse(process.argv);

if (typeof outFile === 'undefined') {
  console.error('No output filename provided!');
  process.exit(0);
}

helper.makeMarkers((err, results) => {
  if (err) {
    console.error(err.message);
    process.exit(0);
  }

  fs.writeFile(outFile, `markers=${JSON.stringify(results)}`, 'utf8', () => {
    console.log(`Leaflet marker data written to ${outFile}`);
    console.log('Done\nCheerio!');
    process.exit(0);
  });
});


