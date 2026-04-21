const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema(
  {
    idx:       { type: Number, required: true, unique: true, index: true },
    timestamp: { type: String, required: true },
    data:      { type: mongoose.Schema.Types.Mixed, required: true },
    prev_hash: { type: String, required: true },
    hash:      { type: String, required: true },
    nonce:     { type: Number, default: 0 },
  },
  { _id: true }
);

module.exports = mongoose.model('BlockchainBlock', blockSchema);
