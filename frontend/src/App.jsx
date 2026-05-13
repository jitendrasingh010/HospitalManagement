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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/state" element={<State />} />
        <Route path="/district" element={<District />} />
        <Route path="/city" element={<City />} />
        <Route path="/addhospital" element={<AddHospital />} />
        <Route path="/AddHospital" element={<AddHospital />} />
        <Route path="/showhospitals" element={<Showhospital />} />
        <Route path="/hospitaldashboard" element={<HospitalDash />} />
        <Route path="/departments" element={<Department />} />
        <Route path="/subdepartments" element={<SubDepartment />} />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/departmentprofile" element={<DepartmentProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
