import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000'

const Home = () => {
  const usenavigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
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
    { title: 'States', icon: '⌂', count: counts.states, path: '/state', text: 'Manage state master data' },
    { title: 'Districts', icon: '▦', count: counts.districts, path: '/district', text: 'Manage district records' },
    { title: 'Cities', icon: '⌾', count: counts.cities, path: '/city', text: 'Manage city records' },
    { title: 'Hospitals', icon: '+', count: counts.hospitals, path: '/showhospitals', text: 'Manage hospital records' },
  ]

  const menuItems = [
    { label: 'Dashboard', icon: '◆', path: '/home' },
    { label: 'State', icon: '⌂', path: '/state' },
    { label: 'District', icon: '▦', path: '/district' },
    { label: 'City', icon: '⌾', path: '/city' },
    { label: 'Hospitals', icon: '+', path: '/showhospitals' },
    { label: 'Profile', icon: '●', path: '/profile' },
  ]

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Hospital</p>
          <h2>Admin Panel</h2>
        </div>

        <div className="theme-row">
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>

        <nav className="side-menu">
          {menuItems.map((item) => (
            <button key={item.path} onClick={() => usenavigate(item.path)}>
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-hero">
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Dashboard</h1>
          </div>
          <button className="secondary-btn" onClick={() => usenavigate('/profile')}>Profile</button>
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
      </section>
    </main>
  )
}

export default Home
