const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  city:           { type: String, required: true, index: true },
  area:           String,
  address:        String,
  rating:         Number,
  reviews:        Number,
  women_friendly: { type: Boolean, default: false },
  home_collection:{ type: Boolean, default: false },
  accredited:     Boolean,
  phone:          String,
  timings:        String,
  tests: [{
    name:              String,
    price:             Number,
    turnaround_hours:  Number,
    home_collection:   Boolean,
  }],
  women_specific_tests: [String],
  tags:           [String],
});

module.exports = mongoose.model('DiagnosticCenter', diagnosticSchema);
