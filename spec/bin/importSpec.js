'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');

describe('./bin/import.sh', () => {

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


  it('displays usage information if no filename provided', (done) => {
    cli.exec('./bin/import.sh', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stderr).toEqual('No CSV file provided!');
      done();
    });
  });

  it('displays error if CSV file cannot be found', (done) => {
    cli.exec('./bin/import.sh no-such.csv', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stderr).toEqual('File does not exist. Check to make sure the file path to your csv is correct.');
      done();
    });
  });

  it('writes the CSV records to the database', (done) => {
    cli.exec('./bin/import.sh spec/data/2018-non-contiguous.csv', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stdout).toMatch('Done\nCheerio!');
      db.Report.find().then((results) => {
        expect(results.length).toEqual(18);
        done();
      }).catch((err) => {
        done.fail(err);
      });
    });
  });

  it('does not write duplicate CSV records to the database', (done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    cli.exec('./bin/import.sh spec/data/2018-non-contiguous.csv', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stdout).toMatch('Done\nCheerio!');
      db.Report.find().then((results) => {
        expect(results.length).toEqual(18);

        // Try again
        cli.exec('./bin/import.sh spec/data/2018-non-contiguous.csv', (err, res) => {
          if (err) {
            done.fail(err);
          }
          else {
            expect(res.stderr).toMatch('Report validation failed');
            db.Report.find().then((results) => {
              expect(results.length).toEqual(18);
              done();
            }).catch((err) => {
              done.fail(err);
            });
          }
        });
      }).catch((err) => {
        done.fail(err);
      });
    });
  });
});
