const express = require('express');
const router = express.Router();
const HospitalProcedure = require('../models/HospitalProcedure');

// GET /api/procedures/search?q=MRI&city=Mumbai
router.get('/search', async (req, res) => {
  try {
    const { q = '', city } = req.query;
    const procs = await HospitalProcedure.find({
      $or: [
        { name:     { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);

    if (city) {
      return res.json(procs.map(p => ({
        ...p.toObject(),
        hospitals: p.hospitals.filter(h => h.city.toLowerCase().includes(city.toLowerCase())),
      })).filter(p => p.hospitals.length > 0));
    }
    res.json(procs);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

// GET /api/procedures/categories — distinct categories
router.get('/categories', async (req, res) => {
  try {
    res.json(await HospitalProcedure.distinct('category'));
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// GET /api/procedures — list all
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: { $regex: category, $options: 'i' } } : {};
    res.json(await HospitalProcedure.find(filter).limit(30));
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
