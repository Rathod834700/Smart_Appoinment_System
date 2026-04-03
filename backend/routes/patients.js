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

module.exports = router;
