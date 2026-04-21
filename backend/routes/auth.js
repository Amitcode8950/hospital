const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendOTPEmail, sendWelcomeEmail, sendPhoneOTPEmail } = require('../utils/mailer');
const authMiddleware = require('../middleware/auth');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'This email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp    = generateOTP();
    const expiry = otpExpiry(10);
    const userRole = ['doctor', 'patient'].includes(role) ? role : 'patient';

    const user = await User.create({
      name, email, phone,
      password: hashedPassword,
      role: userRole,
      email_otp: otp,
      email_otp_expiry: expiry,
    });

    await sendOTPEmail(user.email, user.name, otp);

    res.status(201).json({
      message: 'Registration successful! Check your email for the OTP.',
      userId: user.id,
      email: user.email,
      step: 'verify_email',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// ── POST /api/auth/verify-email ───────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.email_verified) return res.status(400).json({ message: 'Email already verified' });
    if (user.email_otp !== otp) return res.status(400).json({ message: 'Invalid OTP — please try again' });
    if (new Date() > user.email_otp_expiry) return res.status(400).json({ message: 'OTP expired — request a new one' });

    const phoneOtp    = generateOTP();
    const phoneExpiry = otpExpiry(10);

    await User.findByIdAndUpdate(userId, {
      email_verified: true,
      email_otp: null,
      email_otp_expiry: null,
      phone_otp: phoneOtp,
      phone_otp_expiry: phoneExpiry,
    });

    // Phone OTP delivered via email (SMS removed)
    await sendPhoneOTPEmail(user.email, user.name, user.phone, phoneOtp);

    res.json({
      message: 'Email verified! An OTP has been sent to your phone.',
      phone: user.phone.replace(/(\d{2})\d+(\d{2})$/, '$1******$2'),
      step: 'verify_phone',
    });
  } catch (err) {
    console.error('Email verify error:', err);
    res.status(500).json({ message: 'Email verification failed', error: err.message });
  }
});

// ── POST /api/auth/verify-phone ───────────────────────────────
router.post('/verify-phone', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.phone_verified) return res.status(400).json({ message: 'Phone already verified' });
    if (user.phone_otp !== otp) return res.status(400).json({ message: 'Invalid OTP — please try again' });
    if (new Date() > user.phone_otp_expiry) return res.status(400).json({ message: 'OTP expired — request a new one' });

    await User.findByIdAndUpdate(userId, {
      phone_verified: true,
      phone_otp: null,
      phone_otp_expiry: null,
    });

    try { await sendWelcomeEmail(user.email, user.name); } catch (e) { /* non-fatal */ }

    res.json({ message: "Phone verified! Your account is fully activated. You can now log in.", step: 'complete' });
  } catch (err) {
    console.error('Phone verify error:', err);
    res.status(500).json({ message: 'Phone verification failed', error: err.message });
  }
});

// ── POST /api/auth/resend-email-otp ──────────────────────────
router.post('/resend-email-otp', async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    await User.findByIdAndUpdate(user._id, { email_otp: otp, email_otp_expiry: otpExpiry(10) });
    await sendOTPEmail(user.email, user.name, otp);
    res.json({ message: 'OTP resent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP', error: err.message });
  }
});

// ── POST /api/auth/resend-phone-otp ──────────────────────────
router.post('/resend-phone-otp', async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = generateOTP();
    await User.findByIdAndUpdate(user._id, { phone_otp: otp, phone_otp_expiry: otpExpiry(10) });
    await sendPhoneOTPEmail(user.email, user.name, user.phone, otp);
    res.json({ message: 'OTP resent to your phone' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP', error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.email_verified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        userId: user.id,
        step: 'verify_email',
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await AuditLog.create({ user_id: user._id, action: 'LOGIN', details: 'User logged in' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        phone_verified: user.phone_verified,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -email_otp -phone_otp');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

module.exports = router;
