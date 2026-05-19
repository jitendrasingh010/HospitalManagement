import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/lab'

const emptyForm = {
  name: '',
  email: '',
  location: '',
  contactNumber: '',
  status: 'active',
}

const AddLab = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [labs, setLabs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [statusFilter, setStatusFilter] = useState('active')
  const [loading, setLoading] = useState(true)

  const getToken = () => localStorage.getItem('token')

  const getLabs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/getlab`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setLabs(data.labs || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Labs could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getLabs()
  }, [])

  const handleChange = (event) => {
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

  const saveLab = async (event) => {
    event.preventDefault()

    if (!form.name || !form.email || !form.location || !form.contactNumber) {
      setMessage('Name, email, location and contact number are required')
      return
    }

    try {
      const url = editId ? `${API_URL}/updatelab/${editId}` : `${API_URL}/addlab`
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Lab updated' : 'Lab added')
        closePopup()
        getLabs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Lab could not be saved')
      console.error(error)
    }
  }

  const editLab = (item) => {
    setEditId(item._id)
    setForm({
      name: item.name || '',
      email: item.email || '',
      location: item.location || '',
      contactNumber: item.contactNumber || '',
      status: item.status || 'active',
    })
    setShowPopup(true)
  }

  const deleteLab = async (id) => {
    const confirmDelete = window.confirm('Delete this lab?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/deletelab/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Lab deleted')
        getLabs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Lab could not be deleted')
      console.error(error)
    }
  }

  const inactiveLab = async (id) => {
    try {
      const response = await fetch(`${API_URL}/softdelete/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Lab inactive')
        getLabs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Lab could not be inactive')
      console.error(error)
    }
  }

  const restoreLab = async (id) => {
    try {
      const response = await fetch(`${API_URL}/restore/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Lab active')
        getLabs()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Lab could not be active')
      console.error(error)
    }
  }

  const searchText = search.toLowerCase().trim()
  const filteredLabs = labs
    .filter((item) => {
      if ((item.status || 'active') !== statusFilter) {
        return false
      }

      if (!searchText) return true

      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.email?.toLowerCase().includes(searchText) ||
        item.location?.toLowerCase().includes(searchText) ||
        item.contactNumber?.toLowerCase().includes(searchText)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Labs</h1>
          <p className="muted">Add, show, update and delete lab accounts.</p>
        </div>

        <div className="header-actions">
          <button className="add-symbol-btn" onClick={openAddPopup} title="Add lab">+</button>
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
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="secondary-btn" onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'}</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search lab, email, phone or location"
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
              <h2>{editId ? 'Update Lab' : 'Add Lab'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>x</button>
            </div>

            <form className="login-form" onSubmit={saveLab}>
              <input name="name" placeholder="Lab name" value={form.name} onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
              <input name="contactNumber" placeholder="Contact number" value={form.contactNumber} onChange={handleChange} />
              {editId && (
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
              <button type="submit">{editId ? 'Update' : 'Add'} Lab</button>
              <button type="button" className="secondary-btn" onClick={closePopup}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading labs...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabs.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.location}</td>
                  <td>{item.contactNumber}</td>
                  <td>
                    <span className={(item.status || 'active') === 'active' ? 'status-active' : 'status-inactive'}>
                      {item.status || 'active'}
                    </span>
                  </td>
                  <td className="department-actions">
                    <button className="link-btn" onClick={() => editLab(item)} title="Edit">Edit</button>
                    {(item.status || 'active') === 'active' ? (
                      <button className="link-btn" onClick={() => inactiveLab(item._id)}>Inactive</button>
                    ) : (
                      <button className="link-btn" onClick={() => restoreLab(item._id)}>Active</button>
                    )}
                    <button className="icon-btn delete-icon" onClick={() => deleteLab(item._id)} title="Delete">x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredLabs.length === 0 && (
        <div className="empty-state">
          <h2>No labs found</h2>
          <p className="muted">No {statusFilter} lab found.</p>
        </div>
      )}
    </main>
  )
}

export default AddLab
