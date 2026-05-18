import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const DOCTOR_URL = 'http://localhost:5000/doctor'
const APPOINTMENT_URL = 'http://localhost:5000/appointment'

const Doctordashboard = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [doctor, setDoctor] = useState({})
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('token')

      const profileResponse = await fetch(`${DOCTOR_URL}/myprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const profileData = await profileResponse.json()

      if (profileResponse.ok) {
        setDoctor(profileData.doctor || {})
      } else {
        setMessage(profileData.message)
      }

      const appointmentResponse = await fetch(`${APPOINTMENT_URL}/doctorappointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appointmentData = await appointmentResponse.json()

      if (appointmentResponse.ok) {
        setAppointments(appointmentData.appointments || [])
      }
    } catch (error) {
      setMessage('Dashboard load nahi ho paya')
      console.error(error)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadDashboard())
  }, [])

  return (
    <main className="hospital-dash-layout">
      <aside className="hospital-sidebar">
        <div>
          <p className="eyebrow">Doctor</p>
          <h2>Doctor Panel</h2>
        </div>

        <nav className="hospital-menu">
          <button onClick={() => navigate('/doctordashboard')}>
            <span>⌂</span>
            Dashboard
          </button>
          <button onClick={() => navigate('/doctorappointment')}>
            <span>▦</span>
            Appointments
          </button>
          <button onClick={() => navigate('/doctorprofile')}>
            <span>●</span>
            Profile
          </button>
        </nav>
      </aside>

      <section className="hospital-main">
        <header className="hospital-topbar">
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="muted">Welcome Dr. {doctor.name || user.name || 'Doctor'}.</p>
          </div>

          <div className="header-actions">
            <button className="theme-btn" onClick={toggleTheme} title="Change theme">
              {theme === 'light' ? '☾' : '☀'}
            </button>
            <button className="secondary-btn" onClick={() => navigate('/doctorprofile')}>Profile</button>
            <button className="danger-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="hospital-dash-cards">
          <button className="hospital-dash-card" onClick={() => navigate('/doctorappointment')}>
            <span className="hospital-card-icon">▦</span>
            <b>{appointments.length}</b>
            <small>Total appointments booked with you</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/doctorprofile')}>
            <span className="hospital-card-icon">Dr</span>
            <b>{doctor.specialization || 'Specialization'}</b>
            <small>{doctor.qualification || 'View your doctor profile'}</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/doctorappointment')}>
            <span className="hospital-card-icon">Rs</span>
            <b>Rs. {doctor.fees || 0}</b>
            <small>Your consultation fees</small>
          </button>
        </section>
      </section>
    </main>
  )
}

export default Doctordashboard
