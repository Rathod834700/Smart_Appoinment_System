import React, { useState } from "react";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import PatientPortal from "./pages/PatientPortal";
import AppointmentForm from "./components/AppointmentForm";
import Notifications from "./components/Notifications";

export default function App() {
  const [page, setPage] = useState("home");
  const [message, setMessage] = useState(null);

  const renderPage = () => {
    if (page === "home") return <Home />;
    if (page === "admin") return <AdminPanel />;
    if (page === "patient") {
      // AppointmentForm is shown here for the Patient page
      return (
        <div className="space-y-4">
          <h2 className="h2">Patient Portal</h2>
          <AppointmentForm onSuccess={(m) => setMessage(m)} />
          <Notifications message={message} />
        </div>
      );
    }
    return <Home />;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <div className="logo">S</div>
          <h1>Smart Appointment Scheduler</h1>
        </div>

        <nav className="nav">
          <button className="btn btn-ghost" onClick={() => setPage("home")}>Home</button>
          <button className="btn" onClick={() => setPage("admin")}>Admin</button>
          <button className="btn btn-primary" onClick={() => setPage("patient")}>Patient</button>
        </nav>
      </header>

      <main>{renderPage()}</main>

      <footer className="app-footer">© Smart Appointment Scheduler</footer>
    </div>
  );
}
