import { BASE_URL } from '../config';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const Signup = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
    BG: '',
    role: 'user',
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!form.name || !form.email || !form.password || !form.phone || !form.age || !form.gender || !form.BG) {
      setMessage('Please fill all fields')
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${BASE_URL}/hospital/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Signup successful')
        navigate('/')
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Signup failed')
      alert('Signup failed')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-box signup-box">
        <div className="theme-row">
          <button className="theme-btn" onClick={toggleTheme} title="Change theme" type="button">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>

        <div className="login-head">
          <div className="login-logo">H</div>
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Signup</h1>
            <p className="muted">Create your user account</p>
          </div>
        </div>

        <form className="login-form signup-form" onSubmit={handleSubmit}>
          <label className="login-field full-width">
            <span>Full Name</span>
            <input name="name" placeholder="Enter full name" value={form.name} onChange={handleChange} />
          </label>
          <label className="login-field full-width">
            <span>Email Address</span>
            <input name="email" type="email" placeholder="Enter email address" value={form.email} onChange={handleChange} />
          </label>
          <label className="login-field full-width">
            <span>Password</span>
            <input name="password" type="password" placeholder="Enter secure password" value={form.password} onChange={handleChange} />
          </label>
          
          <div className="form-row">
            <label className="login-field">
              <span>Phone Number</span>
              <input name="phone" type="number" placeholder="Enter phone" value={form.phone} onChange={handleChange} />
            </label>
            <label className="login-field">
              <span>Age</span>
              <input name="age" type="number" placeholder="Enter age" value={form.age} onChange={handleChange} />
            </label>
          </div>

          <div className="form-row">
            <label className="login-field">
              <span>Gender</span>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="login-field">
              <span>Blood Group</span>
              <select name="BG" value={form.BG} onChange={handleChange}>
                <option value="">Select type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="full-width mt-3">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <button className="forgot-btn" onClick={() => navigate('/')} type="button">
          Already have an account? Login
        </button>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  )
}

export default Signup
