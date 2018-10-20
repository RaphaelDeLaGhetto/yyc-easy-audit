#!/usr/bin/env node

const db = require('../models');

const program = require('commander');

program
  .version('0.0.0', '-v, --version')
  .arguments('<SourceProperty>')
  .arguments('[asc|desc]')
  .arguments('[DestinationProperty...]')
  .action(function (src, dir, dest) {
     srcProp = src;
     relationshipDirection = dir;
     if (dest) {
       destProp = dest[0];
     }
  });

program.parse(process.argv);

let err = false;
if (typeof srcProp === 'undefined') {
  console.error('No source property provided');
  err = true;
}

if (typeof relationshipDirection === 'undefined') {
  console.error('Which way? asc|desc');
  err = true;
}

if (err) {
  process.exit(0);
}

db.Report.makeNeighbours(srcProp, relationshipDirection, destProp, (err, msg) => { 
  if (err) {
    console.error(err);
  }
  console.log(msg);
  process.exit(0);
});
