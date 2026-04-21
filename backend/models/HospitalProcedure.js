const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
  name:              { type: String, required: true, index: true },
  category:          String,
  description:       String,
  avg_duration:      String,
  hospitals: [{
    name:           String,
    city:           String,
    tier:           { type: String, enum: ['Government', 'Private', 'Trust', 'Corporate'] },
    price:          Number,
    rating:         Number,
    accredited:     Boolean,
    wait_days:      Number,
    insurance:      Boolean,
  }],
});

module.exports = mongoose.model('HospitalProcedure', procedureSchema);
