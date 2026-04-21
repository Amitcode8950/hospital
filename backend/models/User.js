const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:            { type: String, required: true },
    password:         { type: String, required: true },
    role:             { type: String, enum: ['patient', 'doctor'], default: 'patient' },

    // Email verification
    email_otp:        { type: String, default: null },
    email_otp_expiry: { type: Date,   default: null },
    email_verified:   { type: Boolean, default: false },

    // Phone verification
    phone_otp:        { type: String, default: null },
    phone_otp_expiry: { type: Date,   default: null },
    phone_verified:   { type: Boolean, default: false },

    // Profile
    avatar:           { type: String, default: null },  // profile image URL
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Virtual 'id' field (maps MongoDB _id → id for JWT/frontend compatibility)
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
