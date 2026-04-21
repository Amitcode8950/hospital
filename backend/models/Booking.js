const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Who booked
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name:  { type: String, required: true },
  user_email: { type: String, required: true },

  // What was booked
  type:       { type: String, enum: ['doctor', 'lab', 'procedure'], required: true },
  item_id:    { type: String },                 // specialist / lab / procedure _id
  item_name:  { type: String, required: true }, // display name
  sub_item:   { type: String },                 // test name / sub-procedure
  location:   { type: String },                 // hospital / lab name
  city:       { type: String },

  // Schedule
  date:       { type: String, required: true }, // "YYYY-MM-DD"
  time_slot:  { type: String, required: true }, // "9:00 AM – 10:00 AM"

  // Money
  amount:     { type: Number, required: true },

  // Payment
  payment_method: { type: String, enum: ['online', 'cash'], required: true },
  payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'cod'], default: 'pending' },

  // Razorpay (only for online)
  razorpay_order_id:   { type: String, default: null },
  razorpay_payment_id: { type: String, default: null },

  // Booking status
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },

  // Notes
  notes: { type: String, default: '' },

  // Doctor action (for doctor-type bookings)
  doctor_action: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  doctor_notes:  { type: String, default: '' },  // doctor's message to patient
  doctor_email:  { type: String, default: '' },  // doctor's email for notifications

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Booking', bookingSchema);
