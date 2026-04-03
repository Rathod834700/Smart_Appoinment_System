import React from "react";

export default function PatientQueue({ queue = [] }) {
  return (
    <section className="p-4 bg-white rounded shadow">
      <h3 className="font-medium mb-2">Patient Queue</h3>
      {queue.length === 0 ? <p>No appointments in queue.</p> : (
        <ol className="list-decimal pl-5 space-y-2">
          {queue.map((a) => (
            <li key={a._id} className="border p-2 rounded">
              <div><strong>{a.patientName}</strong> with <em>{a.doctorName}</em></div>
              <div className="text-sm text-gray-600">{a.time} — {a.status}</div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
