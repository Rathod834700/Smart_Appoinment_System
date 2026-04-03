// Create a new appointment
export async function createAppointment(data) {
  const res = await fetch('/api/appointments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Get list of doctors
export async function getDoctors() {
  const res = await fetch('/api/doctors');
  return res.json();
}

// Alias for getDoctors (to match components using fetchDoctors)
export async function fetchDoctors() {
  return getDoctors();
}

// Fetch the current appointment queue
export async function fetchQueue() {
  const res = await fetch('/api/appointments');
  return res.json();
}
