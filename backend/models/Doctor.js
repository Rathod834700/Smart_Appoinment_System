const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: { type: Boolean, default: true }, // true = available, false = not available
  schedule: { type: [String], default: [] }, // e.g. ["10:00", "11:00", "14:00"]
});

module.exports = mongoose.model("Doctor", DoctorSchema);
