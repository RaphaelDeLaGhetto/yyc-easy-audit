'use strict';

const csvImporter = require('../../lib/csvMongooseImport');
const geoJsonImporter = require('../../lib/geoJsonImport');
const helper = require('../../lib/leafletHelper');
const fs = require('fs');

describe('leafletHelper', () => {

  const db = require('../../models');

  beforeEach((done) => {
    csvImporter.importCsv('spec/data/2018-missing-data.csv', (err, arr) => {
      if (err) {
        return done.fail(err);
      }
      expect(arr.length).toEqual(2);
      csvImporter.writeRecords(arr, (err, results) => {
        if (err) {
          return done.fail(err);
        }

        const json = JSON.parse(fs.readFileSync('spec/data/gps.json', 'utf-8'));
        geoJsonImporter.loadSavedGeoJson(json, (err, arr) => {
          if (err) {
            return done.fail(err);
          }
          done();
        });
      });
    });
  });

  afterEach((done) => {
    db.mongoose.connection.db.dropDatabase().then((err, result) => {
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  describe('.makeMarkers', () => {
    it('makes leaflet markers object with what\'s in the database', (done) => {
      db.Report.find({}).then((reports) => {
        expect(reports.length).toEqual(2);
        helper.makeMarkers((err, markers) => {
          if (err) {
            return done.fail(err);
          }
          expect(markers.length).toEqual(2);

          expect(markers[0].lat).toEqual(-12.3);
          expect(markers[0].lng).toEqual(12.3);
          expect(markers[0].address).toEqual('363 FAKE ST NW');
          
          expect(markers[1].lat).toEqual(-23.4);
          expect(markers[1].lng).toEqual(23.4);
          expect(markers[1].address).toEqual('351 FAKE ST NW');
 
          done();
        });
      }).catch((err) => {
        done.fail(err);
      }); 
    });
  });
});
