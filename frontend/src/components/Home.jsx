import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

const API_URL = 'http://localhost:5000'

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
    { title: 'States', icon: '⌂', count: counts.states, path: '/state', text: 'Manage state master data' },
    { title: 'Districts', icon: '▦', count: counts.districts, path: '/district', text: 'Manage district records' },
    { title: 'Cities', icon: '⌾', count: counts.cities, path: '/city', text: 'Manage city records' },
    { title: 'Hospitals', icon: '+', count: counts.hospitals, path: '/showhospitals', text: 'Manage hospital records' },
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
      </section>
    </main>
  )
}

export default Home
