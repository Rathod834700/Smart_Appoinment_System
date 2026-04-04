const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

// GET all doctors with availability
router.get('/', async (req, res) => {
  try {
    const docs = await Doctor.find().populate('appointments');
    const result = docs.map(d => ({
      name: d.name,
      specialization: d.specialization,
      isAvailable: d.isAvailable,
      slotsCount: d.availableSlots.length,
      appointmentsCount: d.appointments.length
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Seed sample doctors (run once)
router.post('/seed', async (req, res) => {
  try {
    await Doctor.deleteMany({});
    const sampleDoctors = [
      { name: 'Dr. Arjun Mehta', specialization: 'Cardiologist', isAvailable: true, availableSlots: [] },
      { name: 'Dr. Priya Sharma', specialization: 'Neurologist', isAvailable: true, availableSlots: [] },
      { name: 'Dr. Rahul Verma', specialization: 'Orthopedic Surgeon', isAvailable: false, availableSlots: [] },
      { name: 'Dr. Sneha Patel', specialization: 'Dermatologist', isAvailable: true, availableSlots: [] },
      { name: 'Dr. Vikram Singh', specialization: 'General Physician', isAvailable: true, availableSlots: [] },
      { name: 'Dr. Anjali Rao', specialization: 'Pediatrician', isAvailable: false, availableSlots: [] },
    ];
    const inserted = await Doctor.insertMany(sampleDoctors);
    res.json({ message: `${inserted.length} doctors seeded successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to seed doctors' });
  }
});

module.exports = router;
