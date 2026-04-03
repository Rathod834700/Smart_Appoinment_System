import React, { useEffect, useState } from "react";
import DoctorDashboard from "../components/DoctorDashboard";
import PatientQueue from "../components/PatientQueue";
import { fetchDoctors, fetchQueue } from "../services/api";

export default function AdminPanel() {
  const [doctors, setDoctors] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    fetchDoctors().then(setDoctors).catch(() => setDoctors([]));
    fetchQueue().then(setQueue).catch(() => setQueue([]));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <DoctorDashboard doctors={doctors} />
      <PatientQueue queue={queue} />
    </div>
  );
}
