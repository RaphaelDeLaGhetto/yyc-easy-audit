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
    db.Report.getBlocks((err, blocks) => {
      let reports = [];
      for (const block of blocks) {
        let blockReports = []
        for (const report of block) {
          blockReports.push({ 
                         lat: report['Location GeoJSON'].coordinates[1],
                         lng: report['Location GeoJSON'].coordinates[0],
                         address: report['Location Address'],
                         size: report.totalSquareFootage,
                         assessment: report['Current Assessed Value']
                       });
        }
        reports.push(blockReports);
      }

      done(null, reports);
    });
  },
};
