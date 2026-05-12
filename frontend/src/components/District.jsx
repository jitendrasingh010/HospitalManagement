import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000'

const District = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [districts, setDistricts] = useState([])
  const [states, setStates] = useState([])
  const [form, setForm] = useState({ district: '', state: '' })
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')

  const getStates = async () => {
    const response = await fetch(`${API_URL}/state/getstate`)
    const data = await response.json()
    setStates(data.states || [])
  }

  const getDistricts = async () => {
    const response = await fetch(`${API_URL}/district/getdistrict`)
    const data = await response.json()
    setDistricts(data.districts || [])
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await getStates()
        await getDistricts()
      } catch (error) {
        setMessage('District data could not be loaded')
        console.error(error)
      }
    }

    loadData()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.district.trim() || !form.state) return setMessage('All fields are required')

    try {
      const url = editId ? `${API_URL}/district/updatedistrict/${editId}` : `${API_URL}/district/adddistrict`
      const action = editId ? 'updated' : 'added'
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: form.district.trim(), state: form.state }),
      })
      const data = await response.json()

      setMessage(data.message)
      if (response.ok) {
        alert(`District ${action} successfully`)
        setForm({ district: '', state: '' })
        setEditId(null)
        await getDistricts()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('District could not be saved')
      alert('District could not be saved')
      console.error(error)
    }
  }

  const handleEdit = (item) => {
    setForm({ district: item.district, state: item.state?._id || item.state })
    setEditId(item._id)
    setMessage('')
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this district?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/district/deletedistrict/${id}`, { method: 'DELETE' })
      const data = await response.json()
      setMessage(data.message)
      if (response.ok) {
        alert('District deleted successfully')
        await getDistricts()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('District could not be deleted')
      alert('District could not be deleted')
      console.error(error)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Master</p>
          <h1>District</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      <form className="master-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="District name"
          value={form.district}
          onChange={(event) => setForm({ ...form, district: event.target.value })}
        />
        <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
          <option value="">Select state</option>
          {states.map((item) => (
            <option key={item._id} value={item._id}>{item.state}</option>
          ))}
        </select>
        <button type="submit">{editId ? 'Update' : 'Add'} District</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>District</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.district}</td>
                <td>{item.state?.state || '-'}</td>
                <td>
                  <button className="icon-btn edit-icon" onClick={() => handleEdit(item)} title="Edit">✎</button>
                  <button className="icon-btn delete-icon" onClick={() => handleDelete(item._id)} title="Delete">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default District
