#!/usr/bin/env node

const db = require('../models');

const program = require('commander');

program
  .version('0.0.0', '-v, --version')
  .arguments('<SourceProperty>')
  .action(function (src, dir, dest) {
     srcProp = src;
  });

program.parse(process.argv);

if (typeof srcProp === 'undefined') {
  console.error('What house are you looking for?');
  process.exit(0);
}


db.Report.findOne({ 'Location Address': srcProp }).then(result => {
  if (!result) {
    console.error('Address not found');
    process.exit(0);
  }

  result.getBlock((err, results) => {
    if (err) {
      console.error(err);
    }
    for (const result of results) {
      console.log(result['Location Address']);
    }
    process.exit(0);
  });

}).catch(err => {
  console.error(err);
  process.exit(0);
});
