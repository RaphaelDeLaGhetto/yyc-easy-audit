'use strict';
require('dotenv').config()

/**
 * An ad-hoc JSON to CSV converter. The output is used with to generate
 * reports: https://github.com/TaxReformYYC/report-generator-2018 
 * 
 */
const Json2csvParser = require('json2csv').Parser;
const db = require('../models');


const fields = [
  { value: 'Current Assessed Value', default: 'unk.' },
  { value: 'Roll Number', default: 'unk.' },
  { value: 'Location Address', default: 'unk.' },
  { value: 'Taxation Status', default: 'unk.' },
  { value: 'Assessment Class', default: 'unk.' },
  { value: 'Property Type', default: 'unk.' },
  { value: 'Property Use', default: 'unk.' },
  { value: 'Valuation Approach', default: 'unk.' },
  { value: 'Market Adjustment', default: 'unk.' },
  { value: 'Community', default: 'unk.' },
  { value: 'Market Area', default: 'unk.' },
  { value: 'Sub Neighbourhood Code (SNC)', default: 'unk.' },
  { value: 'Sub Market Area', default: 'unk.' },
  { value: 'Influences', default: 'unk.' },
  { value: 'Land Use Designation', default: 'unk.' },
  { value: 'Assessable Land Area', default: 'unk.' },
  { value: 'Building Count', default: 'unk.' },
  { value: 'Building Type/Structure', default: 'unk.' },
  { value: 'Year of Construction', default: 'unk.' },
  { value: 'Quality', default: 'unk.' },
  { value: 'Total Living Area Above Grade', default: 'unk.' },
  { value: 'Living Area Below Grade', default: 'unk.' },
  { value: 'Basement Suite', default: 'unk.' },
  { value: 'Walkout Basement', default: 'unk.' },
  { value: 'Garage Type', default: 'unk.' },
  { value: 'Garage Area', default: 'unk.' },
  { value: 'Fireplace Count', default: 'unk.' },
  { value: 'Renovation', default: 'unk.' },
  { value: 'Constructed On Original Foundation', default: 'unk.' },
  { value: 'Modified For Disabled', default: 'unk.' },
  { value: 'Old House On New Foundation', default: 'unk.' },
  { value: 'Basementless', default: 'unk.' },
  { value: 'Penthouse', default: 'unk.' }
];

const json2csvParser = new Json2csvParser({ fields, quote: '' });


module.exports = {

  /**
   * Produce the CSV files required by `report-generator-2018`
   */
  exportCsv: function(done) {
    db.Report.getBlocks((err, blocks) => {
      if (err) {
        return done(err);
      }
 
      let csvArr = [];
      for (const block of blocks) {
        let parsed = json2csvParser.parse(block);
        parsed = parsed.replace(/,false/g, ',F').replace(/,true/g, ',T');
        csvArr.push(parsed);
      }

      done(null, csvArr);
    });
  },
}
