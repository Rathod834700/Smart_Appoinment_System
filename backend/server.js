// backend/server.js
// Express backend with endpoints that call Python scripts in the project venv.
// - Detects platform and uses the venv Python executable
// - Uses a safe temp-file pattern to pass complex JSON to Python
// - Streams stdout/stderr and returns JSON results to the client

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const { spawn } = require("child_process");

const app = express();
app.use(express.json());

// ---------- Configuration ----------
const PROJECT_ROOT = path.join(__dirname, "..");
const VENV_DIR = path.join(PROJECT_ROOT, ".venv"); // adjust if your venv is elsewhere
const PYTHON_WIN = path.join(VENV_DIR, "Scripts", "python.exe");
const PYTHON_UNIX = path.join(VENV_DIR, "bin", "python");
const PYTHON_EXEC = (os.platform() === "win32") ? PYTHON_WIN : PYTHON_UNIX;

const PYTHON_DIR = path.join(PROJECT_ROOT, "python");
const TMP_DIR = path.join(PROJECT_ROOT, "tmp");

// Ensure tmp directory exists (create on startup)
async function ensureTmpDir() {
  try {
    await fs.mkdir(TMP_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create tmp dir:", err);
  }
}
ensureTmpDir();

// ---------- Helper: run Python script with temp-file input ----------
/**
 * runPythonWithFile
 * @param {string} scriptRelativePath - path relative to project root, e.g. "python/queue_optimizer.py"
 * @param {Object} inputObj - JSON-serializable object to pass to Python via temp file
 * @param {Array<string>} extraArgs - additional CLI args to pass to Python after --input
 * @returns {Promise<Object|string>} - resolves with parsed JSON output if possible, otherwise raw stdout string
 */
async function runPythonWithFile(scriptRelativePath, inputObj = {}, extraArgs = []) {
  const timestamp = Date.now();
  const tmpInputPath = path.join(TMP_DIR, `input-${timestamp}.json`);
  const scriptPath = path.join(PROJECT_ROOT, scriptRelativePath);

  // Write input JSON to temp file
  await fs.writeFile(tmpInputPath, JSON.stringify(inputObj), "utf8");

  // Build args: [scriptPath, '--input', tmpInputPath, ...extraArgs]
  const args = [scriptPath, "--input", tmpInputPath, ...extraArgs];

  return new Promise((resolve, reject) => {
    // Spawn the venv python executable
    const child = spawn(PYTHON_EXEC, args, { windowsHide: true });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      // optional: stream to server logs
      process.stdout.write(`[PYOUT] ${data.toString()}`);
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      process.stderr.write(`[PYERR] ${data.toString()}`);
    });

    child.on("error", (err) => {
      // cleanup temp file
      fs.unlink(tmpInputPath).catch(() => {});
      reject(err);
    });

    child.on("close", async (code) => {
      // cleanup temp file
      await fs.unlink(tmpInputPath).catch(() => {});
      if (code !== 0) {
        const err = new Error(`Python exited with code ${code}. Stderr: ${stderr}`);
        return reject(err);
      }
      // Try to parse stdout as JSON, otherwise return raw string
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        resolve(stdout.trim());
      }
    });
  });
}

// ---------- Example endpoints that call Python scripts ----------

// 1) Predict endpoint: calls python/predictor.py --input <tmpfile>
// Expects request body to be a JSON object of features, e.g. { "complexity": 2, "age": 45 }
app.post("/api/predict", async (req, res) => {
  try {
    const features = req.body || {};
    // predictor.py expects --input <file> and will print JSON to stdout
    const result = await runPythonWithFile(path.join("python", "predictor.py"), features);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Predict error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2) Optimize queue endpoint: calls python/queue_optimizer.py --input <tmpfile>
// Expects request body to be an array of appointment objects
app.post("/api/optimize-queue", async (req, res) => {
  try {
    const appointments = req.body || [];
    // queue_optimizer.py expects a JSON array in the input file
    const result = await runPythonWithFile(path.join("python", "queue_optimizer.py"), appointments);
    res.json({ success: true, ordered: result });
  } catch (err) {
    console.error("Optimize queue error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3) Notify endpoint: calls python/notify.py --input <tmpfile>
// Expects body: { "type": "email"|"sms"|"console", "payload": { ... } }
app.post("/api/notify", async (req, res) => {
  try {
    const payload = req.body || {};
    // notify.py can read the input file and perform actions; ensure notify.py prints JSON result
    const result = await runPythonWithFile(path.join("python", "notify.py"), payload);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Notify error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- Static API placeholders for doctors/patients/appointments ----------
// If you already have routes in separate files, keep them. These are minimal examples.

app.get("/api/doctors", async (req, res) => {
  // Example static response; replace with DB logic
  res.json([
    { _id: "d1", name: "Dr. A", specialization: "General" },
    { _id: "d2", name: "Dr. B", specialization: "Pediatrics" }
  ]);
});

app.get("/api/patients", async (req, res) => {
  res.json([
    { _id: "p1", name: "Alice" },
    { _id: "p2", name: "Bob" }
  ]);
});

// Example appointments queue endpoint used by frontend earlier
app.get("/api/appointments/queue", async (req, res) => {
  // Replace with DB query in production
  res.json([
    { _id: "a1", patientName: "Alice", doctorName: "Dr. A", time: "10:00", status: "pending" },
    { _id: "a2", patientName: "Bob", doctorName: "Dr. B", time: "10:15", status: "pending" }
  ]);
});

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Using Python executable: ${PYTHON_EXEC}`);
});
