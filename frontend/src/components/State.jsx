import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/state'

const State = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [states, setStates] = useState([])
  const [state, setState] = useState('')
  const [country] = useState('India')
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')

  const getStates = async () => {
    try {
      const response = await fetch(`${API_URL}/getstate`)
      const data = await response.json()
      setStates(data.states || [])
    } catch (error) {
      setMessage('State data could not be loaded')
      console.error(error)
    }
  }

  useEffect(() => {
    getStates()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!state.trim()) return setMessage('State name is required')

    try {
      const url = editId ? `${API_URL}/updatestate/${editId}` : `${API_URL}/addstate`
      const action = editId ? 'updated' : 'added'
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: state.trim(), country }),
      })
      const data = await response.json()

      setMessage(data.message)
      if (response.ok) {
        alert(`State ${action} successfully`)
        setState('')
        setEditId(null)
        getStates()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('State could not be saved')
      alert('State could not be saved')
      console.error(error)
    }
  }

  const handleEdit = (item) => {
    setState(item.state)
    setEditId(item._id)
    setMessage('')
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this state?')
    if (!confirmDelete) return

    try {
      const response = await fetch(`${API_URL}/deletestate/${id}`, { method: 'DELETE' })
      const data = await response.json()
      setMessage(data.message)
      if (response.ok) {
        alert('State deleted successfully')
        getStates()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('State could not be deleted')
      alert('State could not be deleted')
      console.error(error)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Master</p>
          <h1>State</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      <form className="master-form" onSubmit={handleSubmit}>
        <input type="text" value={country} readOnly />
        <input
          type="text"
          placeholder="State name"
          value={state}
          onChange={(event) => setState(event.target.value)}
        />
        <button type="submit">{editId ? 'Update' : 'Add'} State</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Country</th>
              <th>State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {states.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.country || 'India'}</td>
                <td>{item.state}</td>
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

export default State
