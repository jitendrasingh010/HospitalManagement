import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import HospitalSidebar from '../hospitalDashboard/HospitalSidebar'

const API_URL = 'http://localhost:5000/test'
const LAB_URL = 'http://localhost:5000/lab'

const emptyForm = {
  name: '',
  price: '',
  labId: '',
  status: 'active',
}

const Test = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [tests, setTests] = useState([])
  const [labs, setLabs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [statusFilter, setStatusFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isHospital = user.role === 'hospital'

  const getToken = () => localStorage.getItem('token')

  const getTests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/gettest`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setTests(data.tests || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Tests could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getLabs = async () => {
    if (!isHospital) return

    try {
      const response = await fetch(`${LAB_URL}/getlab`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()

      if (response.ok) {
        setLabs(data.labs || [])
      }
    } catch (error) {
      setMessage('Labs could not be loaded')
      console.error(error)
    }
  }

  useEffect(() => {
    getTests()
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

  const saveTest = async (event) => {
    event.preventDefault()

    if (!form.name || !form.price || (isHospital && !form.labId)) {
      setMessage(isHospital ? 'Name, price and lab are required' : 'Name and price are required')
      return
    }

    try {
      const url = editId ? `${API_URL}/updatetest/${editId}` : `${API_URL}/addtest`
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Test updated' : 'Test added')
        closePopup()
        getTests()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Test could not be saved')
      console.error(error)
    }
  }

  const editTest = (item) => {
    setEditId(item._id)
    setForm({
      name: item.name || '',
      price: item.price || '',
      labId: item.labId?._id || item.labId || '',
      status: item.status || 'active',
    })
    setShowPopup(true)
  }

  const deleteTest = async (id) => {
    const confirmDelete = window.confirm('Delete this test?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/deletetest/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Test deleted')
        getTests()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Test could not be deleted')
      console.error(error)
    }
  }

  const changeStatus = async (item, status) => {
    try {
      const url = status === 'active' ? `${API_URL}/restore/${item._id}` : `${API_URL}/softdelete/${item._id}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(status === 'active' ? 'Test active' : 'Test inactive')
        getTests()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Status could not be changed')
      console.error(error)
    }
  }

  const searchText = search.toLowerCase().trim()
  const filteredTests = tests
    .filter((item) => {
      if ((item.status || 'active') !== statusFilter) {
        return false
      }

      if (!searchText) return true

      return (
        item.name?.toLowerCase().includes(searchText) ||
        item.labId?.name?.toLowerCase().includes(searchText)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'priceLow') {
        return Number(a.price || 0) - Number(b.price || 0)
      }
      if (sortBy === 'priceHigh') {
        return Number(b.price || 0) - Number(a.price || 0)
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })

  return (
    <main className={isHospital ? 'hospital-dash-layout' : 'page-shell'}>
      {isHospital && <HospitalSidebar />}

      <section className={isHospital ? 'hospital-main' : 'page-content-full'}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Lab</p>
          <h1>Tests</h1>
          <p className="muted">Add, show, update and delete lab tests.</p>
        </div>
        <div className="header-actions">
          <button className="add-symbol-btn" onClick={openAddPopup}>+</button>
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
          {!isHospital && <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>}
          <button className="secondary-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search test"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="priceLow">Price low</option>
          <option value="priceHigh">Price high</option>
        </select>
      </div>

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box">
            <div className="popup-head">
              <h2>{editId ? 'Update Test' : 'Add Test'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>x</button>
            </div>

            <form className="login-form" onSubmit={saveTest}>
              <input name="name" placeholder="Test name" value={form.name} onChange={handleChange} />
              <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
              {isHospital && (
                <select name="labId" value={form.labId} onChange={handleChange}>
                  <option value="">Select lab</option>
                  {labs
                    .filter((item) => (item.status || 'active') === 'active')
                    .map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                </select>
              )}
              {editId && (
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
              <button type="submit">{editId ? 'Update' : 'Add'} Test</button>
              <button type="button" className="secondary-btn" onClick={closePopup}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading tests...</h2>
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
                {isHospital && <th>Lab</th>}
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  {isHospital && <td>{item.labId?.name || '-'}</td>}
                  <td>{item.price}</td>
                  <td>
                    <span className={(item.status || 'active') === 'active' ? 'status-active' : 'status-inactive'}>
                      {item.status || 'active'}
                    </span>
                  </td>
                  <td className="department-actions">
                    <button className="link-btn" onClick={() => editTest(item)}>Edit</button>
                    {(item.status || 'active') === 'active' ? (
                      <button className="link-btn" onClick={() => changeStatus(item, 'inactive')}>Inactive</button>
                    ) : (
                      <button className="link-btn" onClick={() => changeStatus(item, 'active')}>Active</button>
                    )}
                    <button className="icon-btn delete-icon" onClick={() => deleteTest(item._id)}>x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredTests.length === 0 && (
        <div className="empty-state">
          <h2>No tests found</h2>
          <p className="muted">No {statusFilter} test found.</p>
        </div>
      )}
      </section>
    </main>
  )
}

export default Test
