'use strict';

const csvImporter = require('../../lib/csvMongooseImport');
const geoJsonImporter = require('../../lib/geoJsonImport');
const helper = require('../../lib/leafletHelper');
const fs = require('fs');

describe('leafletHelper', () => {

  const db = require('../../models');

  beforeEach((done) => {
    csvImporter.importCsv('spec/data/2018-non-contiguous.csv', (err, arr) => {
      if (err) {
        return done.fail(err);
      }
      expect(arr.length).toEqual(18);
      csvImporter.writeRecords(arr, (err, results) => {
        if (err) {
          return done.fail(err);
        }

        db.Report.introduceNeighbours((err, results) => {
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
      helper.makeMarkers((err, markers) => {
        if (err) {
          return done.fail(err);
        }
        expect(markers.length).toEqual(2);

        /**
         * These tests ensure correct data types and property definitions
         */
        // Block 1
        expect(markers[0].length).toEqual(6);
        for (const marker of markers[0]) {
          expect(marker.lat).toEqual(-23.4);
          expect(marker.lng).toEqual(23.4);
          expect(marker.address).toMatch(/4\d\d FAKE ST NW/);
          expect(marker.size).toBeGreaterThan(0);
          expect(marker.assessment).toBeGreaterThan(0);
        }

        // Block 2
        expect(markers[1].length).toEqual(12);
        for (const marker of markers[1]) {
          expect(marker.lat).toBeLessThan(0)
          expect(marker.lng).toBeGreaterThan(12);
          expect(marker.address).toMatch(/3\d\d FAKE ST NW/);
          expect(marker.size).toBeGreaterThan(0);
          expect(marker.assessment).toBeGreaterThan(0);
        }
 
        done();
      });
    });
  });
});
