import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/lab'

const LabProfile = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [lab, setLab] = useState(null)
  const [edit, setEdit] = useState(false)
  const [passwordBox, setPasswordBox] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', location: '', contactNumber: '', image: '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })

  const getLab = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/getlab`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        const labData = data.labs?.[0] || null
        setLab(labData)

        if (labData) {
          setForm({
            name: labData.name || '',
            email: labData.email || '',
            location: labData.location || '',
            contactNumber: labData.contactNumber || '',
            image: labData.image || '',
          })
        }
      }
    } catch (error) {
      setMessage('Lab profile could not be loaded')
      console.error(error)
    }
  }

  useEffect(() => {
    getLab()
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handlePasswordChange = (event) => {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const updateProfile = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.location || !form.contactNumber) {
      setMessage('All fields are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/updatemyprofile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Profile updated')
        setEdit(false)
        getLab()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile could not be updated')
      console.error(error)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setMessage('Old password and new password are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/changepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Password changed')
        setPasswordForm({ oldPassword: '', newPassword: '' })
        setPasswordBox(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Password could not be changed')
      console.error(error)
    }
  }

  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Lab</p>
          <h1>Lab Profile</h1>
          <p className="muted">Your lab information.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="secondary-btn" onClick={() => setEdit(true)}>Edit</button>
          <button className="secondary-btn" onClick={() => setPasswordBox(true)}>Reset Password</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <button className="danger-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      {lab ? (
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {lab.image ? <img src={lab.image} alt={lab.name} /> : (lab.name?.charAt(0) || 'L')}
            </div>
            <div>
              <h2>{lab.name}</h2>
              <p>{lab.email}</p>
            </div>
          </div>

          {!edit && (
            <div className="profile-grid">
            <div className="profile-info"><span>Location</span><strong>{lab.location}</strong></div>
            <div className="profile-info"><span>Contact</span><strong>{lab.contactNumber}</strong></div>
            <div className="profile-info"><span>Status</span><strong>{lab.status || 'active'}</strong></div>
            </div>
          )}

          {edit && (
            <form className="profile-form" onSubmit={updateProfile}>
              <input name="name" placeholder="Lab name" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
              <input name="contactNumber" placeholder="Contact number" value={form.contactNumber} onChange={handleChange} />
              <input name="image" type="file" accept="image/*" onChange={handleImageChange} />
              {form.image && (
                <div className="doctor-image-preview">
                  <img src={form.image} alt={form.name || 'Lab'} />
                </div>
              )}
              <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" className="secondary-btn" onClick={() => setEdit(false)}>Cancel</button>
              </div>
            </form>
          )}

          {passwordBox && (
            <form className="profile-form" onSubmit={resetPassword}>
              <input name="oldPassword" type="password" placeholder="Old password" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
              <input name="newPassword" type="password" placeholder="New password" value={passwordForm.newPassword} onChange={handlePasswordChange} />
              <div className="form-actions">
                <button type="submit">Change Password</button>
                <button type="button" className="secondary-btn" onClick={() => setPasswordBox(false)}>Cancel</button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <div className="empty-state">
          <h2>No profile found</h2>
          <p className="muted">Please contact hospital admin.</p>
        </div>
      )}
    </main>
  )
}

export default LabProfile
