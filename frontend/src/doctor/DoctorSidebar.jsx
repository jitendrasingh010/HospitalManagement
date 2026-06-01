import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const DoctorSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.name || 'Doctor'
  const email = user.email || 'doctor panel'

  const menuItems = [
    { path: '/doctordashboard', icon: 'D', label: 'Dashboard' },
    { path: '/doctorappointment', icon: 'A', label: 'Appointments' },
    { path: '/doctorreport', icon: 'R', label: 'Reports' },
  ]

  return (
    <aside className="hospital-sidebar">
      <div>
        <p className="eyebrow">Doctor</p>
        <h2>Doctor Panel</h2>
      </div>

      <button
        className={location.pathname === '/doctorprofile' ? 'hospital-sidebar-profile profile-active' : 'hospital-sidebar-profile'}
        onClick={() => navigate('/doctorprofile')}
      >
        <span className="hospital-sidebar-avatar">
          {user.image ? <img src={user.image} alt={name} /> : name.charAt(0).toUpperCase()}
        </span>
        <span className="hospital-sidebar-profile-text">
          <b>Dr. {name}</b>
          <small>{email}</small>
        </span>
      </button>

      <nav className="hospital-menu">
        {menuItems.map((item) => (
          <button
            className={location.pathname === item.path ? 'menu-active' : ''}
            key={item.path}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button onClick={toggleTheme}>
          <span>{theme === 'light' ? 'D' : 'L'}</span>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </nav>
    </aside>
  )
}

export default DoctorSidebar
