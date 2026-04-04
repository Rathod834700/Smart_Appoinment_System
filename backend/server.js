const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config');

const appointments = require('./routes/appointments');
const patients = require('./routes/patients');
const doctors = require('./routes/doctors');
const ai = require('./routes/ai');
const queue = require('./routes/queue');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/appointments', appointments);
app.use('/api/patients', patients);
app.use('/api/doctors', doctors);
app.use('/api/ai', ai);
app.use('/api/queue', queue);

app.get('/api/health', (req,res) => res.json({ok:true}));

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
