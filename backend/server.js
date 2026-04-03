const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config');

const appointments = require('./routes/appointments');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/appointments', appointments);

app.get('/api/health', (req,res) => res.json({ok:true}));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
