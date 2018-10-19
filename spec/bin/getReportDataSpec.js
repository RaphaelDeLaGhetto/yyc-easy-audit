'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');
const importer = require('../../lib/csvMongooseImport');
const fs = require('fs');

describe('./bin/getReportData.sh', () => {

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
    it('displays usage information if no destination directory provided', done => {
      cli.exec('./bin/getReportData.sh', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toEqual('Provide a destination directory');
        done();
      });
    });
  
    it('displays error if destination directory does not exist', done => {
      cli.exec('./bin/getReportData.sh no/such/dir', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toEqual('Destination directory does not exist');
        done();
      });
    });
  });

  // Can't mock the filesystem with `command-line-test`. File output is 
  // tested in the library module
  describe('output', () => {});
});
