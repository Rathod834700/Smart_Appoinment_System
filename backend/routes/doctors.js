const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

router.get('/', async (req,res) => {
  const docs = await Doctor.find().populate('appointments');
  const result = docs.map(d => ({
    name: d.name,
    specialization: d.specialization,
    utilization: d.appointments.length / (d.availableSlots.length || 1)
  }));
  res.json(result);
});

module.exports = router;
