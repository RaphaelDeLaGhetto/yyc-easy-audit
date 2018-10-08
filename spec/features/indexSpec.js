'use strict';                  

const app = require('../../app'); 

const Browser = require('zombie');
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001; 
Browser.localhost('example.com', PORT);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('index', () => {

  let browser;

  beforeEach((done) => {
    browser = new Browser({ waitDuration: '30s', loadCss: false });
    browser.visit('/', (err) => {
      if (err) {
        return done.fail(err);
      }
      browser.assert.success();
      done();
    });
  });

  it('displays a map', (done) => {
    browser.assert.element('#audit-map');
    done();
  });
});


