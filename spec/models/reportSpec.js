'use strict';

describe('Report', () => {
  const fixtures = require('pow-mongoose-fixtures');
  const db = require('../../models');
  const Report = db.Report;
  const importer = require('../../lib/csvMongooseImport');

  /**
   * Model must haves
   * `undefined` values actually test for membership. I don't know why this
   * works. Try adding a pair that isn't part of the schema. See test below.
   */
  let required;

  beforeEach((done) => {
    required = {
      'Current Assessed Value': 1000000,
      'Roll Number': 9999999,
      'Location Address': '123 Fake St',
      'Assessable Land Area': 22500,
      'Total Living Area Above Grade': 1900,
      'Living Area Below Grade': 450,
      'Garage Area': 600,
      'Taxation Status': undefined,
      'Assessment Class': undefined,
      'Property Type': undefined,
      'Property Use': undefined,
      'Valuation Approach': undefined,
      'Market Adjustment': undefined,
      'Community': undefined,
      'Market Area': undefined,
      'Sub Neighbourhood Code (SNC)': undefined,
      'Sub Market Area': undefined,
      'Influences': undefined,
      'Land Use Designation': undefined,
      'Building Count': undefined,
      'Building Type/Structure': undefined,
      'Year of Construction': undefined,
      'Quality': undefined,
      'Basement Suite': undefined,
      'Walkout Basement': undefined,
      'Garage Type': undefined,
      'Fireplace Count': undefined,
      'Renovation': undefined,
      'Constructed On Original Foundation': undefined,
      'Modified For Disabled': undefined,
      'Old House On New Foundation': undefined,
      'Basementless': undefined,
      'Penthouse': undefined,
      'Location GeoJSON': undefined,
      'Ascending Neighbour': undefined,
      'Descending Neighbour': undefined,
    };

    done();
  });

  afterEach((done) => {
    db.mongoose.connection.db.dropDatabase().then((err, result) => {
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  describe('basic validation', () => {
    it('sets the createdAt and updatedAt fields', (done) => {
      let report = new Report(required);
      expect(report.createdAt).toBe(undefined);
      expect(report.updatedAt).toBe(undefined);
      report.save().then((obj) => {
        expect(report.createdAt instanceof Date).toBe(true);
        expect(report.updatedAt instanceof Date).toBe(true);
        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    it('initializes the object with the correct key/value pairs', () => {
      let report = new Report(required);
      // Believe it or not, the `undefined` values actually work to
      // verify schema membership (see `required` def above)
      expect(report).toEqual(jasmine.objectContaining(required));
    });

    it('does not allow an empty \'Current Assessed Value\' field', (done) => {
      delete required['Current Assessed Value'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Current Assessed Value'].message).toEqual('No \'Current Assessed Value\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Roll Number\' field', (done) => {
      delete required['Roll Number'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Roll Number'].message).toEqual('No \'Roll Number\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Location Address\' field', (done) => {
      delete required['Location Address'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Location Address'].message).toEqual('No \'Location Address\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Assessable Land Area\' field', (done) => {
      delete required['Assessable Land Area'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Assessable Land Area'].message).toEqual('No \'Assessable Land Area\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Total Living Area Above Grade\' field', (done) => {
      delete required['Total Living Area Above Grade'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Total Living Area Above Grade'].message).toEqual('No \'Total Living Area Above Grade\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Living Area Below Grade\' field', (done) => {
      delete required['Living Area Below Grade'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Living Area Below Grade'].message).toEqual('No \'Living Area Below Grade\' supplied');
        done();
      });
    });

    it('does not allow an empty \'Garage Area\' field', (done) => {
      delete required['Garage Area'];
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Garage Area'].message).toEqual('No \'Garage Area\' supplied');
        done();
      });
    });

    it('does not allow a mangled \'Location GeoJSON\' field', (done) => {
      required['Location GeoJSON'] = 'This is an ordinary string, not GeoJSON';
      Report.create(required).then((obj) => {
        done.fail('This should not have saved');
      }).catch((error) => {
        expect(Object.keys(error.errors).length).toEqual(1);
        expect(error.errors['Location GeoJSON'].message).toEqual('Cast to Point failed for value "This is an ordinary string, not GeoJSON" at path "Location GeoJSON"');
        done();
      });
    });

    it('saves a properly constructed GeoJSON point to the \'Location GeoJSON\' field', (done) => {
      let point = {
        type: "Point",
        coordinates: [12.123456, 13.134578]
      };
      required['Location GeoJSON'] = point;

      Report.create(required).then((obj) => {
        expect(obj['Location GeoJSON']).toEqual(point);
        done();
      }).catch((error) => {
        done.fail(error);
      });
    });
  });

  describe('#meetNeighbours', () => {

    describe('contiguous reports', () => {
      let records;
      beforeEach((done) => {
        importer.importCsv('spec/data/2018-consolidated-sample.csv', (err, arr) => {
          if (err) {
            return done.fail(err);
          }
          expect(arr.length).toEqual(18);
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
  
      it('writes the correct IDs to ascending and descending neighbours', (done) => {
        expect(records[0]['Location Address']).toEqual('363 FAKE ST NW');
        expect(records[9]['Location Address']).toEqual('359 FAKE ST NW');
        expect(records[16]['Location Address']).toEqual('367 FAKE ST NW');
        records[0].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
          expect(result._id).toEqual(records[0]._id);
          expect(result['Location Address']).toEqual('363 FAKE ST NW');
  
          expect(result['Ascending Neighbour']).toEqual(records[16]._id);
          expect(result['Descending Neighbour']).toEqual(records[9]._id);
  
          done();
        });
      });
  
      it('sets nothing when there is no ascending neighbour', (done) => {
        expect(records[8]['Location Address']).toEqual('371 FAKE ST NW');
        expect(records[16]['Location Address']).toEqual('367 FAKE ST NW');
        records[8].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
          expect(result._id).toEqual(records[8]._id);
          expect(result['Location Address']).toEqual('371 FAKE ST NW');
  
          expect(result['Ascending Neighbour']).toBeUndefined();
          expect(result['Descending Neighbour']).toEqual(records[16]._id);
  
          done();
        });
      });
  
      it('sets nothing when there is no descending neighbour', (done) => {
        expect(records[7]['Location Address']).toEqual('303 FAKE ST NW');
        expect(records[13]['Location Address']).toEqual('307 FAKE ST NW');
        records[7].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
          expect(result._id).toEqual(records[7]._id);
          expect(result['Location Address']).toEqual('303 FAKE ST NW');
  
          expect(result['Ascending Neighbour']).toEqual(records[13]._id);
          expect(result['Descending Neighbour']).toBeUndefined();
  
          done();
        });
      });
  
      it('persists the record', (done) => {
        expect(records[0]['Location Address']).toEqual('363 FAKE ST NW');
        expect(records[9]['Location Address']).toEqual('359 FAKE ST NW');
        expect(records[16]['Location Address']).toEqual('367 FAKE ST NW');
        records[0].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
  
          db.Report.findById(records[0]._id).then((result) => {
            expect(result._id).toEqual(records[0]._id);
            expect(result['Location Address']).toEqual('363 FAKE ST NW');
    
            expect(result['Ascending Neighbour']).toEqual(records[16]._id);
            expect(result['Descending Neighbour']).toEqual(records[9]._id);
    
            done();
          });
        });
      });

    });

    describe('non-contiguous properties', () => {

      let records;
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
  
      it('recognizes ascending gaps in house numbers as street divisions', (done) => {
        expect(records[8]['Location Address']).toEqual('371 FAKE ST NW');
        expect(records[16]['Location Address']).toEqual('367 FAKE ST NW');
        records[8].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
          expect(result._id).toEqual(records[8]._id);
          expect(result['Location Address']).toEqual('371 FAKE ST NW');
  
          expect(result['Ascending Neighbour']).toBeUndefined();
          expect(result['Descending Neighbour']).toEqual(records[16]._id);
  
          done();
        });
      });

      it('recognizes descending gaps in house numbers as street divisions', (done) => {
        expect(records[7]['Location Address']).toEqual('405 FAKE ST NW');
        expect(records[13]['Location Address']).toEqual('409 FAKE ST NW');
        records[7].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }
          expect(result._id).toEqual(records[7]._id);
          expect(result['Location Address']).toEqual('405 FAKE ST NW');
  
          expect(result['Ascending Neighbour']).toEqual(records[13]._id);
          expect(result['Descending Neighbour']).toBeUndefined();
  
          done();
        });
      });
    });
  });

  describe('.introduceNeighbours', () => {
    let records;
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
          records = results.sort((a, b) => {
            if (a['Location Address'] < b['Location Address']) {
              return -1;
            }
            else if (a['Location Address'] > b['Location Address']) {
              return 1;
            }
            else {
              return 0;
            }
          });
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

    it('connects all neighbours', (done) => {
      db.Report.introduceNeighbours((err, results) => {
        if (err) {
          return done.fail(err);
        }
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

    it('only introduces neighbours who haven\'t met', (done) => {
      records[2].meetNeighbours((err, result) => {
        if (err) {
          return done.fail(err);
        }
        records[records.length - 2].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }

          spyOn(db.Report.prototype, 'meetNeighbours').and.callThrough();

          db.Report.introduceNeighbours((err, results) => {
            if (err) {
              return done.fail(err);
            }
            // 18 records. 2 have been introduced
            expect(db.Report.prototype.meetNeighbours.calls.count()).toEqual(16);

            done();
          });
        });
      });
    });

    it('calls on neighbours with one undefined Neighbour', (done) => {
      // No Descending Neighbour
      records[0].meetNeighbours((err, result) => {
        if (err) {
          return done.fail(err);
        }
        // No Ascending Neighbour
        records[records.length - 1].meetNeighbours((err, result) => {
          if (err) {
            return done.fail(err);
          }

          spyOn(db.Report.prototype, 'meetNeighbours').and.callThrough();

          db.Report.introduceNeighbours((err, results) => {
            if (err) {
              return done.fail(err);
            }
            // 18 records. 2 have been introduced, but still have an undefined
            // neighbour
            expect(db.Report.prototype.meetNeighbours.calls.count()).toEqual(18);

            done();
          });
        });
      });
    });
  });

  describe('#getBlock', () => {

    let records;
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

            db.Report.find().sort({ 'Location Address': 'asc' }).then((results) => {
              expect(results.length).toEqual(18);
              records = results;
              done();
            }).catch((err) => {
              done.fail(err);
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


    it('returns all reports from one end of the block to the other', (done) => {
      expect(records[14]['Ascending Neighbour']).toBeDefined();
      expect(records[14]['Descending Neighbour']).toBeDefined();

      records[14].getBlock((err, results) => {
        expect(results.length).toEqual(6);

        expect(results[0]._id).toEqual(records[12]._id);
        expect(results[0]['Ascending Neighbour']).toEqual(records[13]._id);
        expect(results[0]['Descending Neighbour']).toBeUndefined();

        expect(results[1]._id).toEqual(records[13]._id);
        expect(results[1]['Ascending Neighbour']).toEqual(records[14]._id);
        expect(results[1]['Descending Neighbour']).toEqual(records[12]._id);

        expect(results[2]._id).toEqual(records[14]._id);
        expect(results[2]['Ascending Neighbour']).toEqual(records[15]._id);
        expect(results[2]['Descending Neighbour']).toEqual(records[13]._id);

        expect(results[3]._id).toEqual(records[15]._id);
        expect(results[3]['Ascending Neighbour']).toEqual(records[16]._id);
        expect(results[3]['Descending Neighbour']).toEqual(records[14]._id);

        expect(results[4]._id).toEqual(records[16]._id);
        expect(results[4]['Ascending Neighbour']).toEqual(records[17]._id);
        expect(results[4]['Descending Neighbour']).toEqual(records[15]._id);

        expect(results[5]._id).toEqual(records[17]._id);
        expect(results[5]['Ascending Neighbour']).toBeUndefined();
        expect(results[5]['Descending Neighbour']).toEqual(records[16]._id);

        done();
      });
    });

    it('returns all reports when starting house has no Descending Neighbours', (done) => {
      expect(records[12]['Ascending Neighbour']).toEqual(records[13]._id);
      expect(records[12]['Descending Neighbour']).toBeUndefined();

      records[12].getBlock((err, results) => {
        expect(results.length).toEqual(6);

        expect(results[0]._id).toEqual(records[12]._id);
        expect(results[0]['Ascending Neighbour']).toEqual(records[13]._id);
        expect(results[0]['Descending Neighbour']).toBeUndefined();

        expect(results[1]._id).toEqual(records[13]._id);
        expect(results[1]['Ascending Neighbour']).toEqual(records[14]._id);
        expect(results[1]['Descending Neighbour']).toEqual(records[12]._id);

        expect(results[2]._id).toEqual(records[14]._id);
        expect(results[2]['Ascending Neighbour']).toEqual(records[15]._id);
        expect(results[2]['Descending Neighbour']).toEqual(records[13]._id);

        expect(results[3]._id).toEqual(records[15]._id);
        expect(results[3]['Ascending Neighbour']).toEqual(records[16]._id);
        expect(results[3]['Descending Neighbour']).toEqual(records[14]._id);

        expect(results[4]._id).toEqual(records[16]._id);
        expect(results[4]['Ascending Neighbour']).toEqual(records[17]._id);
        expect(results[4]['Descending Neighbour']).toEqual(records[15]._id);

        expect(results[5]._id).toEqual(records[17]._id);
        expect(results[5]['Ascending Neighbour']).toBeUndefined();
        expect(results[5]['Descending Neighbour']).toEqual(records[16]._id);

        done();
      });
    });

    it('returns all reports when starting house has no Ascending Neighbours', (done) => {
      expect(records[17]['Ascending Neighbour']).toBeUndefined();
      expect(records[17]['Descending Neighbour']).toEqual(records[16]._id);

      records[17].getBlock((err, results) => {
        expect(results.length).toEqual(6);

        expect(results[0]._id).toEqual(records[12]._id);
        expect(results[0]['Ascending Neighbour']).toEqual(records[13]._id);
        expect(results[0]['Descending Neighbour']).toBeUndefined();

        expect(results[1]._id).toEqual(records[13]._id);
        expect(results[1]['Ascending Neighbour']).toEqual(records[14]._id);
        expect(results[1]['Descending Neighbour']).toEqual(records[12]._id);

        expect(results[2]._id).toEqual(records[14]._id);
        expect(results[2]['Ascending Neighbour']).toEqual(records[15]._id);
        expect(results[2]['Descending Neighbour']).toEqual(records[13]._id);

        expect(results[3]._id).toEqual(records[15]._id);
        expect(results[3]['Ascending Neighbour']).toEqual(records[16]._id);
        expect(results[3]['Descending Neighbour']).toEqual(records[14]._id);

        expect(results[4]._id).toEqual(records[16]._id);
        expect(results[4]['Ascending Neighbour']).toEqual(records[17]._id);
        expect(results[4]['Descending Neighbour']).toEqual(records[15]._id);

        expect(results[5]._id).toEqual(records[17]._id);
        expect(results[5]['Ascending Neighbour']).toBeUndefined();
        expect(results[5]['Descending Neighbour']).toEqual(records[16]._id);

        done();
      });
    });
  });
});
