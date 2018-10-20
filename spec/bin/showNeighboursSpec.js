'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');
const importer = require('../../lib/csvMongooseImport');

describe('./bin/showNeighbours.sh', () => {

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
    }).catch(err => {
      done.fail(err);
    });
  });

  describe('errors', () => {
    it('displays usage information src property is ommitted', done => {
      cli.exec('./bin/showNeighbours.sh', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toMatch('What house are you looking for?');
        done();
      });
    });

    it('doesn\'t barf if the address doesn\'t exist', done => {
      cli.exec('./bin/showNeighbours.sh "123 FAKE ST"', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toMatch('Address not found');
        done();
      });
    });
  });

  describe('output', () => {
    beforeEach((done) => {
      importer.importCsv('spec/data/2018-non-contiguous.csv', (err, arr) => {
        if (err) {
          return done.fail(err);
        }
        expect(arr.length).toEqual(18);
        importer.writeRecords(arr, (err, results) => {
          if (err) {
            return done.fail(err);
          }

          db.Report.introduceNeighbours((err, results) => {
            if (err) {
              return done.fail(err);
            }

            done();
          });
        });
      });
    });

    it('shows a street\'s neighbouring relationships', done => {
      db.Report.findOne({ 'Location Address': '421 FAKE ST NW' }).then(result => {
        result.getBlock((err, block) => {
          if (err) {
            return done.fail(err);
          }
          cli.exec('./bin/showNeighbours.sh "421 FAKE ST NW"', (err, res) => {
            if (err) {
              return done.fail(err);
            }
            for (const house of block) {
              expect(res.stdout).toMatch(`${house['Location Address']}`);
            }
            done();
          });         
        });     
      }).catch(err => {
        done.fail(err);
      });
    });
  });
});
