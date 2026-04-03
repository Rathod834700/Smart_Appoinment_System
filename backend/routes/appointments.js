const express = require('express');
const { getDB } = require('../config');
const router = express.Router();

// Create appointment
router.post('/create', async (req,res) => {
  const db = getDB();
  const result = await db.collection('appointments').insertOne(req.body);
  res.json(result);
});

// Get all appointments
router.get('/', async (req,res) => {
  const db = getDB();
  const appts = await db.collection('appointments').find().toArray();
  res.json(appts);
});

// Reschedule
router.post('/reschedule/:id', async (req,res) => {
  const db = getDB();
  const { ObjectId } = require('mongodb');
  const result = await db.collection('appointments').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { requestedTime: req.body.newTime, status: 'rescheduled' } }
  );
  res.json(result);
});

module.exports = router;
