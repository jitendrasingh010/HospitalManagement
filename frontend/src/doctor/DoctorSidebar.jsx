import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EventIcon from '@mui/icons-material/Event'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const DoctorSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.name || 'Doctor'
  const email = user.email || 'doctor panel'

  const menuItems = [
    { path: '/doctordashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/doctorappointment', icon: <EventIcon />, label: 'Appointments' },
    { path: '/doctorreport', icon: <AssessmentIcon />, label: 'Reports' },
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
          <span>{theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}</span>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </nav>
    </aside>
  )
}

export default DoctorSidebar
