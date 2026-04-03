const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  time: { type: String, required: true }, // store as string or Date depending on your needs
  status: { type: String, default: "pending" }, // pending, completed, cancelled
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
