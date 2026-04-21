const express = require('express');
const router = express.Router();
const ERPatient = require('../models/ERPatient');
const auth = require('../middleware/auth');

const SEVERITY_LABEL = { 1: 'Critical', 2: 'Severe', 3: 'Moderate', 4: 'Minor', 5: 'Non-Urgent' };
const SEVERITY_COLOR = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#3b82f6', 5: '#10b981' };

// GET /api/er/patients
router.get('/patients', auth, async (req, res) => {
  try {
    const patients = await ERPatient.find({ status: { $in: ['Waiting', 'In Treatment'] } })
      .sort({ severity: 1, arrival_time: 1 }); // critical first, then by arrival time
    res.json(patients.map(p => ({
      ...p.toObject(),
      severity_label: SEVERITY_LABEL[p.severity],
      severity_color: SEVERITY_COLOR[p.severity],
      wait_minutes: Math.floor((Date.now() - new Date(p.arrival_time)) / 60000),
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ER queue', error: err.message });
  }
});

// GET /api/er/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const [waiting, inTreatment, discharged] = await Promise.all([
      ERPatient.countDocuments({ status: 'Waiting' }),
      ERPatient.countDocuments({ status: 'In Treatment' }),
      ERPatient.countDocuments({ status: 'Discharged', updatedAt: { $gte: new Date(Date.now() - 86400000) } }),
    ]);
    const criticals = await ERPatient.countDocuments({ severity: 1, status: { $in: ['Waiting', 'In Treatment'] } });
    res.json({ waiting, inTreatment, discharged_today: discharged, criticals });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

// POST /api/er/patients — admit new patient
router.post('/patients', auth, async (req, res) => {
  try {
    const { name, age, gender, condition, chief_complaint, severity, vitals, assigned_doctor, room } = req.body;
    if (!name || !condition || !severity) {
      return res.status(400).json({ message: 'Name, condition and severity are required' });
    }
    const patient = await ERPatient.create({
      name, age, gender, condition, chief_complaint, severity,
      vitals: vitals || {}, assigned_doctor, room,
      added_by: req.user.id,
    });
    res.status(201).json({
      ...patient.toObject(),
      severity_label: SEVERITY_LABEL[patient.severity],
      severity_color: SEVERITY_COLOR[patient.severity],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to admit patient', error: err.message });
  }
});

// PUT /api/er/patients/:id — update status / assign doctor
router.put('/patients/:id', auth, async (req, res) => {
  try {
    const { status, assigned_doctor, room } = req.body;
    const patient = await ERPatient.findByIdAndUpdate(
      req.params.id,
      { status, assigned_doctor, room },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ ...patient.toObject(), severity_label: SEVERITY_LABEL[patient.severity] });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// DELETE /api/er/patients/:id — discharge
router.delete('/patients/:id', auth, async (req, res) => {
  try {
    await ERPatient.findByIdAndUpdate(req.params.id, { status: 'Discharged' });
    res.json({ message: 'Patient discharged' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
});

module.exports = router;
