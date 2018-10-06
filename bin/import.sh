#!/usr/bin/env node

const importer = require('../lib/csvMongooseImport');
const db = require('../models');

const program = require('commander');

program
  .version('0.0.0', '-v, --version')
  .arguments('<CSVfile>')
  .action(function (csv) {
     csvFile = csv;
  });

program.parse(process.argv);

if (typeof csvFile === 'undefined') {
  console.error('No CSV file provided!');
  process.exit(0);
}

importer.importCsv(csvFile, (err, results) => {
  if (err) {
    console.error(err.message);
    process.exit(0);
  }

  importer.writeRecords(results, (err, results) => {
    if (err) {
      console.error(err.message);
      process.exit(0);
    }

    db.Report.introduceNeighbours((err, results) => {
      if (err) {
        console.error(err.message);
        process.exit(0);
      }

      console.log('Done\nCheerio!');
      process.exit(0);
    });
  });
});
