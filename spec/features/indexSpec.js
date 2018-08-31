'use strict';                  

const app = require('../../app'); 

const Browser = require('zombie');
const PORT = process.env.NODE_ENV === 'production' ? 3000 : 3001; 
Browser.localhost('example.com', PORT);

describe('index', () => {

  let browser;

  it('does something', (done) => {
    browser = new Browser({ waitDuration: '30s', loadCss: false });
    browser.visit('/', (err) => {
      if (err) {
        done.fail(err);
      }
      browser.assert.success();
      done();
    });
  });
});

