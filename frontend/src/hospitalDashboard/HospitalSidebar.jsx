import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const HospitalSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const profileName = user.name || 'Hospital'
  const profileEmail = user.email || 'hospital panel'

  const menuItems = [
    { path: '/hospitaldashboard', icon: 'H', label: 'Dashboard' },
    { path: '/departments', icon: '+', label: 'Departments' },
    { path: '/subdepartments', icon: 'S', label: 'Sub Departments' },
    { path: '/doctors', icon: 'Dr', label: 'Doctors' },
    { path: '/addlab', icon: 'L', label: 'Labs' },
    { path: '/test', icon: 'T', label: 'Tests' },
    { path: '/testreport', icon: 'TR', label: 'Test Reports' },
    { path: '/reports', icon: 'R', label: 'Reports' },
  ]

  return (
    <aside className="hospital-sidebar">
      <div>
        <p className="eyebrow">Hospital</p>
        <h2>Hospital Panel</h2>
      </div>

      <button
        className={location.pathname === '/hospitalprofile' ? 'hospital-sidebar-profile profile-active' : 'hospital-sidebar-profile'}
        onClick={() => navigate('/hospitalprofile')}
      >
        <span className="hospital-sidebar-avatar">
          {user.image ? <img src={user.image} alt={profileName} /> : profileName.charAt(0).toUpperCase()}
        </span>
        <span className="hospital-sidebar-profile-text">
          <b>{profileName}</b>
          <small>{profileEmail}</small>
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

export default HospitalSidebar
