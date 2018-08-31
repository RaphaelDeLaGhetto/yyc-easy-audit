'use strict';

describe('Report', () => {
  const fixtures = require('pow-mongoose-fixtures');
  const db = require('../../models');
  const Report = db.Report;

  afterEach((done) => {
    db.mongoose.connection.db.dropDatabase().then((err, result) => {
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  describe('basic validation', () => {
    it('sets the createdAt and updatedAt fields', (done) => {
      let report = new Report();
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
  });
});
