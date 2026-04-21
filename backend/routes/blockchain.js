const express = require('express');
const router = express.Router();
const { getChain, validateChain } = require('../blockchain');
const auth = require('../middleware/auth');

// GET /api/blockchain — full chain
router.get('/', auth, async (req, res) => {
  try {
    res.json(await getChain());
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blockchain', error: err.message });
  }
});

// GET /api/blockchain/validate
router.get('/validate', auth, async (req, res) => {
  try {
    res.json(await validateChain());
  } catch (err) {
    res.status(500).json({ message: 'Validation failed', error: err.message });
  }
});

module.exports = router;
