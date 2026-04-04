const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  isAvailable: { type: Boolean, default: true },
  availableSlots: [Date],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
});

module.exports = mongoose.model('Doctor', DoctorSchema);
