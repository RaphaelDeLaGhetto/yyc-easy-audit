'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');
const csvImporter = require('../../lib/csvMongooseImport');

describe('./bin/loadSavedCoords.sh', () => {

  let cli, originalTimeout;
  beforeEach((done) => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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

  it('displays usage information if no filename provided', (done) => {
    cli.exec('./bin/loadSavedCoords.sh', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stderr).toEqual('No JSON file provided!');
      done();
    });
  });

  it('displays error if JSON file cannot be found', (done) => {
    cli.exec('./bin/loadSavedCoords.sh no-such.json', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stderr).toEqual('File does not exist. Check to make sure the file path to your JSON is correct.');
      done();
    });
  });

  it('writes the JSON records to the database', (done) => {
    csvImporter.importCsv('spec/data/2018-missing-data.csv', (err, arr) => {
      if (err) {
        return done.fail(err);
      }
      expect(arr.length).toEqual(2);
      csvImporter.writeRecords(arr, (err, results) => {
        if (err) {
          return done.fail(err);
        }

        db.Report.find({}).then((reports) => {
          expect(reports[0]['Location GeoJSON']).toBe(undefined);
          expect(reports[1]['Location GeoJSON']).toBe(undefined);

          cli.exec('./bin/loadSavedCoords.sh spec/data/gps.json', (err, res) => {
            if (err) {
              return done.fail(err);
            }
            expect(res.stdout).toMatch('Done\nCheerio!');
            db.Report.find({}).then((reports) => {
              expect(reports[0]['Location GeoJSON'].coordinates).toEqual([12.3, -12.3]);
              expect(reports[1]['Location GeoJSON'].coordinates).toEqual([23.4, -23.4]);
    
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
});
