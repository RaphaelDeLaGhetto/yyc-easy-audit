'use strict';

const fs = require('fs');
const exporter = require('../../lib/csvMongooseExport');
const importer = require('../../lib/csvMongooseImport');
const db = require('../../models');
const mock = require('mock-fs');

describe('csvMongooseExport', () => {

  let records;
  beforeEach(done => {
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

  describe('.exportCsv', () => {

    let expected0, expected1;
    beforeEach(done => {
      fs.readFile('spec/data/expected-export-0.csv', 'utf8', (err, data) => {
        if (err) return done(err);
        expected0 = data.trim().split('\n');
        fs.readFile('spec/data/expected-export-1.csv', 'utf8', (err, data) => {
          if (err) return done(err);
          expected1 = data.trim().split('\n');
          done(); 
        });
      });
    });

    it('returns an array of CSV strings for each block in the database', done => {
      exporter.exportCsv((err, arr) => {
        expect(arr.length).toEqual(2);

        /**
         * First CSV file
         */
        let csv = arr[0].split('\n');
        expect(csv.length).toEqual(7);
        expect(csv.length).toEqual(expected1.length);
        // Header (nice to have separate because header info will likely change)
        let headers = csv[0].split(',');
        let expected = expected1[0].split(',');
        expect(headers.length).toEqual(expected.length);
        headers.forEach((header, i) => expect(header).toEqual(expected[i]));
        // Header and records
        csv.forEach((record, i) => {
          let fields = record.split(',');
          let expectedFields = expected1[i].split(',');
          expect(fields.length).toEqual(expectedFields.length);
          fields.forEach((field, i) => expect(field).toEqual(expectedFields[i]));
        });

        /**
         * Second CSV file
         */
        csv = arr[1].split('\n');
        expect(csv.length).toEqual(13);
        expect(csv.length).toEqual(expected0.length);
        // Header
        headers = csv[0].split(',');
        expected = expected0[0].split(',');
        expect(headers.length).toEqual(expected.length);
        headers.forEach((header, i) => expect(header).toEqual(expected[i]));
        // Header and records
        csv.forEach((record, i) => {
          let fields = record.split(',');
          let expectedFields = expected0[i].split(',');
          expect(fields.length).toEqual(expectedFields.length);
          fields.forEach((field, i) => expect(field).toEqual(expectedFields[i]));
        });

        done();
      });
    });
  });

  describe('.writeFiles', () => {

    let csvArr;
    beforeEach(done => {
      exporter.exportCsv((err, arr) => {
        if (err) return done.fail(err);
        expect(arr.length).toEqual(2);
        csvArr = arr;
        done(); 
      });
    });
 
    describe('errors', () => {
      it('returns an error if destination directory does not exist', done => {
        exporter.writeFiles(csvArr, 'no/such/dir', (err) => {
          if (err) {
            expect(err).toEqual('Destination directory does not exist');
            return done();
          }
          done.fail('This should have returned an error');
        });
      });
    });

    describe('output', () => {
      let expected0, expected1;
      beforeEach(done => {
        fs.readFile('spec/data/expected-export-0.csv', 'utf8', (err, data) => {
          if (err) return done(err);
          expected0 = data.trim().split('\n');
          fs.readFile('spec/data/expected-export-1.csv', 'utf8', (err, data) => {
            if (err) return done(err);
            expected1 = data.trim().split('\n');
            mock({
              'path/to/dest/dir': {},
            });
            done(); 
          });
        });
      });
  
      afterEach(() => {
        mock.restore();
      });
  
      it('writes a CSV file to the destination directory for every block in the database', done => {
        exporter.writeFiles(csvArr, 'path/to/dest/dir', (err) => {
          if (err) {
            return done.fail(err);
          }
          fs.readdir('path/to/dest/dir', (err, files) => {
            if (err) return done.fail(err);
            expect(files.length).toEqual(2);
            expect(files[0]).toEqual('consolidated-0.csv');
            expect(files[1]).toEqual('consolidated-1.csv');
            done();
          });
        });
      });
    });
  });
});

