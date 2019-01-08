#!/usr/bin/env node

const csv = require('csv-streamify')
const fs = require('fs')
 
const db = require('../models');

const program = require('commander');
const queue = require('queue');
 
let q = queue();
 
let csvfile;

program
  .version('0.0.0', '-v, --version')
  .arguments('<CSVfile>')
  .action(function (csv) {
     csvFile = csv;
  });

program.parse(process.argv);

if (typeof csvFile === 'undefined') {
  console.error('No lat/long CSV file provided!');
  process.exit(0);
}

let queueDone = false;
let fileDone = false;

/**
 * Database write queue
 */
q.on('success', (result, job) => {
  console.log('Success');
  console.log(result);
});

q.on('error', (err, job) => {
  console.log('Error');
  console.log(err, job);
});

q.on('end', (err) => {
  console.log('end');
  queueDone = true && fileDone;

  if (queueDone && fileDone) {
    console.log('Done\nCheerio!');
    process.exit(0);
  }
});

q.autostart = true;
q.start(function (err) {
  if (err) throw err;
  console.log('starting');
});

/**
 *Try CSV file
 */
console.log(`Processing ${process.cwd()}/${csvFile}`);
const rs = fs.createReadStream(`${process.cwd()}/${csvFile}`);

rs.on('error', function(){ 
  console.error('File does not exist. Check to make sure the file path to your csv is correct.');
  process.exit(0);
});

const parser = csv({ objectMode: true }, function (err, result) {
  console.log('Done reading CSV file');
  if (err) throw err

  fileDone = true;
  if (queueDone && fileDone) {
    console.log('Done\nCheerio!');
    process.exit(0);
  }
});

rs.pipe(parser);
 
/**
 * Emits each line as a buffer or as a string representing an array of fields
 *
 * 0 - address
 * 7 - longitude
 * 8 - latitude
 */
parser.on('data', function (line) {
  q.push((done) => {
    console.log('Searching: ', line[0]);
    db.Report.update(
      {'Location Address': line[0]}, 
      {$set: {'Location GeoJSON': {
        type: 'Point',
        coordinates: [parseFloat(line[7]), parseFloat(line[8])]
      }}}, 
      done);
    });
});
 
