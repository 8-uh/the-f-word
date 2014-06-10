var Bot, Comment, bot, db, io, mongoose, push, subreddit_blacklist, user_blacklist,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

auth = require('./lib/auth');

mongoose = require('mongoose');

db = mongoose.connection;

mongoose.connect('mongodb://localhost/fwordbot');

db.on('error', console.error.bind(console, 'connection error:'));

Comment = require('./lib/schemas/Comment');

Bot = require('./lib/Bot');

bot = new Bot('comments', 'all', 'fwordbot by /u/codevinsky');

db.once('open', function() {
  
  bot.login(auth.reddit.username, auth.reddit.password).then(function() {
    bot.start();
  }, function(error) {
    return console.error('could not log in:', error);
  });
  return bot.on('new', function(comments) {
    var comment, _i, _len, _ref, _ref1, _results;
    _results = [];
    for (_i = 0, _len = comments.length; _i < _len; _i++) {
      comment = comments[_i];
      if (/fuck/gi.test(comment.data.body)) {
        _results.push((function(comment) {
          return bot.getPermalink(comment).then(function(permalink) {
              comment = new Comment({
                id: comment.data.id,
                permalink: permalink,
                name: comment.data.name,
                body: comment.data.body,
                author: comment.data.author,
                link_url: comment.data.link_url,
                subreddit: comment.data.subreddit,
                link_title: comment.data.link_title,
                link_author: comment.data.link_author,
                created_utc: comment.data.created_utc,
                extracted: false
              });
              return comment.save(function(error, comment) {
                if (error !== null) {
                  return console.error('could not save comment:', error);
                }
                console.log('found on', new Date());
                console.log(comment.permalink);
                console.log(comment.body);
                console.log('');
              });
          });
        })(comment));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  });
});
