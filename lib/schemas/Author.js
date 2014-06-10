var mongoose;

mongoose = require('mongoose');

module.exports = mongoose.model('Author', {
  name: String,
  total: Number,
  created: {
    type: Number,
    index: true
  },
});
