#!/usr/bin/env node

const fs = require('fs');
const exporter = require('../lib/csvMongooseExport');

const program = require('commander');

program
  .version('0.0.0', '-v, --version')
  .arguments('<DestinationDirectory>')
  .action(function (dest) {
     destDir = dest;
  });

program.parse(process.argv);

if (typeof destDir === 'undefined') {
  console.error('Provide a destination directory');
  process.exit(0);
}
console.log(`${destDir}/consolidated-.csv`)
if (!fs.existsSync(destDir)) {
  console.error('Destination directory does not exist');
  process.exit(0);
}

exporter.exportCsv((err, results) => {
  if (err) {
    console.error(err.message);
    process.exit(0);
  }

  exporter.writeFiles(results, destDir, (err) => {
    if (err) {
      console.error(err.message);
      process.exit(0);
    }

    console.log('Done\nCheerio!');
    process.exit(0);
  });
});
