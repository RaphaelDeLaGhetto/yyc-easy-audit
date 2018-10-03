'use strict';
require('dotenv').config()

/**
 * Ad-hoc GeoJSON data handling methods
 */
const csv = require('csvtojson');
const request = require('superagent');
const db = require('../models');

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

      request
        .get('https://maps.googleapis.com/maps/api/geocode/json')
        .query({ address: `${result['Location Address']}, Calgary, Alberta, Canada`, key: process.env.GEOCODE_API })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          let obj = JSON.parse(res);
          result['Location GeoJSON'] = {
            type: 'Point',
            coordinates: [obj.results[0].geometry.location.lng, obj.results[0].geometry.location.lat]
          }

          result.save().then((status) => {
            done(null, res);
          }).catch((err) => {
            done(err);
          });
        });
    }).catch((err) => {
      done(err);
    });
  },

};
