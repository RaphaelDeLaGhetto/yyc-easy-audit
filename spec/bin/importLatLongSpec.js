'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');
const csvImporter = require('../../lib/csvMongooseImport');

describe('./bin/importLatLong.sh', () => {

  let cli, originalTimeout;
  beforeEach((done) => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    cli = new CliTest();
    done();
  });

  afterEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    db.mongoose.connection.db.dropDatabase().then((err, result) => {
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });


  describe('no good', () => {
    it('displays usage information if no filename provided', (done) => {
      cli.exec('./bin/importLatLong.sh', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toEqual('No lat/long CSV file provided!');
        done();
      });
    });
  
    it('displays error if CSV file cannot be found', (done) => {
      cli.exec('./bin/importLatLong.sh no-such.csv', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toEqual('File does not exist. Check to make sure the file path to your csv is correct.');
        done();
      });
    });
  });

  describe('good', () => {
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

    it('writes the CSV records to the database', (done) => {
      cli.exec('./bin/importLatLong.sh spec/data/lat-long-sample.csv', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stdout).toMatch('Done\nCheerio!');
        db.Report.find().then((results) => {
          expect(results.length).toEqual(2);
          expect(results[0]['Location GeoJSON'].type).toEqual('Point');
          expect(results[0]['Location GeoJSON'].coordinates).toEqual([-114.252129134624, 51.1487225007547]);
          expect(results[1]['Location GeoJSON'].type).toEqual('Point');
          expect(results[1]['Location GeoJSON'].coordinates).toEqual([-114.251647102254, 51.1488859177422]);
          done();
        }).catch((err) => {
          done.fail(err);
        });
      });
    });
  });
});
