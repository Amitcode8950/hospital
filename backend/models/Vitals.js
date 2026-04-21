const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema({
  user_id:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:                { type: String, required: true },    // "YYYY-MM-DD"
  time:                { type: String, default: '' },       // "HH:MM"

  // Vitals
  blood_pressure_sys:  { type: Number, default: null },     // systolic mmHg
  blood_pressure_dia:  { type: Number, default: null },     // diastolic mmHg
  blood_sugar:         { type: Number, default: null },     // mg/dL (fasting)
  heart_rate:          { type: Number, default: null },     // bpm
  weight:              { type: Number, default: null },     // kg
  temperature:         { type: Number, default: null },     // °C
  spo2:                { type: Number, default: null },     // SpO2 %
  notes:               { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Vitals', vitalsSchema);
