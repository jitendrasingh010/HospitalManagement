import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import ScienceIcon from '@mui/icons-material/Science'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const API_URL = `${BASE_URL}/lab`

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
            <span><DashboardIcon /></span>
            Dashboard
          </button>
          <button onClick={() => navigate('/labprofile')}>
            <span><PersonIcon /></span>
            Profile
          </button>
          <button onClick={() => navigate('/test')}>
            <span><ScienceIcon /></span>
            Tests
          </button>
          <button onClick={() => navigate('/testreport')}>
            <span><AssessmentIcon /></span>
            Reports
          </button>
          <button onClick={toggleTheme}>
            <span>{theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}</span>
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
            <span className="hospital-card-icon"><PersonIcon fontSize="large" /></span>
            <b>Lab Profile</b>
            <small>View lab email, phone and location</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/test')}>
            <span className="hospital-card-icon"><ScienceIcon fontSize="large" /></span>
            <b>Tests</b>
            <small>Add, edit, show and delete tests</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/testreport')}>
            <span className="hospital-card-icon"><AssessmentIcon fontSize="large" /></span>
            <b>Reports</b>
            <small>Add and manage patient test reports</small>
          </button>
        </section>
      </section>
    </main>
  )
}

export default Labdashboard
