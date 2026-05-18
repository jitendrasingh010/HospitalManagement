import { useEffect, useState } from 'react'
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
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('city')
  const [loading, setLoading] = useState(true)

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
        setLoading(true)
        await getCities()
        await getDistricts()
        await getStates()
      } catch (error) {
        setMessage('City data could not be loaded')
        console.error(error)
      } finally {
        setLoading(false)
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

  const searchText = search.toLowerCase().trim()

  const filteredCities = cities
    .filter((item) => {
      if (!searchText) {
        return true
      }

      return (
        item.city?.toLowerCase().includes(searchText) ||
        item.district?.district?.toLowerCase().includes(searchText) ||
        item.state?.state?.toLowerCase().includes(searchText)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'district') {
        return (a.district?.district || '').localeCompare(b.district?.district || '')
      }
      if (sortBy === 'state') {
        return (a.state?.state || '').localeCompare(b.state?.state || '')
      }
      if (sortBy === 'newest') {
        return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
      }

      return (a.city || '').localeCompare(b.city || '')
    })

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

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search city, district or state"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="city">City A-Z</option>
          <option value="district">District A-Z</option>
          <option value="state">State A-Z</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {!loading && filteredCities.length > 0 && (
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
            {filteredCities.map((item, index) => (
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
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading cities...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && filteredCities.length === 0 && (
        <div className="empty-state">
          <h2>No city found</h2>
          <p className="muted">Add a city or change search text.</p>
        </div>
      )}
    </main>
  )
}

export default City
