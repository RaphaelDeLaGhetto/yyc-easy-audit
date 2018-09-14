'use strict';

describe('Report', () => {
  const fixtures = require('pow-mongoose-fixtures');
  const db = require('../../models');
  const Report = db.Report;

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
});
