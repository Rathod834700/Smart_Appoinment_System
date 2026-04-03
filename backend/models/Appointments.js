const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientName: String,
  doctorName: String,
  requestedTime: Date,
  status: { type: String, enum: ['scheduled','rescheduled','cancelled','noshow'], default: 'scheduled' },
  urgency: Number,
  predictedDuration: Number
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
