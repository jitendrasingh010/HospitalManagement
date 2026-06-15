import { BASE_URL } from '../config';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'


const API_URL = `${BASE_URL}/hospital`

const Login = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setMessage('Email and password are required')
      return
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
  
      const data = await response.json()

      setMessage(data.message)
      if (response.ok) {
        alert('Login successful')
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (data.user?.role === 'hospital') {
          navigate('/hospitaldashboard')
        } else if (data.user?.role === 'doctor') {
          navigate('/doctordashboard')
        } else if (data.user?.role === 'lab') {
          navigate('/labdashboard')
        } else if (data.user?.role === 'user') {
          navigate('/userdashboard')
        } else {
          navigate('/home')
        }
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Login failed')
      alert('Login failed')
      console.error(error)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-badge">H+</div>
        <p className="eyebrow">Hospital Management</p>
        <h1>Smart care starts with a simple login.</h1>
        <p className="login-brand-text">
          Manage hospitals, doctors, patients and appointments from one clean dashboard.
        </p>

        <div className="login-feature-grid">
          <span><b>24/7</b>Access</span>
          <span><b>4</b>Roles</span>
          <span><b>Fast</b>Booking</span>
        </div>
      </section>

      <section className="login-box">
        <div className="theme-row">
          <button className="back-btn" onClick={() => navigate('/')} type="button">Back to home</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>

        <div className="login-head">
          <div className="login-logo">H</div>
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Welcome Back</h1>
            <p className="muted">Login with your registered account.</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label className="login-field full-width">
            <span>Email Address</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="login-field full-width">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button type="submit" className="full-width mt-3">Login Now</button>
        </form>

        <div className="login-links">
          <button className="forgot-btn" onClick={() => navigate('/forget')} type="button">
            Forgot Password?
          </button>
          <button className="forgot-btn" onClick={() => navigate('/signup')} type="button">
            Create Account
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="login-points">
          <span>Secure login</span>
          <span>Doctor panel</span>
          <span>User panel</span>
          <span>Hospital panel</span>
        </div>
      </section>
    </main>
  )
}

export default Login
