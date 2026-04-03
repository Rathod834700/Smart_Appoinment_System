import React, { useState } from "react";
import AppointmentForm from "../components/AppointmentForm";
import Notifications from "../components/Notifications";

export default function PatientPortal() {
  const [message, setMessage] = useState(null);

  return (
    <div className="space-y-4">
      <h2 className="h2">Patient Portal</h2>
      <AppointmentForm onSuccess={(m) => setMessage(m)} />
      <Notifications message={message} />
    </div>
  );
}
