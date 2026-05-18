import React from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const User = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <main className="hospital-dash-layout">
      <aside className="hospital-sidebar">
        <div>
          <p className="eyebrow">User</p>
          <h2>User Panel</h2>
        </div>

        <nav className="hospital-menu">
          <button onClick={() => navigate('/userdashboard')}>
            <span>⌂</span>
            Dashboard
          </button>
          <button onClick={() => navigate('/')}>
            <span>+</span>
            Book Appointment
          </button>
          <button onClick={() => navigate('/appointment')}>
            <span>▦</span>
            My Appointments
          </button>
          <button onClick={logout}>
            <span>X</span>
            Logout
          </button>
        </nav>
      </aside>

      <section className="hospital-main">
        <header className="hospital-topbar">
          <div>
            <h1>User Dashboard</h1>
            <p className="muted">Welcome {user.name || 'User'}, manage your appointments here.</p>
          </div>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </header>

        <section className="hospital-dash-cards">
          <button className="hospital-dash-card" onClick={() => navigate('/')}>
            <span className="hospital-card-icon">+</span>
            <b>Book Appointment</b>
            <small>Find doctor and book your appointment</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/appointment')}>
            <span className="hospital-card-icon">▦</span>
            <b>My Appointments</b>
            <small>See your booked appointments</small>
          </button>

          <button className="hospital-dash-card" onClick={() => navigate('/profile')}>
            <span className="hospital-card-icon">●</span>
            <b>Profile</b>
            <small>View and update your profile</small>
          </button>
        </section>
      </section>
    </main>
  )
}

export default User
