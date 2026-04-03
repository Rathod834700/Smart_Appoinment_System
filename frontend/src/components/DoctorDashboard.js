import React from "react";

export default function DoctorDashboard({ doctors = [] }) {
  return (
    <section className="p-4 bg-white rounded shadow">
      <h3 className="font-medium mb-2">Doctors</h3>
      {doctors.length === 0 ? <p>No doctors found.</p> : (
        <ul className="space-y-2">
          {doctors.map((d) => (
            <li key={d._id} className="border p-2 rounded">
              <div className="font-semibold">{d.name}</div>
              <div className="text-sm text-gray-600">{d.specialization}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
