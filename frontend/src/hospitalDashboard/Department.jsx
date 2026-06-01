import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import HospitalSidebar from './HospitalSidebar'

const API_URL = 'http://localhost:5000/department'

const Department = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
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
      setLoading(true)
      const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setDepartments(data.departments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Departments could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDepartments()
  }, [])

  const clearForm = () => {
    setName('')
    setDescription('')
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

  const saveDepartment = async (event) => {
    event.preventDefault()

    if (!name.trim() || !description.trim()) {
      setMessage('All fields are required')
      return
    }

    try {
      const url = editId ? `${API_URL}/update/${editId}` : `${API_URL}/add`
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Department updated' : 'Department added')
        clearForm()
        setShowPopup(false)
        getDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Department could not be saved')
      console.error(error)
    }
  }

  const editDepartment = (item) => {
    setEditId(item._id)
    setName(item.name)
    setDescription(item.description)
    setShowPopup(true)
  }

  const deleteDepartment = async (id) => {
    const confirmDelete = window.confirm('Delete this department?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Department deleted')
        getDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Department could not be deleted')
      console.error(error)
    }
  }

  const inactiveDepartment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/softdelete/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Department inactive')
        getDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Department could not be inactive')
      console.error(error)
    }
  }

  const restoreDepartment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Department active')
        getDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Department could not be active')
      console.error(error)
    }
  }

  const searchValue = search.toLowerCase().trim()

  const filteredDepartments = departments
    .filter((item) => {
      if ((item.status || 'active') !== statusFilter) {
        return false
      }

      if (!searchValue) {
        return true
      }

      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.description?.toLowerCase().includes(searchValue)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })

  return (
    <main className="hospital-dash-layout">
      <HospitalSidebar />

      <section className="hospital-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Departments</h1>
          <p className="muted">Add, show, update and delete departments.</p>
        </div>
        <div className="header-actions">
          <button className="add-symbol-btn" onClick={openAddPopup} title="Add department">+</button>
          <button
            className={statusFilter === 'active' ? 'filter-btn active-filter' : 'filter-btn'}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={statusFilter === 'inactive' ? 'filter-btn active-filter' : 'filter-btn'}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive
          </button>
          <button className="secondary-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search department or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box">
            <div className="popup-head">
              <h2>{editId ? 'Update Department' : 'Add Department'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>×</button>
            </div>

            <form className="login-form" onSubmit={saveDepartment}>
              <input
                type="text"
                placeholder="Department name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <button type="submit">{editId ? 'Update' : 'Add'} Department</button>
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
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td className="department-desc-cell">{item.description}</td>
                <td>
                  <span className={(item.status || 'active') === 'active' ? 'status-active' : 'status-inactive'}>
                    {item.status || 'active'}
                  </span>
                </td>
                <td className="department-actions">
                  <button className="icon-btn edit-icon" onClick={() => editDepartment(item)} title="Edit">✎</button>
                  {(item.status || 'active') === 'active' ? (
                    <button className="link-btn" onClick={() => inactiveDepartment(item._id)}>Inactive</button>
                  ) : (
                    <button className="link-btn" onClick={() => restoreDepartment(item._id)}>Active</button>
                  )}
                  <button className="icon-btn delete-icon" onClick={() => deleteDepartment(item._id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading departments...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <div className="empty-state">
          <h2>No departments found</h2>
          <p className="muted">No {statusFilter} department found.</p>
        </div>
      )}
      </section>
    </main>
  )
}

export default Department
