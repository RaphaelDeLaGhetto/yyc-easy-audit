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
const uniqueValidator = require('mongoose-unique-validator');
const upsertMany = require('@meanie/mongoose-upsert-many');

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
      unique: true,
      required: [true, 'No \'Roll Number\' supplied'],
    },
    'Location Address': {
      type: Types.String,
      unique: true,
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
        select({'Location Address': 1}).then((results) => {

      // Alphabetical sorting can't be trusted with numeric values
      results = results.sort((a, b) => {
        a = parseInt(a['Location Address'].match(/^\d+\w* /)[0]);
        b = parseInt(b['Location Address'].match(/^\d+\w* /)[0]);
        return a - b;
      });

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

      const houseNum = parseInt(results[index]['Location Address'].match(/^\d+\w* /)[0]);
      const isOddNumbered = houseNum % 2;

      /**
       * Respect even-odd sides of street
       */
      let descIndex, descNum;
      for (descIndex = index - 1; descIndex >= 0; descIndex--){
        descNum = parseInt(results[descIndex]['Location Address'].match(/^\d+\w* /)[0]);
        if ((isOddNumbered && descNum % 2) || (!isOddNumbered && !(descNum % 2))) {
          break;
        }
      }

      let ascIndex, ascNum;
      for (ascIndex = index + 1; ascIndex < results.length; ascIndex++){
        ascNum = parseInt(results[ascIndex]['Location Address'].match(/^\d+\w* /)[0]);
        if ((isOddNumbered && ascNum % 2) || (!isOddNumbered && !(ascNum % 2))) {
          break;
        }
      }

      if (descIndex >= 0) {
        // If the difference between house numbers is greater than 4, it is
        // assumed they are seperated by a street (for now)
        if (houseNum - descNum <= 4) {
          this['Descending Neighbour'] = results[descIndex]._id;
        }
      }

      if (ascIndex < results.length) {
        // Street check
        if (ascNum - houseNum <= 4) {
          this['Ascending Neighbour'] = results[ascIndex]._id;
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

  /**
   * Recursive functions that do all the real work of getting all the
   * houses on a block
   */
  function _getAscending(house, results, done) {
    if (typeof results === 'function') {
      done = results;
      results = [house];
    }
    
    // Ascending
    if (house['Ascending Neighbour']) {
      house.model('Report').findById(house['Ascending Neighbour']).then((report) => {
        results.push(report);
        _getAscending(report, results, done);
      }).catch((err) => {
        return done(err);
      });
    } else {
      done(null, results);
    }
  };
 
  function _getDescending(house, results, done) {
    if (typeof results === 'function') {
      done = results;
      results = [house];
    }
 
    // Descending
    if (house['Descending Neighbour']) {
      house.model('Report').findById(house['Descending Neighbour']).then((report) => {
        results.unshift(report);
        _getDescending(report, results, done);
      }).catch((err) => {
        return done(err);
      });
    } else {
      done(null, results);
    }
  };

  /**
   * Get all houses on a city block (neighbouring house numbers are assumed to 
   * to have a difference of 4 or less)
   */
  ReportSchema.methods.getBlock = function(done) {
    _getAscending(this, (err, results) => {
      if (err) {
        return done(err);
      }
      _getDescending(this, results, (err, results) => {
        if (err) {
          console.log(err);
          return done(err);
        }
        done(null, results);
      });
    });
  };
 
  /**
   * Recursive function that does all the actual neighour linking work
   */
  function _introduce(records, done) {
    if (!records.length) {
      return done();
    }

    let record = records.pop();
    record.meetNeighbours((err) => {
      if (err) {
        return done(err);
      } 
      _introduce(records, done);
    });
  };

  /**
   * Link all neighbours that have not been previously introduced
   */
  ReportSchema.statics.introduceNeighbours = function(done) {
    this.find().or([{'Ascending Neighbour': undefined}, {'Descending Neighbour': undefined}]).then((reports) => {
      _introduce(reports, (err) => {
        done();
      });
    }).catch((err) => {
      done(err);
    });
  };

  /**
   * Recursive function that does all the actual block getting 
   */
  function _getBlocks(records, blocks, done) {

    if (typeof blocks === 'function') {
      done = blocks;
      blocks = [];
    }

    if (!records.length) {
      return done(null, blocks);
    }
    let record = records.pop();

    _getDescending(record, (err, results) => {
      if (err) {
        console.log(err);
        return done(err);
      }
      blocks.push(results);
      _getBlocks(records, blocks, done);
    });
  };

  /**
   * Gets all neighbours organized in blocks
   */
  ReportSchema.statics.getBlocks = function(done) {
    this.find({'Ascending Neighbour': undefined}).then((reports) => {
      _getBlocks(reports, done);
    }).catch((err) => {
      done(err);
    });
  };

  /**
   * Virtual method to sum total lot size and developed living space
   */
  ReportSchema.virtual('totalSquareFootage').get(function() {
    return this['Assessable Land Area'] + 
           this['Total Living Area Above Grade'] +
           this['Living Area Below Grade'] +
           this['Garage Area'];
  });

  /**
   * Manually set neighbours
   * 
   * @param String - make this neighbour 
   * @param String - the [asc|desc] neighbour
   * @param String - of this neighbour
   * @param Function 
   */
  ReportSchema.statics.makeNeighbours = function(src, dir, dest, done) {

    // Break neighbour commitment if dest is null
    if (!dest) {
      this.findOne({ 'Location Address': src }).then(result => {
        let msg = 'No bridges burned';
        
        if (dir === 'asc') {
          result['Ascending Neighbour'] = null;
          msg = `${result['Location Address']} is at the top of the block`
        }
        else if (dir === 'desc') {
          result['Descending Neighbour'] = null;
          msg = `${result['Location Address']} is at the bottom of the block`
        }
        result.save().then(result => {
          done(null, msg);
        }).catch(err => {
          done(err);
        });
      }).catch(err => {
        done(err);
      });     
    }
    else {
      this.find({ 'Location Address': { $in: [src, dest] }}).then(results => {
        let srcIndex = results.findIndex(result => result['Location Address'] === src);
        let destIndex = results.findIndex(result => result['Location Address'] === dest);
  
        let msg = 'These neighbours did not meet';
  
        if (dir === 'asc') {
          results[srcIndex]['Descending Neighbour'] = results[destIndex]._id;
          results[destIndex]['Ascending Neighbour'] = results[srcIndex]._id;
          msg = `${results[srcIndex]['Location Address']} is up from ${results[destIndex]['Location Address']}`;
        }
        else if (dir === 'desc') {
          results[srcIndex]['Ascending Neighbour'] = results[destIndex]._id;
          results[destIndex]['Descending Neighbour'] = results[srcIndex]._id;
          msg = `${results[srcIndex]['Location Address']} is down from ${results[destIndex]['Location Address']}`;
        }
  
        this.upsertMany(results, ['Roll Number']).then(results => {
          done(null, msg);
        }).catch(err => {
          done(err);
        });
      }).catch(err => {
        done(err);
      });
    }
  };

  ReportSchema.plugin(uniqueValidator);
  ReportSchema.plugin(upsertMany);

  return ReportSchema;
};
