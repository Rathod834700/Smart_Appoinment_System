import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({ name: '', age: '', contact: '' });
  const [status, setStatus] = useState('');
  const [patients, setPatients] = useState([]);

  const [apptData, setApptData] = useState({ patientName: '', doctorName: '', requestedTime: '' });
  const [apptStatus, setApptStatus] = useState('');
  const [appointments, setAppointments] = useState([]);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const response = await fetch('http://localhost:5000/api/patients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setStatus(`✅ Success! Patient added with ID: ${data._id}`);
        setFormData({ name: '', age: '', contact: '' }); // Clear form
        fetchPatients(); // Reload list
      } else {
        setStatus(`❌ Error: Failed to add data.`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  const handleApptSubmit = async (e) => {
    e.preventDefault();
    setApptStatus('Booking...');
    try {
      const response = await fetch('http://localhost:5000/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptData)
      });
      const data = await response.json();
      if (response.ok) {
        setApptStatus(`✅ Success! Appointment booked with ID: ${data._id}`);
        setApptData({ patientName: '', doctorName: '', requestedTime: '' });
        fetchAppointments();
      } else {
        setApptStatus(`❌ Error: Failed to book appointment.`);
      }
    } catch (err) {
      setApptStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="App" style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1>Smart Appointment System</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
        
        {/* Patient Form Section */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <h2>Patient Signup Form</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Name" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <input 
              type="number" 
              placeholder="Age" 
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <input 
              type="text" 
              placeholder="Contact" 
              value={formData.contact}
              onChange={e => setFormData({...formData, contact: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#282c34', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Sign Up
            </button>
          </form>
          {status && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>}

          <h3 style={{ marginTop: '30px' }}>Patients List ({patients.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {patients.map(p => (
              <li key={p._id} style={{ background: '#f4f4f4', margin: '5px 0', padding: '10px', borderRadius: '5px' }}>
                <strong>{p.name}</strong> - Age: {p.age}
              </li>
            ))}
          </ul>
        </div>

        {/* Appointment Form Section */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <h2>Book Appointment</h2>
          <form onSubmit={handleApptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Patient Name" 
              value={apptData.patientName}
              onChange={e => setApptData({...apptData, patientName: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <input 
              type="text" 
              placeholder="Doctor Name" 
              value={apptData.doctorName}
              onChange={e => setApptData({...apptData, doctorName: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <input 
              type="datetime-local" 
              value={apptData.requestedTime}
              onChange={e => setApptData({...apptData, requestedTime: e.target.value})}
              required
              style={{ padding: '10px' }}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Book Appointment
            </button>
          </form>
          {apptStatus && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{apptStatus}</p>}

          <h3 style={{ marginTop: '30px' }}>Appointments List ({appointments.length})</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {appointments.map(a => (
              <li key={a._id} style={{ background: '#e8f5e9', margin: '5px 0', padding: '10px', borderRadius: '5px' }}>
                <strong>{a.patientName}</strong> with <strong>{a.doctorName}</strong><br/>
                <small>{new Date(a.requestedTime).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
}

export default App;
