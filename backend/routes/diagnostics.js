const express = require('express');
const router = express.Router();
const DiagnosticCenter = require('../models/DiagnosticCenter');

// GET /api/diagnostics?city=Mumbai&women=true&home=true&test=blood
router.get('/', async (req, res) => {
  try {
    const { city, women, home, q } = req.query;
    const filter = {};
    if (city)  filter.city = { $regex: city, $options: 'i' };
    if (women === 'true') filter.women_friendly = true;
    if (home  === 'true') filter.home_collection = true;
    if (q) {
      filter.$or = [
        { name:             { $regex: q, $options: 'i' } },
        { 'tests.name':     { $regex: q, $options: 'i' } },
        { women_specific_tests: { $elemMatch: { $regex: q, $options: 'i' } } },
        { tags:             { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }
    const centers = await DiagnosticCenter.find(filter).sort({ rating: -1 }).limit(30);
    res.json(centers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch centers', error: err.message });
  }
});

// GET /api/diagnostics/cities
router.get('/cities', async (req, res) => {
  try {
    res.json(await DiagnosticCenter.distinct('city'));
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
