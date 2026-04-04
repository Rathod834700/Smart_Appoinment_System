const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const Appointment = require('../models/Appointments');

// Helper: call predictor.py with patient data, returns { show: count, noshow: count, predictions: [...] }
function runPredictor(appointments) {
  return new Promise((resolve, reject) => {
    const pythonDir = path.join(__dirname, '..', '..', 'python');

    // Build input JSON for predictor
    const inputData = appointments.map(appt => ({
      id: appt._id.toString(),
      patientName: appt.patientName || 'Unknown',
      doctorName: appt.doctorName || 'Unknown',
      requestedTime: appt.requestedTime ? appt.requestedTime.toISOString() : new Date().toISOString(),
      urgency: appt.urgency || 0,
      status: appt.status || 'scheduled',
      // features for predictor (use sensible defaults since we don't have full patient features stored)
      features: {
        Gender: 'M',
        Age: 30,
        Neighbourhood: 'GOIABEIRAS',
        Scholarship: 0,
        Hipertension: 0,
        Diabetes: 0,
        Alcoholism: 0,
        Handcap: 0,
        SMS_received: 1,
        Waiting_Days: appt.requestedTime
          ? Math.max(0, Math.round((new Date(appt.requestedTime) - new Date()) / (1000 * 60 * 60 * 24)))
          : 0
      }
    }));

    // Inline Python script to run predictor on each appointment
    const pythonScript = `
import sys, json, os
os.chdir(r"${pythonDir.replace(/\\/g, '\\\\')}")
sys.path.insert(0, r"${pythonDir.replace(/\\/g, '\\\\')}")

from predictor import predict

data = json.loads(sys.stdin.read())
results = []
for item in data:
    feat = item['features']
    try:
        pred = predict(feat)
    except Exception as e:
        pred = 0  # default to show if error
    results.append({
        'id': item['id'],
        'patientName': item['patientName'],
        'doctorName': item['doctorName'],
        'requestedTime': item['requestedTime'],
        'urgency': item['urgency'],
        'status': item['status'],
        'prediction': pred,  # 1 = no-show, 0 = will show
        'label': 'No-Show Expected' if pred == 1 else 'Will Show Up'
    })
print(json.dumps(results))
`;

    const py = spawn('python', ['-c', pythonScript], {
      cwd: pythonDir
    });

    let stdout = '';
    let stderr = '';

    py.stdin.write(JSON.stringify(inputData));
    py.stdin.end();

    py.stdout.on('data', chunk => { stdout += chunk.toString(); });
    py.stderr.on('data', chunk => { stderr += chunk.toString(); });

    py.on('close', code => {
      if (code !== 0) {
        console.error('Python predictor error:', stderr);
        // Fallback: return raw appointments with no prediction
        const fallback = inputData.map(a => ({
          id: a.id,
          patientName: a.patientName,
          doctorName: a.doctorName,
          requestedTime: a.requestedTime,
          urgency: a.urgency,
          status: a.status,
          prediction: 0,
          label: 'Unknown (predictor unavailable)'
        }));
        return resolve(fallback);
      }
      try {
        const predictions = JSON.parse(stdout.trim());
        resolve(predictions);
      } catch (e) {
        console.error('JSON parse error:', e, 'stdout:', stdout);
        reject(new Error('Failed to parse predictor output'));
      }
    });
  });
}

// GET /api/queue - return optimized queue with no-show predictions
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: { $ne: 'cancelled' } }).lean();

    if (appointments.length === 0) {
      return res.json({
        total: 0,
        willShow: 0,
        noShow: 0,
        queue: [],
        message: 'No appointments found'
      });
    }

    const predictions = await runPredictor(appointments);

    // Count stats
    const willShow = predictions.filter(p => p.prediction === 0).length;
    const noShow = predictions.filter(p => p.prediction === 1).length;

    // Sort by urgency desc, then show-ups first, then by requestedTime
    const sorted = predictions.sort((a, b) => {
      // Higher urgency first
      if (b.urgency !== a.urgency) return b.urgency - a.urgency;
      // Show-ups before no-shows
      if (a.prediction !== b.prediction) return a.prediction - b.prediction;
      // Earlier time first
      return new Date(a.requestedTime) - new Date(b.requestedTime);
    });

    res.json({
      total: predictions.length,
      willShow,
      noShow,
      queue: sorted
    });
  } catch (err) {
    console.error('Queue error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
