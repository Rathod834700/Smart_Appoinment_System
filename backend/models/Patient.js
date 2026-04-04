const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  age: Number,
  history: [String]
});

module.exports = mongoose.model('Patient', PatientSchema);
