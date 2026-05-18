import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/doctor'
const DEPARTMENT_URL = 'http://localhost:5000/department'
const SUB_DEPARTMENT_URL = 'http://localhost:5000/subdepartment'

const emptyForm = {
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
  departmentId: '',
  subDepartmentId: '',
  image: '',
  about: '',
}

const Doctor = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [subDepartments, setSubDepartments] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [statusFilter, setStatusFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('token')

  const getDepartments = async () => {
    try {
      const response = await fetch(`${DEPARTMENT_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()

      if (response.ok) {
        setDepartments(data.departments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Departments could not be loaded')
      console.error(error)
    }
  }

  const getSubDepartments = async () => {
    try {
      const response = await fetch(`${SUB_DEPARTMENT_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()

      if (response.ok) {
        setSubDepartments(data.subDepartments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub departments could not be loaded')
      console.error(error)
    }
  }

  const getDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setDoctors(data.doctors || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Doctors could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDepartments()
    getSubDepartments()
    getDoctors()
  }, [])

  const handleChange = (event) => {
    if (event.target.name === 'image') {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((currentForm) => ({ ...currentForm, image: reader.result }))
      }
      reader.readAsDataURL(file)
      return
    }

    if (event.target.name === 'departmentId') {
      setForm({ ...form, departmentId: event.target.value, subDepartmentId: '' })
      return
    }

    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const clearForm = () => {
    setForm(emptyForm)
    setEditId(null)
  }

  const openAddPopup = () => {
    clearForm()
    setShowPopup(true)
  }

  const closePopup = () => {
    clearForm()
    setShowPopup(false)
  }

  const saveDoctor = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.phone || !form.specialization || !form.departmentId || !form.subDepartmentId) {
      setMessage('Name, email, phone, specialization, department and sub department are required')
      return
    }

    try {
      const url = editId ? `${API_URL}/update/${editId}` : `${API_URL}/add`
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        fees: form.fees ? Number(form.fees) : undefined,
        availableDays: form.availableDays ? form.availableDays.split(',').map((day) => day.trim()) : [],
      }

      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Doctor updated' : 'Doctor added')
        closePopup()
        getDoctors()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Doctor could not be saved')
      console.error(error)
    }
  }

  const editDoctor = (item) => {
    setEditId(item._id)
    setForm({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      gender: item.gender || '',
      age: item.age || '',
      specialization: item.specialization || '',
      experience: item.experience || '',
      qualification: item.qualification || '',
      fees: item.fees || '',
      availableDays: item.availableDays?.join(', ') || '',
      startTime: item.availableTime?.start || '',
      endTime: item.availableTime?.end || '',
      departmentId: item.departmentId?._id || item.subDepartmentId?.departmentId?._id || '',
      subDepartmentId: item.subDepartmentId?._id || item.subDepartmentId || '',
      image: item.image || '',
      about: item.about || '',
    })
    setShowPopup(true)
  }

  const inactiveDoctor = async (id) => {
    try {
      const response = await fetch(`${API_URL}/softdelete/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Doctor inactive')
        getDoctors()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Doctor could not be inactive')
      console.error(error)
    }
  }

  const restoreDoctor = async (id) => {
    try {
      const response = await fetch(`${API_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Doctor active')
        getDoctors()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Doctor could not be active')
      console.error(error)
    }
  }

  const deleteDoctor = async (id) => {
    const confirmDelete = window.confirm('Delete this doctor?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Doctor deleted')
        getDoctors()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Doctor could not be deleted')
      console.error(error)
    }
  }

  const searchValue = search.toLowerCase().trim()

  const filteredDoctors = doctors
    .filter((item) => {
      if ((item.status || 'active') !== statusFilter) {
        return false
      }

      if (!searchValue) {
        return true
      }

      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.phone?.toLowerCase().includes(searchValue) ||
        item.specialization?.toLowerCase().includes(searchValue) ||
        item.subDepartmentId?.name?.toLowerCase().includes(searchValue) ||
        item.subDepartmentId?.departmentId?.name?.toLowerCase().includes(searchValue)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'fees') {
        return Number(b.fees || 0) - Number(a.fees || 0)
      }
      if (sortBy === 'experience') {
        return Number(b.experience || 0) - Number(a.experience || 0)
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })
  const activeDepartments = departments.filter((item) => (item.status || 'active') === 'active')
  const activeSubDepartments = subDepartments.filter((item) => {
    const itemDepartmentId = item.departmentId?._id || item.departmentId
    return (item.status || 'active') === 'active' && itemDepartmentId === form.departmentId
  })

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Doctors</h1>
          <p className="muted">Add, show, update and delete doctors.</p>
        </div>

        <div className="header-actions">
          <button className="add-symbol-btn" onClick={openAddPopup} title="Add doctor">+</button>
          <button className={statusFilter === 'active' ? 'filter-btn active-filter' : 'filter-btn'} onClick={() => setStatusFilter('active')}>Active</button>
          <button className={statusFilter === 'inactive' ? 'filter-btn active-filter' : 'filter-btn'} onClick={() => setStatusFilter('inactive')}>Inactive</button>
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="secondary-btn" onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search doctor, email, phone or department"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="fees">Fees high</option>
          <option value="experience">Experience high</option>
        </select>
      </div>

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box doctor-popup">
            <div className="popup-head">
              <h2>{editId ? 'Update Doctor' : 'Add Doctor'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>×</button>
            </div>

            <form className="doctor-form" onSubmit={saveDoctor}>
              <input name="name" placeholder="Doctor name *" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} />
              <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} />
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
              <input name="specialization" placeholder="Specialization *" value={form.specialization} onChange={handleChange} />
              <select name="departmentId" value={form.departmentId} onChange={handleChange}>
                <option value="">Select department *</option>
                {activeDepartments.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
              <select name="subDepartmentId" value={form.subDepartmentId} onChange={handleChange}>
                <option value="">Select sub department *</option>
                {activeSubDepartments.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
              <input name="experience" type="number" placeholder="Experience" value={form.experience} onChange={handleChange} />
              <input name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
              <input name="fees" type="number" placeholder="Fees" value={form.fees} onChange={handleChange} />
              <input name="availableDays" placeholder="Days: Monday, Tuesday" value={form.availableDays} onChange={handleChange} />
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} />
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} />
              <label className="doctor-image-field">
                <span>Profile image</span>
                <input name="image" type="file" accept="image/*" onChange={handleChange} />
              </label>
              {form.image && (
                <div className="doctor-image-preview">
                  <img src={form.image} alt={form.name || 'Doctor'} />
                </div>
              )}
              <textarea name="about" placeholder="About doctor" value={form.about} onChange={handleChange} />
              <button type="submit">{editId ? 'Update' : 'Add'} Doctor</button>
              <button type="button" className="secondary-btn" onClick={closePopup}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialization</th>
              <th>Department</th>
              <th>Sub Department</th>
              <th>Fees</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="doctor-table-image">
                    {item.image ? <img src={item.image} alt={item.name} /> : <span>{item.name?.charAt(0) || 'D'}</span>}
                  </div>
                </td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.phone}</td>
                <td>{item.specialization}</td>
                <td>{item.departmentId?.name || item.subDepartmentId?.departmentId?.name || '-'}</td>
                <td>{item.subDepartmentId?.name || '-'}</td>
                <td>{item.fees || '-'}</td>
                <td>
                  <span className={(item.status || 'active') === 'active' ? 'status-active' : 'status-inactive'}>
                    {item.status || 'active'}
                  </span>
                </td>
                <td className="department-actions">
                  <button className="icon-btn edit-icon" onClick={() => editDoctor(item)} title="Edit">✎</button>
                  {(item.status || 'active') === 'active' ? (
                    <button className="link-btn" onClick={() => inactiveDoctor(item._id)}>Inactive</button>
                  ) : (
                    <button className="link-btn" onClick={() => restoreDoctor(item._id)}>Active</button>
                  )}
                  <button className="icon-btn delete-icon" onClick={() => deleteDoctor(item._id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading doctors...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && filteredDoctors.length === 0 && (
        <div className="empty-state">
          <h2>No doctors found</h2>
          <p className="muted">No {statusFilter} doctor found.</p>
        </div>
      )}
    </main>
  )
}

export default Doctor
