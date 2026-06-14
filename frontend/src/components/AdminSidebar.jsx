import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import DashboardIcon from '@mui/icons-material/Dashboard'
import MapIcon from '@mui/icons-material/Map'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import DomainIcon from '@mui/icons-material/Domain'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.name || 'Admin'
  const email = user.email || 'admin panel'

  const menuItems = [
    { path: '/home', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/state', icon: <MapIcon />, label: 'State' },
    { path: '/district', icon: <LocationCityIcon />, label: 'District' },
    { path: '/city', icon: <DomainIcon />, label: 'City' },
    { path: '/showhospitals', icon: <LocalHospitalIcon />, label: 'Hospitals' },
    { path: '/adminreport', icon: <AssessmentIcon />, label: 'Reports' },
  ]

  return (
    <aside className="hospital-sidebar">
      <div>
        <p className="eyebrow">Admin</p>
        <h2>Admin Panel</h2>
      </div>

      <button
        className={location.pathname === '/profile' ? 'hospital-sidebar-profile profile-active' : 'hospital-sidebar-profile'}
        onClick={() => navigate('/profile')}
      >
        <span className="hospital-sidebar-avatar">
          {user.image ? <img src={user.image} alt={name} /> : name.charAt(0).toUpperCase()}
        </span>
        <span className="hospital-sidebar-profile-text">
          <b>{name}</b>
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

export default AdminSidebar
