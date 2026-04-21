const express = require('express');
const router  = express.Router();
const Vitals  = require('../models/Vitals');
const jwt     = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
}

// GET /api/vitals — last 30 entries for user
router.get('/', auth, async (req, res) => {
  try {
    const entries = await Vitals.find({ user_id: req.user.id })
      .sort({ date: -1, created_at: -1 }).limit(30).lean();
    res.json(entries);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/vitals — add a new vitals entry
router.post('/', auth, async (req, res) => {
  try {
    const { date, time, blood_pressure_sys, blood_pressure_dia, blood_sugar, heart_rate, weight, temperature, spo2, notes } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const entry = await Vitals.create({
      user_id: req.user.id,
      date, time: time || '',
      blood_pressure_sys: blood_pressure_sys ? Number(blood_pressure_sys) : null,
      blood_pressure_dia: blood_pressure_dia ? Number(blood_pressure_dia) : null,
      blood_sugar:        blood_sugar        ? Number(blood_sugar)        : null,
      heart_rate:         heart_rate         ? Number(heart_rate)         : null,
      weight:             weight             ? Number(weight)             : null,
      temperature:        temperature        ? Number(temperature)        : null,
      spo2:               spo2               ? Number(spo2)               : null,
      notes: notes || '',
    });
    res.status(201).json({ entry, message: 'Vitals recorded!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/vitals/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Vitals.deleteOne({ _id: req.params.id, user_id: req.user.id });
    res.json({ message: 'Entry deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
