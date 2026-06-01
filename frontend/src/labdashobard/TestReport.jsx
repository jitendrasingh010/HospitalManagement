import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'
import HospitalSidebar from '../hospitalDashboard/HospitalSidebar'

const API_URL = 'http://localhost:5000/testReport'

const emptyForm = {
  medicineId: '',
  result: '',
  normalRange: '',
  remark: '',
  image: '',
}

const TestReport = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [pendingTests, setPendingTests] = useState([])
  const [reports, setReports] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isHospital = user.role === 'hospital'

  const getToken = () => localStorage.getItem('token')

  const getPendingTests = async () => {
    try {
      const response = await fetch(`${API_URL}/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()

      if (response.ok) {
        setPendingTests(data.pendingTests || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getReports = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setReports(data.reports || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Reports could not be loaded')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPendingTests()
    getReports()
  }, [])

  const handleChange = (event) => {
    if (event.target.name === 'image') {
      const file = event.target.files?.[0]

      if (!file) return

      if (!file.type.startsWith('image/')) {
        setMessage('Please select valid report image')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result })
      }
      reader.readAsDataURL(file)
      return
    }

    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const clearForm = () => {
    setForm(emptyForm)
    setEditId(null)
  }

  const openAddPopup = (item) => {
    setForm({
      ...emptyForm,
      medicineId: item?._id || '',
    })
    setEditId(null)
    setShowPopup(true)
  }

  const openEditPopup = (item) => {
    setForm({
      medicineId: item.medicineId || '',
      result: item.result || '',
      normalRange: item.normalRange || '',
      remark: item.remark || '',
      image: item.image || '',
    })
    setEditId(item._id)
    setShowPopup(true)
  }

  const closePopup = () => {
    clearForm()
    setShowPopup(false)
  }

  const saveReport = async (event) => {
    event.preventDefault()

    if (!editId && !form.medicineId) {
      setMessage('Please select test request')
      return
    }

    if (!form.result) {
      setMessage('Result is required')
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
        body: JSON.stringify(form),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert(editId ? 'Report updated' : 'Report added')
        closePopup()
        getPendingTests()
        getReports()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Report could not be saved')
      console.error(error)
    }
  }

  const deleteReport = async (id) => {
    const confirmDelete = window.confirm('Delete this report?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Report deleted')
        getPendingTests()
        getReports()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Report could not be deleted')
      console.error(error)
    }
  }

  const getDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const searchText = search.toLowerCase().trim()
  const filteredPendingTests = pendingTests
    .filter((item) => {
      if (!searchText) return true

      const pendingText = [
        item.patientId?.name,
        item.patientId?.phone,
        item.test?.name,
        item.test?.labId?.name,
        item.doctorId?.name,
      ].join(' ').toLowerCase()

      return pendingText.includes(searchText)
    })
    .sort((a, b) => {
      if (sortBy === 'patient') {
        return (a.patientId?.name || '').localeCompare(b.patientId?.name || '')
      }

      if (sortBy === 'test') {
        return (a.test?.name || '').localeCompare(b.test?.name || '')
      }

      return 0
    })

  const filteredReports = reports
    .filter((item) => {
      if (!searchText) return true

      const reportText = [
        item.patientId?.name,
        item.patientId?.phone,
        item.testId?.name,
        item.result,
        item.doctorId?.name,
        getDate(item.createdAt),
      ].join(' ').toLowerCase()

      return reportText.includes(searchText)
    })
    .sort((a, b) => {
      if (sortBy === 'patient') {
        return (a.patientId?.name || '').localeCompare(b.patientId?.name || '')
      }

      if (sortBy === 'test') {
        return (a.testId?.name || '').localeCompare(b.testId?.name || '')
      }

      if (sortBy === 'doctor') {
        return (a.doctorId?.name || '').localeCompare(b.doctorId?.name || '')
      }

      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  return (
    <main className={isHospital ? 'hospital-dash-layout' : 'page-shell'}>
      {isHospital && <HospitalSidebar />}

      <section className={isHospital ? 'hospital-main' : 'page-content-full'}>
      <div className="page-header">
        <div>
          <p className="eyebrow">Lab</p>
          <h1>Test Reports</h1>
          <p className="muted">Add patient test result and manage reports.</p>
        </div>
        <div className="header-actions">
          {!isHospital && <button className="secondary-btn" onClick={() => navigate('/labdashboard')}>Back</button>}
          <button className="secondary-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <section className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search patient, test or result"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="patient">Patient name</option>
          <option value="test">Test name</option>
          <option value="doctor">Doctor name</option>
        </select>
      </section>

      <section className="page-header">
        <div>
          <h2>Pending Tests</h2>
          <p className="muted">Tests requested by doctors and waiting for report.</p>
        </div>
      </section>

      {filteredPendingTests.length === 0 && (
        <div className="empty-state">
          <h2>No pending test</h2>
          <p className="muted">All requested tests have report.</p>
        </div>
      )}

      {filteredPendingTests.length > 0 && (
        <div className="hospital-grid">
          {filteredPendingTests.map((item) => (
            <article className="hospital-card" key={item._id}>
              <div className="hospital-card-top">
                <div>
                  <span className="status-pill">Pending</span>
                  <h2>{item.patientId?.name || 'Patient'}</h2>
                </div>
              </div>
              <div className="hospital-info-grid">
                <span><b>Test</b>{item.test?.name || '-'}</span>
                <span><b>Lab</b>{item.test?.labId?.name || '-'}</span>
                <span><b>Doctor</b>{item.doctorId?.name || '-'}</span>
                <span><b>Phone</b>{item.patientId?.phone || '-'}</span>
              </div>
              <button className="view-btn approve-btn" onClick={() => openAddPopup(item)}>
                Add Report
              </button>
            </article>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="popup-bg">
          <div className="popup-box">
            <div className="popup-head">
              <h2>{editId ? 'Update Report' : 'Add Report'}</h2>
              <button className="icon-btn delete-icon" onClick={closePopup}>x</button>
            </div>

            <form className="login-form" onSubmit={saveReport}>
              {!editId && (
                <select name="medicineId" value={form.medicineId} onChange={handleChange}>
                  <option value="">Select test request</option>
                  {pendingTests.map((item) => (
                    <option value={item._id} key={item._id}>
                      {item.patientId?.name || 'Patient'} - {item.test?.name || 'Test'}
                    </option>
                  ))}
                </select>
              )}
              <input
                name="result"
                placeholder="Result"
                value={form.result}
                onChange={handleChange}
              />
              <input
                name="normalRange"
                placeholder="Normal range"
                value={form.normalRange}
                onChange={handleChange}
              />
              <textarea
                name="remark"
                placeholder="Remark"
                value={form.remark}
                onChange={handleChange}
              />
              <label className="doctor-image-field">
                <span>Report image</span>
                <input name="image" type="file" accept="image/*" onChange={handleChange} />
              </label>
              {form.image && (
                <div className="doctor-image-preview">
                  <img src={form.image} alt="Report" />
                </div>
              )}
              <button type="submit">{editId ? 'Update' : 'Add'} Report</button>
              <button type="button" className="secondary-btn" onClick={closePopup}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <section className="page-header">
        <div>
          <h2>Completed Reports</h2>
          <p className="muted">Saved test report records.</p>
        </div>
      </section>

      {loading && (
        <div className="empty-state">
          <h2>Loading reports...</h2>
          <p className="muted">Please wait while records are loading.</p>
        </div>
      )}

      {!loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Test</th>
                <th>Result</th>
                <th>Normal Range</th>
                <th>Image</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((item, index) => (
                <tr key={item._id}>
                  <td>{index + 1}</td>
                  <td>{item.patientId?.name || '-'}</td>
                  <td>{item.testId?.name || '-'}</td>
                  <td>{item.result || '-'}</td>
                  <td>{item.normalRange || '-'}</td>
                  <td>
                    {item.image ? (
                      <div className="doctor-table-image">
                        <img src={item.image} alt="Report" />
                      </div>
                    ) : '-'}
                  </td>
                  <td>{item.doctorId?.name || '-'}</td>
                  <td>{getDate(item.createdAt)}</td>
                  <td className="department-actions">
                    <button className="link-btn" onClick={() => openEditPopup(item)}>Edit</button>
                    <button className="icon-btn delete-icon" onClick={() => deleteReport(item._id)}>x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredReports.length === 0 && (
        <div className="empty-state">
          <h2>No report found</h2>
          <p className="muted">No completed test report found.</p>
        </div>
      )}
      </section>
    </main>
  )
}

export default TestReport
