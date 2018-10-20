'use strict';
const CliTest = require('command-line-test');
const db = require('../../models');
const importer = require('../../lib/csvMongooseImport');

describe('./bin/makeNeighbours.sh', () => {

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
      cli.exec('./bin/makeNeighbours.sh', (err, res) => {
        if (err) {
          return done.fail(err);
        }
        expect(res.stderr).toMatch('No source property provided');
        expect(res.stderr).toMatch('Which way? asc|desc');
        expect(res.stderr).toMatch('No destination property provided');
        done();
      });
    });
  });

  describe('database results', () => {
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


    it('sets a property\'s ascending neighbour', done => {
      db.Report.find({ 'Location Address': { $in: ['405 FAKE ST NW', '371 FAKE ST NW'] }})
               .sort('Location Address').then(results => {
        expect(results[0]['Location Address']).toEqual('405 FAKE ST NW');
        expect(results[0]['Descending Neighbour']).not.toEqual(results[1]._id);
        expect(results[1]['Location Address']).toEqual('371 FAKE ST NW');
        expect(results[1]['Ascending Neighbour']).not.toEqual(results[0]._id);

        cli.exec('./bin/makeNeighbours.sh "405 FAKE ST NW" asc "371 FAKE ST NW"', (err, res) => {
          if (err) {
            return done.fail(err);
          }
          expect(res.stdout).toMatch(`${results[0]['Location Address']} is up from ${results[1]['Location Address']}`);
          db.Report.find({'Location Address': {$in: ['405 FAKE ST NW', '371 FAKE ST NW']}})
                   .sort('Location Address').then(results => {
            expect(results[0]['Location Address']).toEqual('405 FAKE ST NW');
            expect(results[0]['Descending Neighbour']).toEqual(results[1]._id);
            expect(results[1]['Location Address']).toEqual('371 FAKE ST NW');
            expect(results[1]['Ascending Neighbour']).toEqual(results[0]._id);

            done(); 
          }).catch(err => {
            done.fail(err);
          });
        });
      }).catch(err => {
        done.fail(err);
      });
    });

    it('sets a property\'s descending neighbour', done => {
      db.Report.find({ 'Location Address': { $in: ['405 FAKE ST NW', '371 FAKE ST NW'] }})
               .sort('Location Address').then(results => {
        expect(results[0]['Location Address']).toEqual('405 FAKE ST NW');
        expect(results[0]['Ascending Neighbour']).not.toEqual(results[1]._id);
        expect(results[1]['Location Address']).toEqual('371 FAKE ST NW');
        expect(results[1]['Descending Neighbour']).not.toEqual(results[0]._id);
 
        cli.exec('./bin/makeNeighbours.sh "405 FAKE ST NW" desc "371 FAKE ST NW"', (err, res) => {
          if (err) {
            return done.fail(err);
          }
          expect(res.stdout).toMatch(`${results[0]['Location Address']} is down from ${results[1]['Location Address']}`);
          db.Report.find({'Location Address': {$in: ['405 FAKE ST NW', '371 FAKE ST NW']}})
                   .sort('Location Address').then(results => {
            expect(results[0]['Location Address']).toEqual('405 FAKE ST NW');
            expect(results[0]['Ascending Neighbour']).toEqual(results[1]._id);
            expect(results[1]['Location Address']).toEqual('371 FAKE ST NW');
            expect(results[1]['Descending Neighbour']).toEqual(results[0]._id);

            done(); 
          }).catch(err => {
            done.fail(err);
          });
        });
      }).catch(err => {
        done.fail(err);
      });
    });
  });
});
