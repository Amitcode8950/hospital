const mongoose = require('mongoose');

const erPatientSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  age:             Number,
  gender:          { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  condition:       { type: String, required: true },
  chief_complaint: String,
  severity:        { type: Number, min: 1, max: 5, required: true }, // 1=Critical … 5=Minor
  vitals: {
    bp:          String,
    pulse:       Number,
    spo2:        Number,
    temperature: Number,
  },
  status:          { type: String, enum: ['Waiting','In Treatment','Stable','Discharged','Transferred'], default: 'Waiting' },
  arrival_time:    { type: Date, default: Date.now },
  assigned_doctor: { type: String, default: '' },
  room:            { type: String, default: '' },
  added_by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('ERPatient', erPatientSchema);
