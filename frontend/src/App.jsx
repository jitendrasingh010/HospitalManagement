import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Profile from './components/Profile'
import State from './components/State'
import District from './components/District'
import City from './components/City'
import Forget from './components/Forget'
import AddHospital from './components/AddHospital'
import Showhospital from './components/Showhospital'
import Signup from './components/Signup'
import HospitalDash from './hospitalDashboard/HospitalDash'
import Department from './hospitalDashboard/Department'
import DepartmentProfile from './hospitalDashboard/DepartmentProfile'
import SubDepartment from './hospitalDashboard/SubDepartment'
import Doctor from './hospitalDashboard/Doctor'
import Protected from './protectedRoute/protectedRoute'
import DetailHome from './components/DetailHome.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DetailHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/addhospital" element={<AddHospital />} />
        <Route path="/AddHospital" element={<AddHospital />} />

        <Route path="/home" element={<Protected allowedRoles={['superadmin']}><Home /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/state" element={<Protected allowedRoles={['superadmin']}><State /></Protected>} />
        <Route path="/district" element={<Protected allowedRoles={['superadmin']}><District /></Protected>} />
        <Route path="/city" element={<Protected allowedRoles={['superadmin']}><City /></Protected>} />
        <Route path="/showhospitals" element={<Protected allowedRoles={['superadmin']}><Showhospital /></Protected>} />

        <Route path="/hospitaldashboard" element={<Protected allowedRoles={['hospital']}><HospitalDash /></Protected>} />
        <Route path="/departments" element={<Protected allowedRoles={['hospital']}><Department /></Protected>} />
        <Route path="/subdepartments" element={<Protected allowedRoles={['hospital']}><SubDepartment /></Protected>} />
        <Route path="/doctors" element={<Protected allowedRoles={['hospital']}><Doctor /></Protected>} />
        <Route path="/departmentprofile" element={<Protected allowedRoles={['hospital']}><DepartmentProfile /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
