import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import HospitalSidebar from './HospitalSidebar'

const API_URL = 'http://localhost:5000/subdepartment'
const DEPARTMENT_URL = 'http://localhost:5000/department'

const SubDepartment = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [subDepartments, setSubDepartments] = useState([])
  const [departments, setDepartments] = useState([])
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
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
      setLoading(true)
      const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setSubDepartments(data.subDepartments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub departments could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getDepartments()
    getSubDepartments()
  }, [])

  const clearForm = () => {
    setName('')
    setDepartmentId('')
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

  const saveSubDepartment = async (event) => {
    event.preventDefault()

    if (!name.trim() || !departmentId) {
      setMessage('Name and department are required')
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
          departmentId,
        }),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Sub department updated' : 'Sub department added')
        closePopup()
        getSubDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub department could not be saved')
      console.error(error)
    }
  }

  const editSubDepartment = (item) => {
    setEditId(item._id)
    setName(item.name)
    setDepartmentId(item.departmentId?._id || item.departmentId)
    setShowPopup(true)
  }

  const inactiveSubDepartment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/softdelete/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Sub department inactive')
        getSubDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub department could not be inactive')
      console.error(error)
    }
  }

  const restoreSubDepartment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Sub department active')
        getSubDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub department could not be active')
      console.error(error)
    }
  }

  const deleteSubDepartment = async (id) => {
    const confirmDelete = window.confirm('Delete this sub department?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Sub department deleted')
        getSubDepartments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Sub department could not be deleted')
      console.error(error)
    }
  }

  const searchValue = search.toLowerCase().trim()

  const filteredSubDepartments = subDepartments
    .filter((item) => {
      if ((item.status || 'active') !== statusFilter) {
        return false
      }

      if (!searchValue) {
        return true
      }

      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.departmentId?.name?.toLowerCase().includes(searchValue)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'department') {
        return (a.departmentId?.name || '').localeCompare(b.departmentId?.name || '')
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })
  const activeDepartments = departments.filter((item) => (item.status || 'active') === 'active')

  return (
    <main className="hospital-dash-layout">
      <HospitalSidebar />

      <section className="hospital-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Sub Departments</h1>
          <p className="muted">Add, show, update and delete sub departments.</p>
        </div>

        <div className="header-actions">
          <button className="add-symbol-btn" onClick={openAddPopup} title="Add sub department">+</button>
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
          <button className="secondary-btn" onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search sub department or department"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="department">Department A-Z</option>
        </select>
      </div>

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box">
            <div className="popup-head">
              <h2>{editId ? 'Update Sub Department' : 'Add Sub Department'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>×</button>
            </div>

            <form className="login-form" onSubmit={saveSubDepartment}>
              <input
                type="text"
                placeholder="Sub department name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                <option value="">Select department</option>
                {activeDepartments.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
              <button type="submit">{editId ? 'Update' : 'Add'} Sub Department</button>
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
              <th>Sub Department</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubDepartments.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.departmentId?.name || '-'}</td>
                <td>
                  <span className={(item.status || 'active') === 'active' ? 'status-active' : 'status-inactive'}>
                    {item.status || 'active'}
                  </span>
                </td>
                <td className="department-actions">
                  <button className="icon-btn edit-icon" onClick={() => editSubDepartment(item)} title="Edit">✎</button>
                  {(item.status || 'active') === 'active' ? (
                    <button className="link-btn" onClick={() => inactiveSubDepartment(item._id)}>Inactive</button>
                  ) : (
                    <button className="link-btn" onClick={() => restoreSubDepartment(item._id)}>Active</button>
                  )}
                  <button className="icon-btn delete-icon" onClick={() => deleteSubDepartment(item._id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading sub departments...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && filteredSubDepartments.length === 0 && (
        <div className="empty-state">
          <h2>No sub departments found</h2>
          <p className="muted">No {statusFilter} sub department found.</p>
        </div>
      )}
      </section>
    </main>
  )
}

export default SubDepartment
