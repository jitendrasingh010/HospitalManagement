import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = `${BASE_URL}/hospital`

const AdminProfile = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const token = localStorage.getItem('token')

  const [user, setUser] = useState({})
  const [edit, setEdit] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordBox, setPasswordBox] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  })
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    BG: '',
    image: '',
  })

  const getProfile = async () => {
    if (!token) { navigate('/'); return }
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setForm({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          age: data.user.age,
          gender: data.user.gender,
          BG: data.user.BG,
          image: data.user.image || '',
        })
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Profile could not be loaded')
      console.error(error)
    }
  }

  useEffect(() => {
    getProfile()
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handlePasswordChange = (event) => {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.age || !form.gender || !form.BG) {
      setMessage('All fields are required')
      return
    }

    try {
      const response = await fetch(`${API_URL}/updateprofile`, {
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
        alert('Profile updated successfully')
        setEdit(false)
        getProfile()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile could not be updated')
      alert('Profile could not be updated')
      console.error(error)
    }
  }

  const logout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?')
    if (!confirmLogout) return

    localStorage.removeItem('token')
    alert('Logout successfully')
    navigate('/')
  }

  const resetPassword = async (event) => {
    event.preventDefault()

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setMessage('Old password and new password are required')
      return
    }

    try {
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
        alert('Password changed successfully')
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

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile</h1>
          <p className="muted">Your profile details</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <button className="secondary-btn" onClick={() => setEdit(true)}>Edit</button>
          <button className="secondary-btn" onClick={() => setPasswordBox(true)}>Reset Password</button>
          <button className="danger-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <section className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            {user.image ? <img src={user.image} alt="Profile" /> : (user.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user.name || 'User'}</h2>
            <p>{user.email || 'No email'}</p>
          </div>
        </div>

        {!edit && (
          <div className="profile-grid">
            <div className="profile-info">
              <span>Name</span>
              <strong>{user.name || '-'}</strong>
            </div>
            <div className="profile-info">
              <span>Email</span>
              <strong>{user.email || '-'}</strong>
            </div>
            <div className="profile-info">
              <span>Phone</span>
              <strong>{user.phone || '-'}</strong>
            </div>
            <div className="profile-info">
              <span>Age</span>
              <strong>{user.age || '-'}</strong>
            </div>
            <div className="profile-info">
              <span>Gender</span>
              <strong>{user.gender || '-'}</strong>
            </div>
            <div className="profile-info">
              <span>Blood Group</span>
              <strong>{user.BG || '-'}</strong>
            </div>
          </div>
        )}

        {edit && (
          <form className="profile-form" onSubmit={handleSubmit}>
            <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="phone" type="number" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="BG" type="text" placeholder="Blood Group" value={form.BG} onChange={handleChange} />
            <input name="image" type="file" accept="image/*" onChange={handleImageChange} />

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

        {message && <p className="message profile-message">{message}</p>}
      </section>
    </main>
  )
}

export default AdminProfile
