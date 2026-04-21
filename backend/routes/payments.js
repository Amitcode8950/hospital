/**
 * MediChain — Payments API
 * /api/payments
 *
 * Endpoints:
 *  POST /api/payments/create-order      → Create Razorpay order
 *  POST /api/payments/verify            → Verify payment signature (client-side callback)
 *  POST /api/payments/webhook           → Razorpay server-side webhook (raw body)
 *  GET  /api/payments/receipt/:bookingId → Download payment receipt
 *  POST /api/payments/refund            → Initiate refund (if Razorpay keys set)
 *  GET  /api/payments/status/:bookingId → Get payment status
 */

const express  = require('express');
const crypto   = require('crypto');
const router   = express.Router();
const Booking  = require('../models/Booking');
const { sendBookingActionEmail } = require('../utils/mailer');

// ── Auth middleware ───────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
}

// ── Razorpay instance (null if keys not set) ──────────────────────────────────
function getRazorpay() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET ||
      RAZORPAY_KEY_ID === 'rzp_test_your_key_id') return null;
  const Razorpay = require('razorpay');
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// Creates a Razorpay order for a booking. Falls back to mock if keys not set.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/create-order', auth, async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ message: 'booking_id is required' });

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking)                       return res.status(404).json({ message: 'Booking not found' });
    if (booking.payment_status === 'paid') return res.status(400).json({ message: 'Already paid' });
    if (booking.payment_method !== 'online') return res.status(400).json({ message: 'Booking is set to cash payment' });

    const razorpay = getRazorpay();

    // ── MOCK MODE (no Razorpay keys) ──────────────────────────────────────
    if (!razorpay) {
      const mockOrderId = 'order_mock_' + Date.now();
      booking.razorpay_order_id = mockOrderId;
      await booking.save();

      console.log(`\n📦 [MOCK] Razorpay order created: ${mockOrderId}`);
      console.log(`   Booking: ${booking._id} | Amount: ₹${booking.amount} | Patient: ${booking.user_name}\n`);

      return res.json({
        order_id:    mockOrderId,
        amount:      booking.amount * 100,   // paise
        currency:    'INR',
        key_id:      'rzp_test_mock',
        booking_id:  String(booking._id),
        patient_name:  booking.user_name,
        patient_email: booking.user_email,
        description:   `${booking.item_name} — ${booking.date} ${booking.time_slot}`,
        mock:   true,
        note:   '⚠️  Razorpay keys not configured. Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to .env',
      });
    }

    // ── REAL RAZORPAY ─────────────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount:   Math.round(booking.amount * 100),  // must be integer paise
      currency: 'INR',
      receipt:  `mc_${String(booking._id).slice(-8)}`,
      notes: {
        booking_id:   String(booking._id),
        patient_name: booking.user_name,
        doctor:       booking.item_name,
        date:         booking.date,
      },
    });

    booking.razorpay_order_id = order.id;
    await booking.save();

    console.log(`\n✅ Razorpay order created: ${order.id} | ₹${booking.amount} | ${booking.user_name}\n`);

    res.json({
      order_id:      order.id,
      amount:        order.amount,
      currency:      order.currency,
      key_id:        process.env.RAZORPAY_KEY_ID,
      booking_id:    String(booking._id),
      patient_name:  booking.user_name,
      patient_email: booking.user_email,
      description:   `${booking.item_name} — ${booking.date} ${booking.time_slot}`,
    });
  } catch (err) {
    console.error('❌ Create-order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify
// Client calls this after Razorpay checkout success with the 3 IDs.
// Verifies HMAC signature and marks booking as paid.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/verify', auth, async (req, res) => {
  try {
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!booking_id || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.payment_status === 'paid') return res.json({ success: true, message: 'Already paid', booking });

    // ── MOCK MODE ─────────────────────────────────────────────────────────
    if (booking.razorpay_order_id?.startsWith('order_mock_')) {
      booking.payment_status      = 'paid';
      booking.razorpay_payment_id = 'pay_mock_' + Date.now();
      await booking.save();

      console.log(`✅ [MOCK] Payment verified for booking ${booking._id}`);
      return res.json({ success: true, message: 'Payment recorded (mock mode)', booking });
    }

    // ── REAL SIGNATURE VERIFICATION ───────────────────────────────────────
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      booking.payment_status = 'failed';
      await booking.save();
      console.error(`❌ Payment signature mismatch for booking ${booking._id}`);
      return res.status(400).json({ success: false, message: 'Signature verification failed. Do not retry.' });
    }

    booking.payment_status      = 'paid';
    booking.razorpay_payment_id = razorpay_payment_id;
    await booking.save();

    console.log(`✅ Payment verified: ${razorpay_payment_id} → Booking ${booking._id} | ₹${booking.amount}`);

    // Send payment confirmation email to patient (non-blocking)
    sendBookingActionEmail(booking, 'confirmed', '💳 Payment received. See you at the appointment!')
      .catch(e => console.error('⚠️  Email failed:', e.message));

    res.json({
      success:    true,
      message:    'Payment verified successfully! ₹' + booking.amount + ' received.',
      booking,
      payment_id: razorpay_payment_id,
    });
  } catch (err) {
    console.error('❌ Verify error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// Razorpay calls this server-side after payment events.
// Set in Razorpay Dashboard → Webhooks → URL → https://yoursite.com/api/payments/webhook
// Uses raw body — must be registered BEFORE express.json()
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    if (webhookSecret) {
      const receivedSig = req.headers['x-razorpay-signature'];
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');

      if (receivedSig !== expectedSig) {
        console.error('❌ Webhook signature mismatch');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event = JSON.parse(req.body.toString());
    const entity = event.payload?.payment?.entity || event.payload?.order?.entity;

    console.log(`\n🔔 Razorpay Webhook: ${event.event}`);

    switch (event.event) {
      case 'payment.captured': {
        // Payment successful — find booking by order_id and mark paid
        const orderId = entity.order_id;
        const booking = await Booking.findOne({ razorpay_order_id: orderId });
        if (booking && booking.payment_status !== 'paid') {
          booking.payment_status      = 'paid';
          booking.razorpay_payment_id = entity.id;
          await booking.save();
          console.log(`✅ Webhook: Booking ${booking._id} marked PAID via ${entity.id}`);
        }
        break;
      }

      case 'payment.failed': {
        const orderId = entity.order_id;
        const booking = await Booking.findOne({ razorpay_order_id: orderId });
        if (booking && booking.payment_status !== 'paid') {
          booking.payment_status = 'failed';
          await booking.save();
          console.log(`❌ Webhook: Booking ${booking._id} payment FAILED`);
        }
        break;
      }

      case 'refund.processed': {
        console.log(`💰 Webhook: Refund processed — ${entity.id}`);
        break;
      }

      default:
        console.log(`   (unhandled event: ${event.event})`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/status/:bookingId
// Returns the current payment status for a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      user_id: req.user.id,
    }).select('_id amount payment_status payment_method razorpay_order_id razorpay_payment_id item_name date time_slot');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const statusMap = {
      paid:    { label: 'Paid',            color: 'green',  icon: '✅' },
      cod:     { label: 'Pay at Visit',    color: 'yellow', icon: '💵' },
      pending: { label: 'Payment Pending', color: 'yellow', icon: '⏳' },
      failed:  { label: 'Payment Failed',  color: 'red',    icon: '❌' },
    };

    res.json({
      booking_id:     booking._id,
      amount:         booking.amount,
      payment_method: booking.payment_method,
      payment_status: booking.payment_status,
      status_info:    statusMap[booking.payment_status] || statusMap.pending,
      razorpay_order_id:   booking.razorpay_order_id,
      razorpay_payment_id: booking.razorpay_payment_id,
      item_name:  booking.item_name,
      date:       booking.date,
      time_slot:  booking.time_slot,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/refund
// Initiate a Razorpay refund. Only works if booking is paid & keys are set.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/refund', auth, async (req, res) => {
  try {
    const { booking_id, reason } = req.body;
    if (!booking_id) return res.status(400).json({ message: 'booking_id required' });

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Cannot refund — booking is not paid' });
    }
    if (!booking.razorpay_payment_id || booking.razorpay_payment_id.startsWith('pay_mock_')) {
      // Mock refund
      booking.payment_status = 'pending'; // reset
      booking.status         = 'cancelled';
      await booking.save();
      return res.json({ success: true, message: 'Refund processed (mock mode)', refund_id: 'rfnd_mock_' + Date.now() });
    }

    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ message: 'Razorpay not configured. Add RAZORPAY_KEY_ID to .env' });

    const refund = await razorpay.payments.refund(booking.razorpay_payment_id, {
      amount: Math.round(booking.amount * 100),  // full refund
      notes:  { reason: reason || 'Patient requested cancellation', booking_id: String(booking._id) },
    });

    booking.status         = 'cancelled';
    booking.payment_status = 'pending'; // Razorpay sets final state via webhook
    await booking.save();

    console.log(`💰 Refund initiated: ${refund.id} for ₹${booking.amount} → Booking ${booking._id}`);

    res.json({
      success:   true,
      message:   `Refund of ₹${booking.amount} initiated. Credited within 5-7 business days.`,
      refund_id: refund.id,
      amount:    booking.amount,
    });
  } catch (err) {
    console.error('❌ Refund error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/receipt/:bookingId
// Returns a JSON payment receipt (can be rendered as HTML receipt on frontend)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/receipt/:bookingId', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, user_id: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.payment_status !== 'paid' && booking.payment_status !== 'cod') {
      return res.status(400).json({ message: 'No receipt available — payment not completed' });
    }

    res.json({
      receipt_no:     `MC-${String(booking._id).slice(-8).toUpperCase()}`,
      issued_at:      new Date().toISOString(),
      patient_name:   booking.user_name,
      patient_email:  booking.user_email,
      item:           booking.item_name,
      sub_item:       booking.sub_item,
      location:       booking.location,
      city:           booking.city,
      date:           booking.date,
      time_slot:      booking.time_slot,
      amount:         booking.amount,
      currency:       'INR',
      payment_method: booking.payment_method === 'online' ? 'Online (Razorpay)' : 'Cash at Visit',
      payment_status: booking.payment_status,
      transaction_id: booking.razorpay_payment_id || 'N/A (Cash)',
      order_id:       booking.razorpay_order_id   || 'N/A (Cash)',
      booking_status: booking.status,
      note:           'This is an official MediChain payment receipt.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
