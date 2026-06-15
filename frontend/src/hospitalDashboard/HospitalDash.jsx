import { BASE_URL } from '../config';
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HospitalSidebar from './HospitalSidebar'
import CategoryIcon from '@mui/icons-material/Category'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import BiotechIcon from '@mui/icons-material/Biotech'
import ScienceIcon from '@mui/icons-material/Science'
import AssessmentIcon from '@mui/icons-material/Assessment'

const API_URL = `${BASE_URL}/department`

const HospitalDash = () => {
  const navigate = useNavigate()
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')
  const [counts, setCounts] = useState({ departments: 0, subDepartments: 0, doctors: 0, labs: 0, tests: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }
        const [deptRes, subRes, docRes, labRes, testRes] = await Promise.all([
          fetch(`${BASE_URL}/department/get`, { headers }),
          fetch(`${BASE_URL}/subdepartment/get`, { headers }),
          fetch(`${BASE_URL}/doctor/get`, { headers }),
          fetch(`${BASE_URL}/lab/getlab`, { headers }),
          fetch(`${BASE_URL}/test/gettest`, { headers })
        ])

        const [deptData, subData, docData, labData, testData] = await Promise.all([
          deptRes.json(),
          subRes.json(),
          docRes.json(),
          labRes.json(),
          testRes.json()
        ])

        setCounts({
          departments: deptData.departments?.length || 0,
          subDepartments: subData.subDepartments?.length || 0,
          doctors: docData.doctors?.length || 0,
          labs: labData.labs?.length || 0,
          tests: testData.tests?.length || 0
        })
      } catch (error) {
        console.error('Hospital counts load error:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCounts()
  }, [])

  const addDepartment = async (event) => {
    event.preventDefault()

    if (!name.trim() || !description.trim()) {
      setMessage('All fields are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Department added successfully')
        setName('')
        setDescription('')
        setShowPopup(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Department could not be added')
      console.error(error)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const maxVal = Math.max(counts.departments, counts.subDepartments, counts.doctors, counts.labs, counts.tests, 1)
  const chartData = [
    { label: 'Depts', value: counts.departments, color: '#0f766e' },
    { label: 'Sub-Depts', value: counts.subDepartments, color: '#2563eb' },
    { label: 'Doctors', value: counts.doctors, color: '#8b5cf6' },
    { label: 'Labs', value: counts.labs, color: '#eab308' },
    { label: 'Tests', value: counts.tests, color: '#ec4899' },
  ]

  return (
    <main className="hospital-dash-layout">
      <HospitalSidebar />

      <section className="hospital-main">
        <header className="hospital-topbar">
          <div>
            <h1>Hospital Dashboard</h1>
            <p className="muted">Manage hospital departments from one place.</p>
          </div>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="hospital-dash-cards">
          <button className="hospital-dash-card" onClick={() => navigate('/departments')}>
            <span className="hospital-card-icon"><CategoryIcon fontSize="large" /></span>
            <b>Departments</b>
            <small>Add, edit, show and delete departments</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/subdepartments')}>
            <span className="hospital-card-icon"><AccountTreeIcon fontSize="large" /></span>
            <b>Sub Departments</b>
            <small>Add, edit, show and delete sub departments</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/doctors')}>
            <span className="hospital-card-icon"><MedicalServicesIcon fontSize="large" /></span>
            <b>Doctors</b>
            <small>Add, edit, show and delete doctors</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/addlab')}>
            <span className="hospital-card-icon"><BiotechIcon fontSize="large" /></span>
            <b>Labs</b>
            <small>Add, edit, show and delete labs</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/test')}>
            <span className="hospital-card-icon"><ScienceIcon fontSize="large" /></span>
            <b>Tests</b>
            <small>Add, edit, show and delete lab tests</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/reports')}>
            <span className="hospital-card-icon"><AssessmentIcon fontSize="large" /></span>
            <b>Reports</b>
            <small>View hospital statistics and download reports</small>
          </button>
        </section>

        <div className="chart-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '32px' }}>
          <div className="chart-card" style={{ background: 'var(--card)', border: '1px solid var(--border-soft)', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px var(--shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text)' }}>Hospital Resource Analysis</h3>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '10px 0' }}>
              {chartData.map((item) => {
                const heightPercentage = maxVal > 0 ? (item.value / maxVal) * 80 + 10 : 10
                return (
                  <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>{loading ? '...' : item.value}</span>
                    <div className="chart-animated-bar" style={{ width: '100%', height: `${heightPercentage}%`, background: `linear-gradient(to top, ${item.color}, ${item.color}bb)`, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease-in-out' }} />
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', textTransform: 'capitalize' }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="chart-card" style={{ background: 'var(--card)', border: '1px solid var(--border-soft)', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px var(--shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text)' }}>Weekly Patients Flow</h3>
            <svg viewBox="0 0 500 220" style={{ width: '100%', height: '220px' }}>
              <defs>
                <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="50" y1="30" x2="450" y2="30" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="90" x2="450" y2="90" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="150" x2="450" y2="150" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="180" x2="450" y2="180" stroke="var(--text)" strokeWidth="1" />
              
              <path className="chart-animated-area" d="M 50 160 Q 110 80 180 110 T 310 50 T 450 90 L 450 180 L 50 180 Z" fill="url(#patientGrad)" />
              <path className="chart-animated-line" d="M 50 160 Q 110 80 180 110 T 310 50 T 450 90" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
              
              <circle className="chart-animated-dot" cx="50" cy="160" r="4" fill="#2563eb" style={{ animationDelay: '0.1s' }} />
              <circle className="chart-animated-dot" cx="116" cy="100" r="4" fill="#2563eb" style={{ animationDelay: '0.3s' }} />
              <circle className="chart-animated-dot" cx="182" cy="108" r="4" fill="#2563eb" style={{ animationDelay: '0.5s' }} />
              <circle className="chart-animated-dot" cx="248" cy="72" r="4" fill="#2563eb" style={{ animationDelay: '0.7s' }} />
              <circle className="chart-animated-dot" cx="314" cy="50" r="4" fill="#2563eb" style={{ animationDelay: '0.9s' }} />
              <circle className="chart-animated-dot" cx="380" cy="65" r="4" fill="#2563eb" style={{ animationDelay: '1.1s' }} />
              <circle className="chart-animated-dot" cx="450" cy="90" r="4" fill="#2563eb" style={{ animationDelay: '1.3s' }} />

              <text x="50" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Mon</text>
              <text x="116" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Tue</text>
              <text x="182" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Wed</text>
              <text x="248" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Thu</text>
              <text x="314" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Fri</text>
              <text x="380" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Sat</text>
              <text x="450" y="200" fill="var(--muted)" fontSize="9" textAnchor="middle">Sun</text>
            </svg>
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box">
            <div className="popup-head">
              <h2>Add Department</h2>
              <button className="icon-btn delete-icon" onClick={() => setShowPopup(false)}>×</button>
            </div>

            <form className="login-form" onSubmit={addDepartment}>
              <input
                type="text"
                placeholder="Department name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <button type="submit">Add Department</button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default HospitalDash
