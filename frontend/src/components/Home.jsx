import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import MapIcon from '@mui/icons-material/Map'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import DomainIcon from '@mui/icons-material/Domain'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'

const API_URL = `${BASE_URL}`

const Home = () => {
  const usenavigate = useNavigate()
  const [counts, setCounts] = useState({ states: 0, districts: 0, cities: 0, hospitals: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const stateRes = await fetch(`${API_URL}/state/getstate`)
        const stateData = await stateRes.json()

        const districtRes = await fetch(`${API_URL}/district/getdistrict`)
        const districtData = await districtRes.json()

        const cityRes = await fetch(`${API_URL}/city/getcity`)
        const cityData = await cityRes.json()
        const token = localStorage.getItem('token')
        let hospitalData = { hospitals: [] }

        if (token) {
          const hospitalRes = await fetch(`${API_URL}/hospitalmanagement/get`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          hospitalData = await hospitalRes.json()
        }

        setCounts({
          states: stateData.states?.length || 0,
          districts: districtData.districts?.length || 0,
          cities: cityData.cities?.length || 0,
          hospitals: hospitalData.hospitals?.length || 0,
        })
      } catch (error) {
        console.error('Dashboard data error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const cards = [
    { title: 'States', icon: <MapIcon fontSize="large" />, count: counts.states, path: '/state', text: 'Manage state master data' },
    { title: 'Districts', icon: <LocationCityIcon fontSize="large" />, count: counts.districts, path: '/district', text: 'Manage district records' },
    { title: 'Cities', icon: <DomainIcon fontSize="large" />, count: counts.cities, path: '/city', text: 'Manage city records' },
    { title: 'Hospitals', icon: <LocalHospitalIcon fontSize="large" />, count: counts.hospitals, path: '/showhospitals', text: 'Manage hospital records' },
  ]

  const maxVal = Math.max(counts.states, counts.districts, counts.cities, counts.hospitals, 1)
  const chartData = [
    { label: 'States', value: counts.states, color: '#0f766e' },
    { label: 'Districts', value: counts.districts, color: '#2563eb' },
    { label: 'Cities', value: counts.cities, color: '#8b5cf6' },
    { label: 'Hospitals', value: counts.hospitals, color: '#ec4899' },
  ]

  return (
    <main className="hospital-dash-layout">
      <AdminSidebar />

      <section className="hospital-main">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Dashboard</h1>
          </div>
        </div>

        <section className="stats-grid">
          {cards.map((card) => (
            <button className="stat-card" key={card.title} onClick={() => usenavigate(card.path)}>
              <span className="stat-icon">{card.icon}</span>
              <span>{card.title}</span>
              <strong>{loading ? '...' : card.count}</strong>
              <small>{card.text}</small>
            </button>
          ))}
        </section>

        <div className="chart-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
          <div className="chart-card" style={{ background: 'var(--card)', border: '1px solid var(--border-soft)', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px var(--shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text)' }}>System Resource Overview</h3>
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', padding: '10px 0' }}>
              {chartData.map((item) => {
                const heightPercentage = maxVal > 0 ? (item.value / maxVal) * 80 + 10 : 10
                return (
                  <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)' }}>{loading ? '...' : item.value}</span>
                    <div className="chart-animated-bar" style={{ width: '100%', height: `${heightPercentage}%`, background: `linear-gradient(to top, ${item.color}, ${item.color}bb)`, borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease-in-out' }} />
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="chart-card" style={{ background: 'var(--card)', border: '1px solid var(--border-soft)', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px var(--shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text)' }}>Monthly Registrations Trend</h3>
            <svg viewBox="0 0 500 220" style={{ width: '100%', height: '220px' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="50" y1="30" x2="450" y2="30" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="90" x2="450" y2="90" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="150" x2="450" y2="150" stroke="var(--border-soft)" strokeDasharray="4" />
              <line x1="50" y1="180" x2="450" y2="180" stroke="var(--text)" strokeWidth="1" />
              
              <path className="chart-animated-area" d="M 50 180 Q 120 120 180 140 T 310 70 T 450 40 L 450 180 Z" fill="url(#lineGrad)" />
              <path className="chart-animated-line" d="M 50 180 Q 120 120 180 140 T 310 70 T 450 40" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
              
              <circle className="chart-animated-dot" cx="50" cy="180" r="4" fill="#0f766e" style={{ animationDelay: '0.1s' }} />
              <circle className="chart-animated-dot" cx="125" cy="130" r="4" fill="#0f766e" style={{ animationDelay: '0.3s' }} />
              <circle className="chart-animated-dot" cx="200" cy="135" r="4" fill="#0f766e" style={{ animationDelay: '0.5s' }} />
              <circle className="chart-animated-dot" cx="275" cy="85" r="4" fill="#0f766e" style={{ animationDelay: '0.7s' }} />
              <circle className="chart-animated-dot" cx="350" cy="65" r="4" fill="#0f766e" style={{ animationDelay: '0.9s' }} />
              <circle className="chart-animated-dot" cx="450" cy="40" r="4" fill="#0f766e" style={{ animationDelay: '1.1s' }} />

              <text x="50" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">Jan</text>
              <text x="125" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">Feb</text>
              <text x="200" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">Mar</text>
              <text x="275" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">Apr</text>
              <text x="350" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">May</text>
              <text x="450" y="200" fill="var(--muted)" fontSize="10" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
