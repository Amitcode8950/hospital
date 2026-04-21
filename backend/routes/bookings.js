const express  = require('express');
const crypto   = require('crypto');
const router   = express.Router();
const Booking  = require('../models/Booking');
const { sendBookingActionEmail, sendNewBookingAlert } = require('../utils/mailer');

// ── Auth middleware (reuse from auth.js) ─────────────────────────────────────
const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// ── Razorpay (optional — graceful if keys not set) ───────────────────────────
function getRazorpay() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET ||
      RAZORPAY_KEY_ID === 'rzp_test_your_key_id') return null;
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

// ── POST /api/bookings — create a booking ────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const {
      type, item_id, item_name, sub_item, location, city,
      date, time_slot, amount, payment_method, notes,
    } = req.body;

    if (!type || !item_name || !date || !time_slot || !amount || !payment_method) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const booking = await Booking.create({
      user_id:    req.user.id,
      user_name:  req.user.name,
      user_email: req.user.email,
      type, item_id, item_name, sub_item, location, city,
      date, time_slot,
      amount:     Number(amount),
      payment_method,
      payment_status: payment_method === 'cash' ? 'cod' : 'pending',
      status:     'confirmed',
      notes:      notes || '',
    });

    res.status(201).json({ booking, message: 'Booking confirmed!' });

    // Fire-and-forget: alert the doctor about the new booking
    if (booking.type === 'doctor' && booking.doctor_email) {
      sendNewBookingAlert(booking.doctor_email, booking.item_name, booking).catch(() => {});
    }
  } catch (err) {
    console.error('Booking create error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/bookings/incoming — doctor sees all their patient bookings ───────
router.get('/incoming', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    // Match bookings where item_name === doctor's name (set when booking is created)
    const bookings = await Booking.find({ type: 'doctor', item_name: req.user.name })
      .sort({ created_at: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/bookings — list user's bookings ─────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.user.id })
      .sort({ created_at: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/bookings/:id — booking detail ──────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/bookings/:id/action — doctor confirms or rejects ───────────────
router.put('/:id/action', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const { action, doctor_notes } = req.body; // action: 'confirmed' | 'rejected'
    if (!['confirmed', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'action must be confirmed or rejected' });
    }

    // Doctor can only act on bookings made with them
    const booking = await Booking.findOne({ _id: req.params.id, type: 'doctor', item_name: req.user.name });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.doctor_action !== 'pending') {
      return res.status(400).json({ message: `Already ${booking.doctor_action}` });
    }

    booking.doctor_action = action;
    booking.doctor_notes  = doctor_notes || '';
    if (action === 'rejected') booking.status = 'cancelled';
    await booking.save();

    // Send email to patient
    try {
      await sendBookingActionEmail(booking, action, doctor_notes || '');
      console.log(`📧 Booking ${action} email sent to ${booking.user_email}`);
    } catch (mailErr) {
      console.error('⚠️  Email send failed (non-fatal):', mailErr.message);
    }

    res.json({ message: `Booking ${action} successfully. Patient notified by email.`, booking });
  } catch (err) {
    console.error('Booking action error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/bookings/:id — cancel ───────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/bookings/payment/create-order — Razorpay order ────────────────
router.post('/payment/create-order', auth, async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const razorpay = getRazorpay();
    if (!razorpay) {
      // Graceful fallback — return mock order for dev
      const mockOrderId = 'order_mock_' + Date.now();
      booking.razorpay_order_id = mockOrderId;
      await booking.save();
      return res.json({
        order_id:   mockOrderId,
        amount:     booking.amount * 100,
        currency:   'INR',
        key_id:     process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        booking_id: booking._id,
        mock:       true,
        note:       'Razorpay keys not configured — running in mock mode',
      });
    }

    const order = await razorpay.orders.create({
      amount:   Math.round(booking.amount * 100), // paise
      currency: 'INR',
      receipt:  `booking_${booking._id}`,
    });

    booking.razorpay_order_id = order.id;
    await booking.save();

    res.json({
      order_id:   order.id,
      amount:     order.amount,
      currency:   order.currency,
      key_id:     process.env.RAZORPAY_KEY_ID,
      booking_id: booking._id,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/bookings/payment/verify — verify Razorpay payment ──────────────
router.post('/payment/verify', auth, async (req, res) => {
  try {
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Mock mode (no real keys) — just mark as paid
    if (booking.razorpay_order_id?.startsWith('order_mock_')) {
      booking.payment_status = 'paid';
      booking.razorpay_payment_id = 'pay_mock_' + Date.now();
      await booking.save();
      return res.json({ success: true, message: 'Payment verified (mock mode)' });
    }

    // Real Razorpay signature verification
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      booking.payment_status = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Payment signature mismatch' });
    }

    booking.payment_status      = 'paid';
    booking.razorpay_payment_id = razorpay_payment_id;
    await booking.save();

    res.json({ success: true, message: 'Payment verified successfully!' });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
