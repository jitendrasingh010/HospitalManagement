import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/hospitalmanagement'

const Showhospital = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [hospitals, setHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const getHospitals = useCallback(async (showAlert = false) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      navigate('/')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setHospitals(data.hospitals || [])
        if (showAlert) {
          alert('Hospital data loaded')
        }
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Hospital data could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    Promise.resolve().then(() => getHospitals())
  }, [getHospitals])

  const searchValue = search.toLowerCase().trim()

  const getAddressText = (address) => {
    if (!address) {
      return ''
    }

    if (typeof address === 'string') {
      return address
    }

    const city = address.city || ''
    const district = address.district?.district || ''
    const state = address.state?.state || ''
    return [city, district, state].filter(Boolean).join(', ')
  }

  const filteredHospitals = hospitals
    .filter((item) => {
      const status = item.status || 'pending'

      if (statusFilter !== 'all' && status !== statusFilter) {
        return false
      }

      if (!searchValue) {
        return true
      }

      const addressText = getAddressText(item.address).toLowerCase()

      return (
        item.name?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.speciality?.toLowerCase().includes(searchValue) ||
        addressText.includes(searchValue) ||
        item.contact?.toLowerCase().includes(searchValue)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'rating') {
        return Number(b.rating || 0) - Number(a.rating || 0)
      }
      if (sortBy === 'beds') {
        return Number(b.numberOfBeds || 0) - Number(a.numberOfBeds || 0)
      }
      return (b.createdAt || b._id || '').localeCompare(a.createdAt || a._id || '')
    })

  const statusCounts = hospitals.reduce((counts, item) => {
    const status = item.status || 'pending'
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, { pending: 0, approved: 0, rejected: 0 })

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/approve/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setHospitals((currentHospitals) => currentHospitals.map((item) => (
          item._id === id ? (data.hospital || { ...item, status: 'approved' }) : item
        )))
        const passwordText = data.password ? `\nPassword: ${data.password}` : ''
        alert('Hospital approved and mail sent')
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Hospital could not be approved')
      alert('Hospital could not be approved')
      console.error(error)
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/reject/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setHospitals((currentHospitals) => currentHospitals.map((item) => (
          item._id === id ? (data.hospital || { ...item, status: 'rejected' }) : item
        )))
        alert('Hospital rejected successfully')
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Hospital could not be rejected')
      alert('Hospital could not be rejected')
      console.error(error)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Show Hospitals</h1>
          <p className="muted">{loading ? 'Loading hospital records...' : `${filteredHospitals.length} hospital records found`}</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search hospital, speciality, address or contact"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="rating">Rating high</option>
          <option value="beds">Beds high</option>
        </select>
        <button className="secondary-btn" onClick={() => getHospitals(true)}>Refresh</button>
      </div>

      <div className="hospital-status-summary">
        <button className={statusFilter === 'all' ? 'hospital-status-box active-filter' : 'hospital-status-box'} onClick={() => setStatusFilter('all')}>
          <span>All</span>
          <strong>{hospitals.length}</strong>
        </button>
        <button className={statusFilter === 'pending' ? 'hospital-status-box pending-box active-filter' : 'hospital-status-box pending-box'} onClick={() => setStatusFilter('pending')}>
          <span>Pending</span>
          <strong>{statusCounts.pending}</strong>
        </button>
        <button className={statusFilter === 'approved' ? 'hospital-status-box approved-box active-filter' : 'hospital-status-box approved-box'} onClick={() => setStatusFilter('approved')}>
          <span>Approved</span>
          <strong>{statusCounts.approved}</strong>
        </button>
        <button className={statusFilter === 'rejected' ? 'hospital-status-box rejected-box active-filter' : 'hospital-status-box rejected-box'} onClick={() => setStatusFilter('rejected')}>
          <span>Rejected</span>
          <strong>{statusCounts.rejected}</strong>
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      {!loading && (
        <div className="hospital-grid">
        {filteredHospitals.map((item) => (
          <article className="hospital-card" key={item._id}>
            {item.images?.length > 0 && (
              <div className="hospital-card-images">
                {item.images.map((image, index) => (
                  <img key={`${item._id}-${index}`} src={image} alt={`${item.name} ${index + 1}`} />
                ))}
              </div>
            )}

            <div className="hospital-card-top">
              <div>
                <span className="status-pill">{item.status || 'pending'}</span>
                <h2>{item.name}</h2>
              </div>
            </div>

            <p className="muted">{getAddressText(item.address)}</p>

            <div className="hospital-info-grid">
              <span><b>Speciality</b>{item.speciality}</span>
              <span><b>Email</b>{item.email}</span>
              <span><b>Contact</b>{item.contact}</span>
              <span><b>City</b>{item.address?.city || '-'}</span>
              <span><b>District</b>{item.address?.district?.district || '-'}</span>
              <span><b>State</b>{item.address?.state?.state || '-'}</span>
              <span><b>Pincode</b>{item.pincode}</span>
              <span><b>Doctors</b>{item.numberOfDoctors || 0}</span>
              <span><b>Beds</b>{item.numberOfBeds || 0}</span>
              <span><b>Rating</b>{item.rating || 'N/A'}</span>
            </div>

            <div className="service-row">
              <span>{item.emergencyAvailable ? 'Emergency Available' : 'No Emergency'}</span>
              <span>{item.ambulanceService ? 'Ambulance Available' : 'No Ambulance'}</span>
            </div>

            <div className="form-actions approve-btn">
              {item.status !== 'approved' && (
                <button className="secondary-btn" onClick={() => handleApprove(item._id)}>
                  Approve
                </button>
              )}
              {item.status !== 'rejected' && (
                <button className="danger-btn" onClick={() => handleReject(item._id)}>
                  Reject
                </button>
              )}
            </div>

            {item.description && <p className="hospital-desc">{item.description}</p>}
          </article>
        ))}
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <h2>Loading hospitals...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && filteredHospitals.length === 0 && (
        <div className="empty-state">
          <h2>No hospitals found</h2>
          <p className="muted">Add a hospital record to see it here.</p>
        </div>
      )}
    </main>
  )
}

export default Showhospital
