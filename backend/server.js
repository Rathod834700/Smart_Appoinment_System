const express = require("express");
const connectDB = require("./config");

// Import routes
const appointments = require("./routes/appointments");
const doctors = require("./routes/doctors");
const patients = require("./routes/patients");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/appointments", appointments);
app.use("/api/doctors", doctors);
app.use("/api/patients", patients);

// Default route
app.get("/", (req, res) => {
  res.send("Smart Appointment Scheduler API is running...");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
