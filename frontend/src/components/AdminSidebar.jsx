import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const name = user.name || 'Admin'
  const email = user.email || 'admin panel'

  const menuItems = [
    { path: '/home', icon: 'D', label: 'Dashboard' },
    { path: '/state', icon: 'S', label: 'State' },
    { path: '/district', icon: 'D', label: 'District' },
    { path: '/city', icon: 'C', label: 'City' },
    { path: '/showhospitals', icon: 'H', label: 'Hospitals' },
    { path: '/adminreport', icon: 'R', label: 'Reports' },
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
          <span>{theme === 'light' ? 'D' : 'L'}</span>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </nav>
    </aside>
  )
}

export default AdminSidebar
