const API_URL = "http://localhost:5000/api";

export async function fetchDoctors() {
  const res = await fetch(`${API_URL}/doctors`);
  return res.json();
}

export async function fetchPatients() {
  const res = await fetch(`${API_URL}/patients`);
  return res.json();
}

export async function fetchQueue() {
  const res = await fetch(`${API_URL}/appointments/queue`);
  return res.json();
}

export async function createAppointment(payload) {
  const res = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}
