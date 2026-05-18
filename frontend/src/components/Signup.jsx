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

      const response = await fetch('http://localhost:5000/hospital/signup', {
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
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
          <input name="phone" type="number" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />

          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select name="BG" value={form.BG} onChange={handleChange}>
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Signup'}
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
