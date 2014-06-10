var mongoose;

mongoose = require('mongoose');

module.exports = mongoose.model('SingleFuck', {
  ngrams: Array,
  total: Number,
  top: Object,
  created: {
    type: Number,
    index: true
  },
});
