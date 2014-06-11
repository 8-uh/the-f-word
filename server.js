'use strict';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var uriUtil = require('mongodb-uri');

var mongoose = require('mongoose');
var _ = require('lodash');
var db = mongoose.connection;
var path = require('path');

var port = process.env.PORT ||  1337;

var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };   
var mongooseUri = uriUtil.formatMongoose('mongodb://fwordapp:r3Dcastl3@ds035428.mongolab.com:35428/heroku_app26222746');
console.log(mongooseUri);
//mongoose.connect(mongooseUri, options);
mongoose.connect('mongodb://localhost/fwordbot');
var Fuck = require('./lib/schemas/Fuck');
var SingleFuck = require('./lib/schemas/SingleFuck');
var Author = require('./lib/schemas/Author');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log('Something is happening.');
  next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  var now = Date.now();
  Fuck.find({created: {$lt: now}}).sort({created: -1}).limit(1).exec(function(err, mostRecent) {
    if(!err) {
      res.json(mostRecent[0]);
    } else {
      console.log(err);
      res.send();
    }
  });
});
router.get('/singleFucks', function(req, res) {
  var now = Date.now();
  SingleFuck.find({created: {$lt: now}}).sort({created: -1}).limit(1).exec(function(err, mostRecent) {
    if(!err) {
      mostRecent[0].ngrams.push({term: 'Accumulated Fucks', tf: mostRecent[0].total});
      res.json(mostRecent[0]);
    } else {
      console.log(err);
      res.send();
    }
  });
});
router.get('/authors', function(req, res) {
  Author.find().exec(function(err, authors) {
    if(!err) {
      authors = _.first(authors, 1000);
      res.json(authors);
    } else {
      console.log(err);
      res.send();
    }
  });
});


app.use(bodyParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);