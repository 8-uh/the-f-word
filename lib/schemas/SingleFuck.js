var mongoose;

mongoose = require('mongoose');

module.exports = mongoose.model('SingleFuck', {
  ngrams: Array,
  total: Number,
  top: Object,
  comments: Array,
  created: {
    type: Number,
    index: true
  },
});
