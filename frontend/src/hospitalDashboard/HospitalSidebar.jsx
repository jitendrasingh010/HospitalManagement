import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CategoryIcon from '@mui/icons-material/Category'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import BiotechIcon from '@mui/icons-material/Biotech'
import ScienceIcon from '@mui/icons-material/Science'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

const HospitalSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const profileName = user.name || 'Hospital'
  const profileEmail = user.email || 'hospital panel'

  const menuItems = [
    { path: '/hospitaldashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/departments', icon: <CategoryIcon />, label: 'Departments' },
    { path: '/subdepartments', icon: <AccountTreeIcon />, label: 'Sub Departments' },
    { path: '/doctors', icon: <MedicalServicesIcon />, label: 'Doctors' },
    { path: '/addlab', icon: <BiotechIcon />, label: 'Labs' },
    { path: '/test', icon: <ScienceIcon />, label: 'Tests' },
    { path: '/testreport', icon: <AssignmentIcon />, label: 'Test Reports' },
    { path: '/reports', icon: <AssessmentIcon />, label: 'Reports' },
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
          <span>{theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}</span>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </nav>
    </aside>
  )
}

export default HospitalSidebar
