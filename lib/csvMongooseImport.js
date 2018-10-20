'use strict';
require('dotenv').config()

/**
 * An ad-hoc CSV to JSON to Mongoose converter to be used with the CSV output
 * produced by: https://github.com/TaxReformYYC/report-generator-2018 
 * 
 */
const csv = require('csvtojson');
const request = require('superagent');
const db = require('../models');

/**
 * Careful here. `csvtojson` is skipping missing elements, so this works nicely.
 * The `item` here * may equal `T`, `F`, or `undefined`. The latter should not 
 * necessarily evaluate to false. There's a test that should catch this if
 * `csvtojson` is ever swapped out.
 */
const booleanParser = function(item, head, resultRow, row, colIdx) {
  return item === 'T';
};

const converterParams = {
  checkType: true,
  colParser:{
    'Sub Neighbourhood Code (SNC)': 'string',
    'Market Adjustment': booleanParser,
    'Basement Suite': booleanParser,
    'Walkout Basement': booleanParser,
    'Constructed On Original Foundation': booleanParser,
    'Modified For Disabled': booleanParser,
    'Old House On New Foundation': booleanParser,
    'Basementless': booleanParser,
    'Penthouse': booleanParser,
  },
  ignoreEmpty: true
};

module.exports = {

  /**
   * Take CSV file produced by `report-generator-2018` and convert it into a 
   * sensible database-friendly object
   */
  importCsv: function(path, done) {
    csv(converterParams).fromFile(path).then((json) => {
      done(null, json);
    }).catch((err) => {
      done(err);
    });
  },


  /**
   * Write record objects produced by `this.importCsv` to Mongo 
   *
   * @param array of objects
   * @param callback
   */
  writeRecords: function(records, done) {
    db.Report.upsertMany(records, ['Roll Number']).then((results) => {
      done(null, results);
    }).catch((err) => {
      done(err);
    });
  },
}
