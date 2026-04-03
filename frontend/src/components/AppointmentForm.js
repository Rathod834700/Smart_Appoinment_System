import React, { useEffect, useState } from "react";
import { fetchDoctors, createAppointment } from "../services/api";

export default function AppointmentForm({ onSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientName: "", doctorName: "", time: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAppointment({ ...form, status: "pending" });
      setForm({ patientName: "", doctorName: "", time: "" });
      onSuccess && onSuccess("Appointment created successfully");
    } catch (err) {
      onSuccess && onSuccess("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded shadow space-y-3">
      <div>
        <label className="block text-sm">Patient Name</label>
        <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full border p-2 rounded" required />
      </div>

      <div>
        <label className="block text-sm">Doctor</label>
        <select value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="w-full border p-2 rounded" required>
          <option value="">Select doctor</option>
          {doctors.map((d) => <option key={d._id} value={d.name}>{d.name} — {d.specialization}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm">Time</label>
        <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border p-2 rounded" required />
      </div>

      <div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Saving..." : "Book Appointment"}
        </button>
      </div>
    </form>
  );
}
