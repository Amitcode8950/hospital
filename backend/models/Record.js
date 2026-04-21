const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    patient_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_name:        { type: String, required: true },
    record_type:        { type: String, required: true },
    title:              { type: String, required: true },
    description:        { type: String, default: '' },
    diagnosis:          { type: String, default: '' },
    prescription:       { type: String, default: '' },
    notes:              { type: String, default: '' },
    hospital:           { type: String, default: '' },
    block_index:        { type: Number, default: null },
    block_hash:         { type: String, default: null },
    share_token:        { type: String, default: null, index: true },
    share_token_expiry: { type: Date,   default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

recordSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
recordSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Record', recordSchema);
