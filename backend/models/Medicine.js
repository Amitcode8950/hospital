const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name:         { type: String, required: true, index: true },
  generic_name: { type: String, required: true },
  manufacturer: String,
  category:     String,
  composition:  String,
  dosage_form:  String,
  uses:         [String],
  side_effects: [String],
  prices: [{
    pharmacy:      String,
    logo:          String,
    price:         Number,
    mrp:           Number,
    discount:      Number,
    in_stock:      Boolean,
    delivery_days: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
