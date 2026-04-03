const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  contact: { type: String, required: true },
  history: { type: [String], default: [] }, // e.g. ["Diabetes", "Hypertension"]
});

module.exports = mongoose.model("Patient", PatientSchema);
