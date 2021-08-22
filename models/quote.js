const mongoose = require('mongoose');


// Create schema
const Quote = mongoose.model('Quote', {
  name: {
    type: String,
    required: true
  },
  nohp: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  quote: {
    type: String,
    required: true
  },
});

module.exports = Quote;