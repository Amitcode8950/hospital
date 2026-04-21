const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Record = require('../models/Record');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { addBlock } = require('../blockchain');
const auth = require('../middleware/auth');

// Helper: flatten a populated record doc into a plain response object for the frontend
function formatRecord(r) {
  const obj = r.toObject ? r.toObject({ virtuals: true }) : { ...r };
  return {
    ...obj,
    id: r._id?.toString() || r.id,
    patient_id: r.patient_id?._id?.toString() || r.patient_id?.toString() || r.patient_id,
    patient_name:  r.patient_id?.name  || obj.patient_name  || '',
    patient_email: r.patient_id?.email || obj.patient_email || '',
  };
}

// ── GET /api/records/patients/list (doctor only) ──────────────
router.get('/patients/list', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Doctors only' });
    const patients = await User.find({ role: 'patient', email_verified: true }).select('name email phone');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
});

// ── GET /api/records/share/:token (public, no auth) ──────────
router.get('/share/:token', async (req, res) => {
  try {
    const record = await Record.findOne({ share_token: req.params.token })
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name');
    if (!record) return res.status(404).json({ message: 'Invalid or expired share link' });
    if (new Date() > record.share_token_expiry) {
      return res.status(410).json({ message: 'This share link has expired' });
    }
    const Block = require('../models/BlockchainBlock');
    const block = record.block_index
      ? await Block.findOne({ idx: record.block_index }).lean()
      : null;
    res.json({ ...formatRecord(record), blockchain_block: block });
  } catch (err) {
    res.status(500).json({ message: 'Failed to access shared record', error: err.message });
  }
});

// ── GET /api/records ──────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'patient'
      ? { patient_id: req.user.id }
      : { doctor_id: req.user.id };

    const records = await Record.find(query)
      .populate('patient_id', 'name email')
      .sort({ created_at: -1 });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'VIEW_RECORDS',
      details: `Fetched ${records.length} records`,
    });

    res.json(records.map(formatRecord));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch records', error: err.message });
  }
});

// ── GET /api/records/:id ─────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name');

    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Patients can only view their own records
    if (req.user.role === 'patient' && record.patient_id._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const Block = require('../models/BlockchainBlock');
    const block = record.block_index
      ? await Block.findOne({ idx: record.block_index }).lean()
      : null;

    await AuditLog.create({
      user_id: req.user.id,
      action: 'VIEW_RECORD',
      details: `Viewed record: ${req.params.id}`,
    });

    res.json({ ...formatRecord(record), blockchain_block: block });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch record', error: err.message });
  }
});

// ── POST /api/records (doctor adds record) ────────────────────
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add records' });
    }
    const { patient_email, record_type, title, description, diagnosis, prescription, notes, hospital } = req.body;
    if (!patient_email || !record_type || !title) {
      return res.status(400).json({ message: 'Patient email, record type, and title are required' });
    }

    const patient = await User.findOne({ email: patient_email.toLowerCase(), role: 'patient' });
    if (!patient) return res.status(404).json({ message: 'Patient not found — check the email address' });

    const doctor = await User.findById(req.user.id).select('name');

    const blockData = {
      type: 'MEDICAL_RECORD',
      patient_email: patient.email,
      doctor_email: req.user.email,
      record_type,
      title,
      hospital: hospital || '',
      timestamp: new Date().toISOString(),
    };

    const block = await addBlock(blockData);

    const record = await Record.create({
      patient_id: patient._id,
      doctor_id: req.user.id,
      doctor_name: doctor.name,
      record_type, title,
      description: description || '',
      diagnosis: diagnosis || '',
      prescription: prescription || '',
      notes: notes || '',
      hospital: hospital || '',
      block_index: block.idx,
      block_hash: block.hash,
    });

    // Add record_id to the blockchain block data (update)
    blockData.record_id = record._id.toString();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'ADD_RECORD',
      details: `Added record for ${patient.email}`,
    });

    res.status(201).json({
      message: 'Record added and anchored to the blockchain ✓',
      record_id: record.id,
      block_index: block.idx,
      block_hash: block.hash,
    });
  } catch (err) {
    console.error('Add record error:', err);
    res.status(500).json({ message: 'Failed to add record', error: err.message });
  }
});

// ── POST /api/records/:id/share ───────────────────────────────
router.post('/:id/share', auth, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.patient_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only patients can share their records' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await Record.findByIdAndUpdate(req.params.id, { share_token: token, share_token_expiry: expiry });

    res.json({
      share_url: `http://localhost:5173/share/${token}`,
      expires_at: expiry.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate share link', error: err.message });
  }
});

module.exports = router;
