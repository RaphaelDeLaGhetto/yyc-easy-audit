'use strict';

const csvImporter = require('../../lib/csvMongooseImport');
const importer = require('../../lib/geoJsonImport');

const request = require('superagent');
const config = require('../api-mocks/google-maps-config');
const superagentMock = require('superagent-mock')(request, config);

describe('geoJsonImport', () => {

  describe('.getGeoJson', () => {
    const db = require('../../models');

    let records;
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
          records = results;
          done();
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

    it('returns an error message if there is no such Roll Number in the database', (done) => {
      importer.getGeoJson(333, (err, results) => {
        if (err) {
          expect(err).toEqual('No such Roll Number');
          return done();
        }
        
        done.fail('This should have returned an error');
      });
    });

    it('adds city, province, and country to address query string', (done) => {
      db.Report.findOne({'Roll Number': 438090001}).then((report) => {

        spyOn(request, 'get').and.callFake(function(url) {
          return {
            query: function(param) {
              expect(param.address).toEqual(`${report['Location Address']}, Calgary, Alberta, Canada`);
              expect(param.key).toEqual(process.env.GEOCODE_API);
              return {
                end: function(cb) {
                  cb(null, JSON.stringify(require('../api-mocks/google-sample-geocode-response.json')));
                }
              }
            }
          }
        });

        importer.getGeoJson(438090001, (err, results) => {
          if (err) {
            return done.fail(err);
          }
          done();
        });
      }).catch((err) => {
        done.fail(err);
      });
    });

    it('returns a GeoJSON string', (done) => {
      importer.getGeoJson(438090001, (err, results) => {
        if (err) {
          return done.fail(err);
        }
        
        let objs = JSON.parse(results);
        expect(objs.status).toEqual('OK');

        done();
      });
    });

    it('adds Point to document with matching Roll Number', (done) => {
      db.Report.findOne({'Roll Number': 438090001}).then((report) => {
        expect(report['Location GeoJSON']).toBeUndefined();
        importer.getGeoJson(438090001, (err, results) => {
          if (err) {
            return done.fail(err);
          }
          db.Report.findOne({'Roll Number': 438090001}).then((report) => {
            expect(report['Location GeoJSON'].type).toEqual('Point');
            expect(report['Location GeoJSON'].coordinates).toEqual([-122.0842499, 37.4224764]);
            done();
          }).catch((err) => {
            done.fail(err);
          });
        });
      }).catch((err) => {
        done.fail(err);
      });
    });

  });

});
