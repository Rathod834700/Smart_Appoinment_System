const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointments");

// Create appointment
router.post("/", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json({ message: "Appointment created", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get queue (pending appointments)
router.get("/queue", async (req, res) => {
  try {
    const queue = await Appointment.find({ status: "pending" }).sort("time");
    res.json(queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment status
router.put("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
