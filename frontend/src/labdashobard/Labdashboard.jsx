import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/lab'

const Labdashboard = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [lab, setLab] = useState(null)
  const [message, setMessage] = useState('')

  const getLab = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/getlab`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setLab(data.labs?.[0] || null)
      }
    } catch (error) {
      setMessage('Lab details could not be loaded')
      console.error(error)
    }
  }

  useEffect(() => {
    getLab()
  }, [])

  return (
    <main className="hospital-dash-layout">
      <aside className="hospital-sidebar">
        <div>
          <p className="eyebrow">Lab</p>
          <h2>Lab Panel</h2>
        </div>

        <nav className="hospital-menu">
          <button onClick={() => navigate('/labdashboard')}>
            <span>L</span>
            Dashboard
          </button>
          <button onClick={() => navigate('/labprofile')}>
            <span>P</span>
            Profile
          </button>
          <button onClick={() => navigate('/test')}>
            <span>T</span>
            Tests
          </button>
          <button onClick={toggleTheme}>
            <span>{theme === 'light' ? 'D' : 'L'}</span>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </nav>
      </aside>

      <section className="hospital-main">
        <header className="hospital-topbar">
          <div>
            <p className="eyebrow">Welcome</p>
            <h1>{lab?.name || 'Lab Dashboard'}</h1>
            <p className="muted">Manage your lab profile and daily lab work.</p>
          </div>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="hospital-dash-cards">
          <button className="hospital-dash-card" onClick={() => navigate('/labprofile')}>
            <span className="hospital-card-icon">P</span>
            <b>Lab Profile</b>
            <small>View lab email, phone and location</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/test')}>
            <span className="hospital-card-icon">T</span>
            <b>Tests</b>
            <small>Add, edit, show and delete tests</small>
          </button>
          <div className="hospital-dash-card">
            <span className="hospital-card-icon">R</span>
            <b>Reports</b>
            <small>Report section can be added later</small>
          </div>
        </section>
      </section>
    </main>
  )
}

export default Labdashboard
