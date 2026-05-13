import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/department'

const HospitalDash = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [showPopup, setShowPopup] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

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

  return (
    <main className="hospital-dash-layout">
      <aside className="hospital-sidebar">
        <div>
          <p className="eyebrow">Hospital</p>
          <h2>Hospital Panel</h2>
        </div>

        <nav className="hospital-menu">
          <button onClick={() => navigate('/hospitaldashboard')}>
            <span>⌂</span>
            Dashboard
          </button>
          <button onClick={() => navigate('/departments')}>
            <span>+</span>
            Departments
          </button>
          <button onClick={() => navigate('/subdepartments')}>
            <span>▦</span>
            Sub Departments
          </button>
          <button onClick={() => navigate('/doctors')}>
            <span>Dr</span>
            Doctors
          </button>
          <button onClick={() => navigate('/departmentprofile')}>
            <span>●</span>
            Profile
          </button>
        </nav>
      </aside>

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
            <span className="hospital-card-icon">+</span>
            <b>Departments</b>
            <small>Add, edit, show and delete departments</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/subdepartments')}>
            <span className="hospital-card-icon">▦</span>
            <b>Sub Departments</b>
            <small>Add, edit, show and delete sub departments</small>
          </button>
          <button className="hospital-dash-card" onClick={() => navigate('/doctors')}>
            <span className="hospital-card-icon">Dr</span>
            <b>Doctors</b>
            <small>Add, edit, show and delete doctors</small>
          </button>
        </section>
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
