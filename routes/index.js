var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // This isn't actually doing anything because of `public/index.html`
  res.render('index');
});

module.exports = router;
