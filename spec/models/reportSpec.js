'use strict';

describe('Report', () => {
  const fixtures = require('pow-mongoose-fixtures');
  const db = require('../../models');
  const Report = db.Report;

  /**
   * Model must haves
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

    it('does not initialize non-essential fields', (done) => {
      let report = new Report(required);
      report.save().then((obj) => {
        expect(report['Taxation Status']).toBeUndefined();
        expect(report['Assessment Class']).toBeUndefined();
        expect(report['Property Type']).toBeUndefined();
        expect(report['Property Use']).toBeUndefined();
        expect(report['Valuation Approach']).toBeUndefined();
        expect(report['Market Adjustment']).toBeUndefined();
        expect(report['Community']).toBeUndefined();
        expect(report['Market Area']).toBeUndefined();
        expect(report['Sub Neighbourhood Code (SNC)']).toBeUndefined();
        expect(report['Sub Market Area']).toBeUndefined();
        expect(report['Influences']).toBeUndefined();
        expect(report['Land Use Designation']).toBeUndefined();
        expect(report['Building Count']).toBeUndefined();
        expect(report['Building Type/Structure']).toBeUndefined();
        expect(report['Year of Construction']).toBeUndefined();
        expect(report['Quality']).toBeUndefined();
        expect(report['Basement Suite']).toBeUndefined();
        expect(report['Walkout Basement']).toBeUndefined();
        expect(report['Garage Type']).toBeUndefined();
        expect(report['Fireplace Count']).toBeUndefined();
        expect(report['Renovation']).toBeUndefined();
        expect(report['Constructed On Original Foundation']).toBeUndefined();
        expect(report['Modified For Disabled']).toBeUndefined();
        expect(report['Old House On New Foundation']).toBeUndefined();
        expect(report['Basementless']).toBeUndefined();
        expect(report['Penthouse']).toBeUndefined();
        done();
      }).catch((error) => {
        done.fail(error);
      });

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
  });
});
