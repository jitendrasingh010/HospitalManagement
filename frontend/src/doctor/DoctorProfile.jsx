import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorSidebar from './DoctorSidebar'

const API_URL = `${BASE_URL}/doctor`

const DoctorProfile = () => {
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [edit, setEdit] = useState(false)
  const [passwordBox, setPasswordBox] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    specialization: '',
    experience: '',
    qualification: '',
    fees: '',
    availableDays: '',
    startTime: '',
    endTime: '',
    about: '',
    image: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  })

  const fillForm = (doctorData) => {
    setForm({
      name: doctorData.name || '',
      email: doctorData.email || '',
      phone: doctorData.phone || '',
      gender: doctorData.gender || '',
      age: doctorData.age || '',
      specialization: doctorData.specialization || '',
      experience: doctorData.experience || '',
      qualification: doctorData.qualification || '',
      fees: doctorData.fees || '',
      availableDays: doctorData.availableDays?.join(', ') || '',
      startTime: doctorData.availableTime?.start || '',
      endTime: doctorData.availableTime?.end || '',
      about: doctorData.about || '',
      image: doctorData.image || '',
    })
  }

  const getProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/myprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setDoctor(data.doctor || {})
        fillForm(data.doctor || {})
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => getProfile())
  }, [])

  const logout = () => {
    alert('Are you sure you want to logout?')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handlePasswordChange = (event) => {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value })
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please select valid image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({ ...form, image: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const saveProfile = async (event) => {
    event.preventDefault()

    const departmentId = doctor.subDepartmentId?.departmentId?._id || doctor.subDepartmentId?.departmentId
    const subDepartmentId = doctor.subDepartmentId?._id || doctor.subDepartmentId

    if (!form.name || !form.email || !form.phone || !form.specialization) {
      setMessage('Name, email, phone and specialization required hai')
      return
    }

    if (!departmentId || !subDepartmentId) {
      setMessage('Department details missing hai')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const updateData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        age: form.age,
        specialization: form.specialization,
        experience: form.experience,
        qualification: form.qualification,
        fees: form.fees,
        availableDays: form.availableDays.split(',').map((day) => day.trim()).filter(Boolean),
        startTime: form.startTime,
        endTime: form.endTime,
        departmentId,
        subDepartmentId,
        about: form.about,
      }

      if (form.image && form.image.startsWith('data:image')) {
        updateData.image = form.image
      }

      const response = await fetch(`${API_URL}/update/${doctor._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setEdit(false)
        getProfile()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Profile update nahi ho payi')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    fillForm(doctor)
    setEdit(false)
  }

  const resetPassword = async (event) => {
    event.preventDefault()

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setMessage('Old password and new password required hai')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/changepassword`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Password changed successfully')
        setPasswordForm({ oldPassword: '', newPassword: '' })
        setPasswordBox(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Password change nahi ho paya')
      console.error(error)
    }
  }

  return (
    <main className="hospital-dash-layout">
      <DoctorSidebar />

      <section className="hospital-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Doctor Profile</h1>
          <p className="muted">Your hospital doctor details.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => setEdit(true)}>Edit</button>
          <button className="secondary-btn" onClick={() => setPasswordBox(true)}>Reset Password</button>
          <button className="danger-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading profile...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && (
        <section className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {doctor.image ? <img src={doctor.image} alt="Doctor" /> : (doctor.name || 'D').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>Dr. {doctor.name || 'Doctor'}</h2>
              <p>{doctor.email || '-'}</p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-info"><span>Phone</span><strong>{doctor.phone || '-'}</strong></div>
            <div className="profile-info"><span>Gender</span><strong>{doctor.gender || '-'}</strong></div>
            <div className="profile-info"><span>Age</span><strong>{doctor.age || '-'}</strong></div>
            <div className="profile-info"><span>Specialization</span><strong>{doctor.specialization || '-'}</strong></div>
            <div className="profile-info"><span>Experience</span><strong>{doctor.experience || 0} Years</strong></div>
            <div className="profile-info"><span>Qualification</span><strong>{doctor.qualification || '-'}</strong></div>
            <div className="profile-info"><span>Fees</span><strong>Rs. {doctor.fees || 0}</strong></div>
            <div className="profile-info"><span>Hospital</span><strong>{doctor.hospital?.name || '-'}</strong></div>
            <div className="profile-info"><span>Department</span><strong>{doctor.subDepartmentId?.departmentId?.name || '-'}</strong></div>
            <div className="profile-info"><span>Sub Department</span><strong>{doctor.subDepartmentId?.name || '-'}</strong></div>
            <div className="profile-info"><span>Available Days</span><strong>{doctor.availableDays?.join(', ') || '-'}</strong></div>
            <div className="profile-info"><span>Time</span><strong>{doctor.availableTime?.start || '-'} to {doctor.availableTime?.end || '-'}</strong></div>
          </div>

          {doctor.about && <p className="hospital-desc">{doctor.about}</p>}

          {edit && (
            <form className="profile-form" onSubmit={saveProfile}>
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
              <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
              <input name="experience" type="number" placeholder="Experience" value={form.experience} onChange={handleChange} />
              <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
              <input name="fees" type="number" placeholder="Fees" value={form.fees} onChange={handleChange} />
              <input name="availableDays" placeholder="Available days ex: Monday, Tuesday" value={form.availableDays} onChange={handleChange} />
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} />
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} />
              <label className="doctor-image-field">
                <span>Profile image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
              {form.image && (
                <div className="doctor-image-preview">
                  <img src={form.image} alt={form.name || 'Doctor'} />
                </div>
              )}
              <textarea name="about" placeholder="About doctor" value={form.about} onChange={handleChange} />
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" className="secondary-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </form>
          )}

          {passwordBox && (
            <form className="profile-form" onSubmit={resetPassword}>
              <input name="oldPassword" type="password" placeholder="Old password" value={passwordForm.oldPassword} onChange={handlePasswordChange} />
              <input name="newPassword" type="password" placeholder="New password" value={passwordForm.newPassword} onChange={handlePasswordChange} />
              <div className="form-actions">
                <button type="submit">Change Password</button>
                <button type="button" className="secondary-btn" onClick={() => setPasswordBox(false)}>Cancel</button>
              </div>
            </form>
          )}

          {message && <p className="message profile-message">{message}</p>}
        </section>
      )}
      </section>
    </main>
  )
}

export default DoctorProfile
