import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'


const API_URL = 'http://localhost:5000/hospital'

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
          navigate('/departmentprofile')
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
      <section className="login-box">
        <div className="theme-row">
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
        <div className="login-head">
          <div className="login-logo">H</div>
          <div>
            <p className="eyebrow">Hospital Management</p>
            <h1>Login</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button type="submit">Login</button>
        </form>

        <button className="forgot-btn" onClick={() => navigate('/forget')} type="button">
          Forgot Password?
        </button>
        <button className="forgot-btn" onClick={() => navigate('/signup')} type="button">
          New user? Signup
        </button>
        {message && <p className="message">{message}</p>}

        <div className="login-points">
          <span>Secure login</span>
          <span>Master data</span>
          <span>Profile access</span>
        </div>
      </section>
     
    </main>
  )
}

export default Login
