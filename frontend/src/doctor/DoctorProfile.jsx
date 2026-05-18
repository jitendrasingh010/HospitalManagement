import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/doctor'

const DoctorProfile = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [doctor, setDoctor] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const getProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/myprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setDoctor(data.doctor || {})
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => getProfile())
  }, [])

  const logout = () => {
    alert('Are you sure you want to logout?')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Doctor Profile</h1>
          <p className="muted">Your hospital doctor details.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate('/doctordashboard')}>Back</button>
          <button className="secondary-btn" onClick={() => navigate('/doctorappointment')}>Appointments</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <button className="danger-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading profile...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && (
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {doctor.image ? <img src={doctor.image} alt="Doctor" /> : (doctor.name || 'D').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>Dr. {doctor.name || 'Doctor'}</h2>
              <p>{doctor.email || '-'}</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-info"><span>Phone</span><strong>{doctor.phone || '-'}</strong></div>
            <div className="profile-info"><span>Gender</span><strong>{doctor.gender || '-'}</strong></div>
            <div className="profile-info"><span>Age</span><strong>{doctor.age || '-'}</strong></div>
            <div className="profile-info"><span>Specialization</span><strong>{doctor.specialization || '-'}</strong></div>
            <div className="profile-info"><span>Experience</span><strong>{doctor.experience || 0} Years</strong></div>
            <div className="profile-info"><span>Qualification</span><strong>{doctor.qualification || '-'}</strong></div>
            <div className="profile-info"><span>Fees</span><strong>Rs. {doctor.fees || 0}</strong></div>
            <div className="profile-info"><span>Hospital</span><strong>{doctor.hospital?.name || '-'}</strong></div>
            <div className="profile-info"><span>Department</span><strong>{doctor.subDepartmentId?.departmentId?.name || '-'}</strong></div>
            <div className="profile-info"><span>Sub Department</span><strong>{doctor.subDepartmentId?.name || '-'}</strong></div>
            <div className="profile-info"><span>Available Days</span><strong>{doctor.availableDays?.join(', ') || '-'}</strong></div>
            <div className="profile-info"><span>Time</span><strong>{doctor.availableTime?.start || '-'} to {doctor.availableTime?.end || '-'}</strong></div>
          </div>

          {doctor.about && <p className="hospital-desc">{doctor.about}</p>}
          {message && <p className="message profile-message">{message}</p>}
        </section>
      )}
    </main>
  )
}

export default DoctorProfile
