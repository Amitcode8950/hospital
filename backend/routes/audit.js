const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');

// GET /api/audit — user's own audit trail
router.get('/', auth, async (req, res) => {
  try {
    const logs = await AuditLog.find({ user_id: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit log', error: err.message });
  }
});

module.exports = router;
