var mongoose;

mongoose = require('mongoose');

module.exports = mongoose.model('Comment', {
  id: String,
  body: String,
  name: String,
  author: String,
  link_url: String,
  subreddit: String,
  permalink: String,
  link_title: String,
  link_author: String,
  fword: String,
  extracted: Boolean,
  created_utc: {
    type: Number,
    index: true
  },
});
