import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/appointment'

const Appointment = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAppointments()
  }, [])

  const getAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/myappointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Appointments load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getDate = (date) => {
    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleDateString()
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>My Appointments</h1>
          <p className="muted">Your booked appointments are shown here.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate('/userdashboard')}>Dashboard</button>
          <button className="secondary-btn" onClick={() => navigate('/')}>Book New</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      {loading && (
        <div className="empty-state">
          <h2>Loading appointments...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="empty-state">
          <h2>No appointment found</h2>
          <p className="muted">Book appointment button se doctor select karke appointment book karo.</p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="hospital-grid">
          {appointments.map((item) => (
            <article className="hospital-card" key={item._id}>
              <div className="hospital-card-top">
                <div>
                  <span className="status-pill">Booked</span>
                  <h2>Dr. {item.doctorId?.name || 'Doctor'}</h2>
                </div>
              </div>

              <div className="hospital-info-grid">
                <span><b>Hospital</b>{item.hospitalId?.name || '-'}</span>
                <span><b>Specialization</b>{item.doctorId?.specialization || '-'}</span>
                <span><b>Date</b>{getDate(item.date)}</span>
                <span><b>Time</b>{item.time || '-'}</span>
                <span><b>Fees</b>Rs. {item.doctorId?.fees || 0}</span>
                <span><b>Contact</b>{item.hospitalId?.contact || '-'}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default Appointment
