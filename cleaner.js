'use strict';
var mongoose = require('mongoose');
var gramophone = require('gramophone');
var _ = require('lodash');
var db = mongoose.connection;
var fs = require('fs');
var ProgressBar = require('progress');

mongoose.connect('mongodb://localhost/fwordbot');
var Fuck = require('./lib/schemas/Fuck');
var SingleFuck = require('./lib/schemas/SingleFuck');
var Author = require('./lib/schemas/Author');
var Comment = require('./lib/schemas/Comment');

db.once('open', function() {
  Comment.find()
  .exec(function(error, comments) {
    var bar = new ProgressBar('  Cleaning Comments [:bar] :current/:total :percent :etas', {
        width: 80,
        total: comments.length
      });
    comments.forEach(function(comment) {
      
      var cleanedBody = comment.body.toLowerCase().replace(/[^\w\s]/gi, '');      
      Comment.update({_id: comment._id}, {cleanedBody: cleanedBody}, function(err, affected) {
        if(err) {
          throw err;
        }
          bar.tick();
      });
    });
  });
});

