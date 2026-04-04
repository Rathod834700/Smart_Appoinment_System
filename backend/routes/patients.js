const express = require('express');
const Patient = require('../models/Patient');
const router = express.Router();

router.post('/create', async (req,res) => {
  const p = new Patient(req.body);
  await p.save();
  res.json(p);
});

router.get('/', async (req,res) => {
  const patients = await Patient.find();
  res.json(patients);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const patient = await Patient.findOne({ email, password });
    if (patient) {
      res.json({ success: true, patient });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
