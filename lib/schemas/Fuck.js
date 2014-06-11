var mongoose;

mongoose = require('mongoose');

module.exports = mongoose.model('Fuck', {
  ngrams: Array,
  total: Number,
  top: Object,
  comments: Array,
  created: {
    type: Number,
    index: true
  },
});
