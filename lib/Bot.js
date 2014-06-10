var Bot, RedditStream, q, reddit,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

q = require('q');

reddit = require('rereddit');

RedditStream = require('reddit-stream');

module.exports = Bot = (function(_super) {
  __extends(Bot, _super);

  function Bot() {
    return Bot.__super__.constructor.apply(this, arguments);
  }

  Bot.prototype.getPermalink = function(comment) {
    var deferred, request;
    deferred = q.defer();
    request = reddit.read(comment.data.link_id);
    request.end(function(error, response) {
      var _ref;
      if (error != null) {
        deferred.reject(error);
      }
      if ((response != null ? (_ref = response.data) != null ? _ref.children : void 0 : void 0) == null) {
        return deferred.resolve("http://reddit.com/r/" + comment.data.subreddit + "/comments/" + comment.data.link_id.slice(3) + "/permalink-fail/" + comment.data.id + "/?context=3");
      }
      return (function(comment) {
        return deferred.resolve("http://reddit.com" + response.data.children[0].data.permalink + comment.data.id + "/?context=3");
      })(comment);
    });
    return deferred.promise;
  };

  Bot.prototype.reply = function() {
    return this.comment.apply(this, arguments);
  };

  Bot.prototype.comment = function(parent, text) {
    var deferred, request;
    deferred = q.defer();
    if (this.user == null) {
      deferred.reject('You must be logged in to comment!');
    } else {
      request = reddit.comment(parent, text);
      request.as(this.user);
      request.end(function(error, response) {
        if (error != null) {
          return deferred.reject(error);
        } else {
          return deferred.resolve(response);
        }
      });
    }
    return deferred.promise;
  };

  return Bot;

})(RedditStream);
