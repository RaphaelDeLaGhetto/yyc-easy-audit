'use strict';

//    Headers = ['Current Assessed Value', 'Roll Number', 'Location Address', 'Taxation Status',
//               'Assessment Class', 'Property Type', 'Property Use', 'Valuation Approach',
//               'Market Adjustment', 'Community', 'Market Area', 'Sub Neighbourhood Code (SNC)',
//               'Sub Market Area', 'Influences', 'Land Use Designation', 'Assessable Land Area',
//               'Building Count', 'Building Type/Structure', 'Year of Construction',
//               'Quality', 'Total Living Area Above Grade', 'Living Area Below Grade', 'Basement Suite',
//               'Walkout Basement', 'Garage Type', 'Garage Area', 'Fireplace Count', 'Renovation',
//               'Constructed On Original Foundation', 'Modified For Disabled', 'Old House On New Foundation',
//               'Basementless', 'Penthouse']

const GeoJSON = require('mongoose-geojson-schema');

module.exports = function(mongoose) {
  const Schema = mongoose.Schema;
  const Types = Schema.Types;

  /**
   * Report
   */
  const ReportSchema = new Schema({
    'Current Assessed Value': {
      type: Types.Number,
      required: [true, 'No \'Current Assessed Value\' supplied'],
    },
    'Roll Number': {
      type: Types.Number,
      required: [true, 'No \'Roll Number\' supplied'],
    },
    'Location Address': {
      type: Types.String,
      required: [true, 'No \'Location Address\' supplied'],
    },
    'Taxation Status': Types.String,
    'Assessment Class': Types.String,
    'Property Type': Types.String,
    'Property Use': Types.String,
    'Valuation Approach': Types.String,
    'Market Adjustment': Types.Boolean,
    'Community': Types.String,
    'Market Area': Types.String,
    'Sub Neighbourhood Code (SNC)': Types.String,
    'Sub Market Area': Types.String,
    'Influences': Types.String,
    'Land Use Designation': Types.String,
    'Assessable Land Area': {
      type: Types.Number,
      required: [true, 'No \'Assessable Land Area\' supplied'],
    },
    'Building Count': Types.Number,
    'Building Type/Structure': Types.String,
    'Year of Construction': Types.Number,
    'Quality': Types.String,
    'Total Living Area Above Grade': {
      type: Types.Number,
      required: [true, 'No \'Total Living Area Above Grade\' supplied'],
    },
    'Living Area Below Grade': {
      type: Types.Number,
      required: [true, 'No \'Living Area Below Grade\' supplied'],
    },
    'Basement Suite': Types.Boolean,
    'Walkout Basement': Types.Boolean,
    'Garage Type': Types.String,
    'Garage Area': {
      type: Types.Number,
      required: [true, 'No \'Garage Area\' supplied'],
    },
    'Fireplace Count': Types.Number,
    'Renovation': Types.String,
    'Constructed On Original Foundation': Types.Boolean,
    'Modified For Disabled': Types.Boolean,
    'Old House On New Foundation': Types.Boolean,
    'Basementless': Types.Boolean,
    'Penthouse': Types.Boolean,
    'Location GeoJSON': Types.Point,
    'Ascending Neighbour': { type: Schema.Types.ObjectId, ref: 'Report' },
    'Descending Neighbour': { type: Schema.Types.ObjectId, ref: 'Report' },
  }, {
    timestamps: true
  });

  /**
   * After initial import, this method can be invoked by a document to set/
   * retrieve Ascending/Descending Neighbour values.
   */
  ReportSchema.methods.meetNeighbours = function(done) {
    const streetName = this['Location Address'].replace(/^\d+\w* /, '');
    this.model('Report').
        find({ 'Location Address': { $regex: streetName } }).
        select({'Location Address': 1}).
        sort({ 'Location Address' : 'asc'}).then((results) => {

      // No known neighbours
      if (results.length === 1) {
        done(null, this);
      }

      let index;
      for (index = 0; index < results.length; index++) {
        if (results[index]['Location Address'] === this['Location Address']) {
          break;
        }
      }

      let houseNum = parseInt(results[index]['Location Address'].match(/^\d+\w* /)[0]);
      if (index) {
        let descNum = parseInt(results[index - 1]['Location Address'].match(/^\d+\w* /)[0]);

        // If the difference between house numbers is greater than 4, it is
        // assumed they are seperated by a street (for now)
        if (houseNum - descNum <= 4) {
          this['Descending Neighbour'] = results[index - 1]._id;
        }

        if (index < results.length - 1) {
          let ascNum = parseInt(results[index + 1]['Location Address'].match(/^\d+\w* /)[0]);

          // Street check
          if (ascNum - houseNum <= 4) {
            this['Ascending Neighbour'] = results[index + 1]._id;
          }
        }
      }
      else {
        let ascNum = parseInt(results[1]['Location Address'].match(/^\d+\w* /)[0]);

        // Street check
        if (ascNum - houseNum <= 4) {
          this['Ascending Neighbour'] = results[1]._id;
        }
      }

      this.save().then((savedObj) => {
        done(null, savedObj);
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  };

  return ReportSchema;
};
