import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'

const API_URL = `${BASE_URL}`

const District = () => {
  const [districts, setDistricts] = useState([])
  const [states, setStates] = useState([])
  const [form, setForm] = useState({ district: '', state: '' })
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('district')
  const [loading, setLoading] = useState(true)

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
        setLoading(true)
        await getStates()
        await getDistricts()
      } catch (error) {
        setMessage('District data could not be loaded')
        console.error(error)
      } finally {
        setLoading(false)
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

  const searchText = search.toLowerCase().trim()

  const filteredDistricts = districts
    .filter((item) => {
      if (!searchText) {
        return true
      }

      return (
        item.district?.toLowerCase().includes(searchText) ||
        item.state?.state?.toLowerCase().includes(searchText)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'state') {
        return (a.state?.state || '').localeCompare(b.state?.state || '')
      }
      if (sortBy === 'newest') {
        return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
      }

      return (a.district || '').localeCompare(b.district || '')
    })

  return (
    <main className="hospital-dash-layout">
      <AdminSidebar />

      <section className="hospital-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Master</p>
          <h1>District</h1>
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

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search district or state"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="district">District A-Z</option>
          <option value="state">State A-Z</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {!loading && filteredDistricts.length > 0 && (
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
            {filteredDistricts.map((item, index) => (
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
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading districts...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && filteredDistricts.length === 0 && (
        <div className="empty-state">
          <h2>No district found</h2>
          <p className="muted">Add a district or change search text.</p>
        </div>
      )}
      </section>
    </main>
  )
}

export default District
