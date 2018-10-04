'use strict';
require('dotenv').config()

/**
 * Ad-hoc GeoJSON data handling methods
 */
const csv = require('csvtojson');
const request = require('superagent');
const db = require('../models');

/**
 * Recursively send requests for GeoJSON data
 *
 * @param Array - Mongo documents
 * @param Array - Coordinate objects
 * @param callback
 */
function _sendRequests(docs, coordObj, done) {
  if (typeof coordObj === 'function') {
    done = coordObj;
    coordObj = {};
  }

  if (!docs.length) {
    return done(null, coordObj);
  }

  let doc = docs.shift();

  request
    .get('https://maps.googleapis.com/maps/api/geocode/json')
    .query({ address: `${doc['Location Address']}, Calgary, Alberta, Canada`, key: process.env.GEOCODE_API })
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      let obj = res.body;
      const coords = [obj.results[0].geometry.location.lng, obj.results[0].geometry.location.lat];
      doc['Location GeoJSON'] = {
        type: 'Point',
        coordinates: coords
      }

      // For CLI output
      coordObj[doc['Roll Number']] = coords;

      doc.save().then((status) => {
        _sendRequests(docs, coordObj, done);
      }).catch((err) => {
        done(err);
      });
    });
};

module.exports = {
  /**
   * Currently rigged to query Google Maps geocode
   *
   * @param Integer roll number 
   * @param callback
   */
  getGeoJson: function(roll, done) {
    db.Report.findOne({ 'Roll Number': roll }).then((result) => {
      if (!result) {
        return done('No such Roll Number');
      }
      _sendRequests([result], done);
    }).catch((err) => {
      done(err);
    });
  },


  /**
   * Queries DB for documents missing GeoJSON coordinates
   *
   * @param Integer roll number 
   * @param callback
   */
  getMissingGeoJson: function(done) {
    db.Report.find({ 'Location GeoJSON': { $exists: false, $eq: null } }).then((results) => {
      _sendRequests(results, done);
    }).catch((err) => {
      done(err);
    });
  },

  /**
   * Takes ad hoc GeoJSON object and loads it into the database alongside the
   * properties with matching Roll Numbers
   *
   * @param Object
   * @param callback
   */
  loadSavedGeoJson: function(obj, done) {
    db.Report.find({ 'Roll Number': { $in: Object.keys(obj) } }).then((reports) => {

      if (!reports.length) {
        return done();
      }

      for (let report of reports) {
        report['Location GeoJSON'] = {
          type: 'Point',
          coordinates: obj[report['Roll Number']]
        }
      }

      /**
       * Recursive save-all function
       */
      let total = reports.length,
          result = [];

      function saveAll(){
        let report = reports.pop();

        report.save((err, saved) => {
          if (err) return done(err);

          result.push(saved[0]);

          if (--total) saveAll();
          else done(null, result);
        });
      };

      saveAll();
    }).catch((err) => {
      done(err);
    });
  }
};
