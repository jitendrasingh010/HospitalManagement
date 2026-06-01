import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Home from './components/Home'
import Login from './components/Login'
import UserProfile from './components/UserProfile'
import State from './components/State'
import District from './components/District'
import City from './components/City'
import Forget from './components/Forget'
import AddHospital from './components/AddHospital'
import Showhospital from './components/Showhospital'
import Signup from './components/Signup'
import User from './components/User'
import Appointment from './components/Appointment'
import HospitalDash from './hospitalDashboard/HospitalDash'
import Department from './hospitalDashboard/Department'
import HospitalProfile from './hospitalDashboard/HospitalProfile'
import AddLab from './hospitalDashboard/AddLab'
import SubDepartment from './hospitalDashboard/SubDepartment'
import Doctor from './hospitalDashboard/Doctor'
import Report from './hospitalDashboard/Report'
import Protected from './protectedRoute/protectedRoute'
import DetailHome from './components/DetailHome.jsx'
import Doctordashboard from './doctor/Doctordashboard'
import DoctorAppointment from './doctor/DoctorAppointment'
import DoctorProfile from './doctor/DoctorProfile'
import DoctorReport from './doctor/DoctorReport'
import Adminreport from './components/Adminreport'
import Labdashboard from './labdashobard/Labdashboard'
import LabProfile from './labdashobard/LabProfile'
import Test from './labdashobard/Test'
import TestReport from './labdashobard/TestReport'

const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    button: {
      fontWeight: 800,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#2563eb',
    },
    error: {
      main: '#dc2626',
    },
    success: {
      main: '#16a34a',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 42,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: 'var(--text)',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 16px 38px var(--shadow)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: 'var(--text)',
          background: 'var(--card)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'var(--text)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: 'var(--text)',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'var(--muted)',
        },
      },
    },
  },
})

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DetailHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forget" element={<Forget />} />
          <Route path="/addhospital" element={<AddHospital />} />
          <Route path="/AddHospital" element={<AddHospital />} />
          <Route path="/home" element={<Protected allowedRoles={['superadmin']}><Home /></Protected>} />
          <Route path="/profile" element={<Protected><UserProfile /></Protected>} />
          <Route path="/state" element={<Protected allowedRoles={['superadmin']}><State /></Protected>} />
          <Route path="/district" element={<Protected allowedRoles={['superadmin']}><District /></Protected>} />
          <Route path="/city" element={<Protected allowedRoles={['superadmin']}><City /></Protected>} />
          <Route path="/showhospitals" element={<Protected allowedRoles={['superadmin']}><Showhospital /></Protected>} />
          <Route path="/adminreport" element={<Protected allowedRoles={['superadmin']}><Adminreport /></Protected>} />
          <Route path="/userdashboard" element={<Protected allowedRoles={['user']}><User /></Protected>} />
          <Route path="/appointment" element={<Protected allowedRoles={['user']}><Appointment /></Protected>} />
          <Route path="/hospitaldashboard" element={<Protected allowedRoles={['hospital']}><HospitalDash /></Protected>} />
          <Route path="/departments" element={<Protected allowedRoles={['hospital']}><Department /></Protected>} />
          <Route path="/subdepartments" element={<Protected allowedRoles={['hospital']}><SubDepartment /></Protected>} />
          <Route path="/doctors" element={<Protected allowedRoles={['hospital']}><Doctor /></Protected>} />
          <Route path="/hospitalprofile" element={<Protected allowedRoles={['hospital']}><HospitalProfile /></Protected>} />
          <Route path="/addlab" element={<Protected allowedRoles={['hospital']}><AddLab /></Protected>} />
          <Route path="/reports" element={<Protected allowedRoles={['hospital']}><Report /></Protected>} />
          <Route path="/doctordashboard" element={<Protected allowedRoles={['doctor']}><Doctordashboard /></Protected>} />
          <Route path="/doctorappointment" element={<Protected allowedRoles={['doctor']}><DoctorAppointment /></Protected>} />
          <Route path="/doctorprofile" element={<Protected allowedRoles={['doctor']}><DoctorProfile /></Protected>} />
          <Route path="/doctorreport" element={<Protected allowedRoles={['doctor']}><DoctorReport /></Protected>} />
          <Route path="/labdashboard" element={<Protected allowedRoles={['lab']}><Labdashboard /></Protected>} />
          <Route path="/labprofile" element={<Protected allowedRoles={['lab']}><LabProfile /></Protected>} />
          <Route path="/test" element={<Protected allowedRoles={['lab', 'hospital']}><Test /></Protected>} />
          <Route path="/testreport" element={<Protected allowedRoles={['lab', 'hospital']}><TestReport /></Protected>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
