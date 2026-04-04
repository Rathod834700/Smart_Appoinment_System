const express = require('express');
const Appointment = require('../models/Appointments');
const router = express.Router();

// Create appointment
router.post('/create', async (req,res) => {
  try {
    const appt = new Appointment(req.body);
    const result = await appt.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments
router.get('/', async (req,res) => {
  try {
    const appts = await Appointment.find();
    res.json(appts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reschedule
router.post('/reschedule/:id', async (req,res) => {
  try {
    const result = await Appointment.findByIdAndUpdate(
      req.params.id,
      { requestedTime: req.body.newTime, status: 'rescheduled' },
      { new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
