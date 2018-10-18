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
            //expect(res.stderr).toMatch('write operation failed');
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

  it('introduces neighbours', (done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    cli.exec('./bin/import.sh spec/data/2018-non-contiguous.csv', (err, res) => {
      if (err) {
        return done.fail(err);
      }
      expect(res.stdout).toMatch('Done\nCheerio!');

      db.Report.find().sort({ 'Location Address': 'asc' }).then((results) => {
        expect(results.length).toEqual(18);

        expect(results[0]['Ascending Neighbour']).toEqual(results[1]._id);
        expect(results[0]['Descending Neighbour']).toBeUndefined();

        expect(results[1]['Ascending Neighbour']).toEqual(results[2]._id);
        expect(results[1]['Descending Neighbour']).toEqual(results[0]._id);

        expect(results[2]['Ascending Neighbour']).toEqual(results[3]._id);
        expect(results[2]['Descending Neighbour']).toEqual(results[1]._id);

        expect(results[3]['Ascending Neighbour']).toEqual(results[4]._id);
        expect(results[3]['Descending Neighbour']).toEqual(results[2]._id);

        expect(results[4]['Ascending Neighbour']).toEqual(results[5]._id);
        expect(results[4]['Descending Neighbour']).toEqual(results[3]._id);

        expect(results[5]['Ascending Neighbour']).toEqual(results[6]._id);
        expect(results[5]['Descending Neighbour']).toEqual(results[4]._id);

        expect(results[6]['Ascending Neighbour']).toEqual(results[7]._id);
        expect(results[6]['Descending Neighbour']).toEqual(results[5]._id);

        expect(results[7]['Ascending Neighbour']).toEqual(results[8]._id);
        expect(results[7]['Descending Neighbour']).toEqual(results[6]._id);

        expect(results[8]['Ascending Neighbour']).toEqual(results[9]._id);
        expect(results[8]['Descending Neighbour']).toEqual(results[7]._id);

        expect(results[9]['Ascending Neighbour']).toEqual(results[10]._id);
        expect(results[9]['Descending Neighbour']).toEqual(results[8]._id);

        expect(results[10]['Ascending Neighbour']).toEqual(results[11]._id);
        expect(results[10]['Descending Neighbour']).toEqual(results[9]._id);

        expect(results[11]['Ascending Neighbour']).toBeUndefined();
        expect(results[11]['Descending Neighbour']).toEqual(results[10]._id);

        // Next block
        expect(results[12]['Ascending Neighbour']).toEqual(results[13]._id);
        expect(results[12]['Descending Neighbour']).toBeUndefined();

        expect(results[13]['Ascending Neighbour']).toEqual(results[14]._id);
        expect(results[13]['Descending Neighbour']).toEqual(results[12]._id);

        expect(results[14]['Ascending Neighbour']).toEqual(results[15]._id);
        expect(results[14]['Descending Neighbour']).toEqual(results[13]._id);

        expect(results[15]['Ascending Neighbour']).toEqual(results[16]._id);
        expect(results[15]['Descending Neighbour']).toEqual(results[14]._id);

        expect(results[16]['Ascending Neighbour']).toEqual(results[17]._id);
        expect(results[16]['Descending Neighbour']).toEqual(results[15]._id);

        expect(results[17]['Ascending Neighbour']).toBeUndefined();
        expect(results[17]['Descending Neighbour']).toEqual(results[16]._id);

        done();
      }).catch((err) => {
        done.fail(err);
      });
    });
  });
});
