import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorSidebar from './DoctorSidebar'
import EventIcon from '@mui/icons-material/Event'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import PaymentsIcon from '@mui/icons-material/Payments'

const DOCTOR_URL = `${BASE_URL}/doctor`
const APPOINTMENT_URL = `${BASE_URL}/appointment`

const Doctordashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [doctor, setDoctor] = useState({})
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')

  const logout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (confirmed) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/')
    }
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
      <DoctorSidebar />
      <section className="hospital-main">
        <header className="hospital-topbar">
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="muted">Welcome Dr. {doctor.name || user.name || 'Doctor'}.</p>
          </div>

          <button className="danger-btn" onClick={logout}>Logout</button>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="hospital-dash-cards">
          <button className="hospital-dash-card" onClick={() => navigate('/doctorappointment')}>
            <span className="hospital-card-icon"><EventIcon fontSize="large" /></span>
            <b>{appointments.length}</b>
            <small>Total appointments booked with you</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/doctorprofile')}>
            <span className="hospital-card-icon"><MedicalServicesIcon fontSize="large" /></span>
            <b>{doctor.specialization || 'Specialization'}</b>
            <small>{doctor.qualification || 'View your doctor profile'}</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/doctorappointment')}>
            <span className="hospital-card-icon"><PaymentsIcon fontSize="large" /></span>
            <b>Rs. {doctor.fees || 0}</b>
            <small>Your consultation fees</small>
          </button>
        </section>
      </section>
    </main>
  )
}

export default Doctordashboard
