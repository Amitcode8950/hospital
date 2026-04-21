const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action:     { type: String, required: true },
    details:    { type: String, default: '' },
    ip_address: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

auditSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
auditSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AuditLog', auditSchema);
