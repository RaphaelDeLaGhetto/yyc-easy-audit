'use strict';

const headerTypes = {
  'Current Assessed Value': 'number',
  'Roll Number': 'number',
  'Location Address': 'string',
  'Taxation Status': 'string',
  'Assessment Class': 'string',
  'Property Type': 'string',
  'Property Use': 'string',
  'Valuation Approach': 'string',
  'Market Adjustment': 'boolean',
  'Community': 'string',
  'Market Area': 'string',
  'Sub Neighbourhood Code (SNC)': 'string',
  'Sub Market Area': 'string',
  'Influences': 'string',
  'Land Use Designation': 'string',
  'Assessable Land Area': 'number',
  'Building Count': 'number',
  'Building Type/Structure': 'string',
  'Year of Construction': 'number',
  'Quality': 'string',
  'Total Living Area Above Grade': 'number',
  'Living Area Below Grade': 'number',
  'Basement Suite': 'boolean',
  'Walkout Basement': 'boolean',
  'Garage Type': 'string',
  'Garage Area': 'number',
  'Fireplace Count': 'number',
  'Renovation': 'string',
  'Constructed On Original Foundation': 'boolean',
  'Modified For Disabled': 'boolean',
  'Old House On New Foundation': 'boolean',
  'Basementless': 'boolean',
  'Penthouse': 'boolean'
}


const importer = require('../../lib/csvMongooseImport');

const request = require('superagent');
const config = require('../api-mocks/google-maps-config');
const superagentMock = require('superagent-mock')(request, config);

describe('csvMongooseImport', () => {

  describe('.importCsv', () => {

    it('calls back with an error if file doesn\'t exist', (done) => {
      importer.importCsv('../data/no-such-file.csv', (err, arr) => {
        expect(err).toBeDefined();
        done();
      });
    });

    it('returns an array with the correct number of records', (done) => {
      importer.importCsv('spec/data/2018-consolidated-sample.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        expect(arr.length).toEqual(18);
        done();
      });
    });

    it('converts numeric strings to numeric types', (done) => {
      importer.importCsv('spec/data/2018-consolidated-sample.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        for (let rec of arr) {
          for(let key in rec) {
            expect(typeof rec[key]).toEqual(headerTypes[key]);
          }
        }
        done();
      });
    });

  
    it('ignores empty fields because `csvtojson` does not by default', (done) => {
      importer.importCsv('spec/data/2018-missing-data.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        expect(arr.length).toEqual(2);
        expect(arr[0]['Taxation Status']).toBeUndefined();
        expect(arr[1]['Assessment Class']).toBeUndefined();
        done();
      });
    });

    it('ignores empty boolean fields so that `undefined` does not evaluate to false', (done) => {
      importer.importCsv('spec/data/2018-missing-data.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        expect(arr.length).toEqual(2);
        expect(arr[0]['Market Adjustment']).toBeUndefined();
        expect(arr[1]['Market Adjustment']).toBe(false);
        done();
      });
    });


  });

  describe('.writeRecords', () => {
    
    const db = require('../../models');

    let records;
    beforeEach((done) => {
      importer.importCsv('spec/data/2018-consolidated-sample.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        records = arr;
        expect(records.length).toEqual(18);
        done();
      });
    });

    afterEach((done) => {
      db.mongoose.connection.db.dropDatabase().then((err, result) => {
        done();
      }).catch((err) => {
        done.fail(err);
      });
    });

    it('writes all the records to the database', (done) => {
      importer.writeRecords(records, (err, results) => {
        if (err) {
          return done.fail(err);
        }
        expect(results.length).toEqual(results.length);
        db.Report.find().then((results) => {
          expect(results.length).toEqual(records.length);
          done();
        }).catch((err) => {
          done.fail(err);
        });
      });
    });
  });

  describe('.getGeoJson', () => {
    const db = require('../../models');

    let records;
    beforeEach((done) => {
      importer.importCsv('spec/data/2018-missing-data.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        expect(arr.length).toEqual(2);
        importer.writeRecords(arr, (err, results) => {
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
