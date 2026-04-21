const express = require('express');
const router = express.Router();
const Specialist = require('../models/Specialist');

// GET /api/specialists?city=Mumbai&specialty=Cardiology&online=true
router.get('/', async (req, res) => {
  try {
    const { city, specialty, online, q } = req.query;
    const filter = {};
    if (city)      filter.city      = { $regex: city, $options: 'i' };
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (online === 'true') filter.available_online = true;
    if (q) {
      filter.$or = [
        { name:      { $regex: q, $options: 'i' } },
        { specialty: { $regex: q, $options: 'i' } },
        { hospital:  { $regex: q, $options: 'i' } },
      ];
    }
    const specialists = await Specialist.find(filter).sort({ rating: -1 }).limit(30);
    res.json(specialists);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch specialists', error: err.message });
  }
});

// GET /api/specialists/cities — distinct cities
router.get('/cities', async (req, res) => {
  try {
    const cities = await Specialist.distinct('city');
    res.json(cities.sort());
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// GET /api/specialists/specialties — distinct specialties
router.get('/specialties', async (req, res) => {
  try {
    const specialties = await Specialist.distinct('specialty');
    res.json(specialties.sort());
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// GET /api/specialists/:id — specialist profile
router.get('/:id', async (req, res) => {
  try {
    const specialist = await Specialist.findById(req.params.id);
    if (!specialist) return res.status(404).json({ message: 'Specialist not found' });
    res.json(specialist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch specialist profile', error: err.message });
  }
});

module.exports = router;
