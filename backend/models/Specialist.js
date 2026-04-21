const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  name:              { type: String, required: true },
  specialty:         { type: String, required: true, index: true },
  sub_specialty:     String,
  city:              { type: String, required: true, index: true },
  hospital:          String,
  experience_years:  Number,
  rating:            Number,
  reviews:           Number,
  consultation_fee:  Number,
  available_online:  Boolean,
  languages:         [String],
  next_available:    String,
  education:         [String],
  avatar_seed:       String,
  avatar:            String,   // URL to profile image
});

module.exports = mongoose.model('Specialist', specialistSchema);
