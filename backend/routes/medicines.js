const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// GET /api/medicines/search?q=paracetamol
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { generic_name: { $regex: q, $options: 'i' } },
        { composition: { $regex: q, $options: 'i' } },
      ],
    }).limit(20);
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

// GET /api/medicines/generic?branded=Dolo+650
router.get('/generic', async (req, res) => {
  try {
    const branded = req.query.branded || '';
    const medicine = await Medicine.findOne({ name: { $regex: branded, $options: 'i' } });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    // find all with same generic_name
    const generics = await Medicine.find({
      generic_name: { $regex: medicine.generic_name, $options: 'i' },
      name: { $ne: medicine.name },
    }).limit(10);

    res.json({ branded: medicine, generics });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch generics', error: err.message });
  }
});

// GET /api/medicines/:id
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ message: 'Not found' });
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// GET /api/medicines (list all, paginated)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const filter = category ? { category: { $regex: category, $options: 'i' } } : {};
    const medicines = await Medicine.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
