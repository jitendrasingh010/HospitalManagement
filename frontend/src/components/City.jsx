import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000'

const City = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [cities, setCities] = useState([])
  const [districts, setDistricts] = useState([])
  const [states, setStates] = useState([])
  const [form, setForm] = useState({ city: '', district: '', state: '' })
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')

  const getCities = async () => {
    const response = await fetch(`${API_URL}/city/getcity`)
    const data = await response.json()
    setCities(data.cities || [])
  }

  const getDistricts = async () => {
    const response = await fetch(`${API_URL}/district/getdistrict`)
    const data = await response.json()
    setDistricts(data.districts || [])
  }

  const getStates = async () => {
    const response = await fetch(`${API_URL}/state/getstate`)
    const data = await response.json()
    setStates(data.states || [])
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await getCities()
        await getDistricts()
        await getStates()
      } catch (error) {
        setMessage('City data could not be loaded')
        console.error(error)
      }
    }

    loadData()
  }, [])

  const filteredDistricts = form.state
    ? districts.filter((item) => (item.state?._id || item.state) === form.state)
    : districts

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.city.trim() || !form.district || !form.state) return setMessage('All fields are required')

    try {
      const url = editId ? `${API_URL}/city/updatecity/${editId}` : `${API_URL}/city/addcity`
      const action = editId ? 'updated' : 'added'
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: form.city.trim(), district: form.district, state: form.state }),
      })
      const data = await response.json()

      setMessage(data.message)
      if (response.ok) {
        alert(`City ${action} successfully`)
        setForm({ city: '', district: '', state: '' })
        setEditId(null)
        await getCities()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('City could not be saved')
      alert('City could not be saved')
      console.error(error)
    }
  }

  const handleStateChange = (stateId) => {
    setForm({ ...form, state: stateId, district: '' })
  }

  const handleEdit = (item) => {
    setForm({
      city: item.city,
      district: item.district?._id || item.district,
      state: item.state?._id || item.state,
    })
    setEditId(item._id)
    setMessage('')
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this city?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/city/deletecity/${id}`, { method: 'DELETE' })
      const data = await response.json()
      setMessage(data.message)
      if (response.ok) {
        alert('City deleted successfully')
        await getCities()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('City could not be deleted')
      alert('City could not be deleted')
      console.error(error)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Master</p>
          <h1>City</h1>
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
          placeholder="City name"
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
        />
        <select value={form.state} onChange={(event) => handleStateChange(event.target.value)}>
          <option value="">Select state</option>
          {states.map((item) => (
            <option key={item._id} value={item._id}>{item.state}</option>
          ))}
        </select>
        <select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
          <option value="">Select district</option>
          {filteredDistricts.map((item) => (
            <option key={item._id} value={item._id}>{item.district}</option>
          ))}
        </select>
        <button type="submit">{editId ? 'Update' : 'Add'} City</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>City</th>
              <th>District</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.city}</td>
                <td>{item.district?.district || '-'}</td>
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

export default City
