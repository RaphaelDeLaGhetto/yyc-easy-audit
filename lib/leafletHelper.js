'use strict';
require('dotenv').config()

/**
 * Helper methods for prepping the Leaflet map 
 */
const db = require('../models');

module.exports = {
  /**
   * Create the markers for the Leaflet map 
   *
   * @param callback
   */
  makeMarkers: function(done) {
    db.Report.find({}).then((results) => {
      let reports = [];
      for (const report of results) {
        reports.push({ 
                       lat: report['Location GeoJSON'].coordinates[1],
                       lng: report['Location GeoJSON'].coordinates[0],
                       address: report['Location Address'],
                     });
      }

      done(null, reports);
    }).catch((err) => {
      done(err);
    });
  },
};