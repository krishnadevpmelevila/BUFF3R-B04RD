var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
router.get('/about', function(req, res, next) {
  res.render('about',  { title: 'About', layout: 'baseLayout' });
});
router.get('/hackerboard', function(req, res, next) {
  res.render('scoreboard',  { title: 'About', layout: 'baseLayout' });
});

module.exports = router;
