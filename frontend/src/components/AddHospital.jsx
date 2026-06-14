import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = `${BASE_URL}/hospitalmanagement`
const CITY_API_URL = `${BASE_URL}/city/getcity`

const emptyForm = {
  name: '',
  email: '',
  address: '',
  pincode: '',
  speciality: '',
  contact: '',
  numberOfDoctors: '',
  numberOfBeds: '',
  openingTime: '',
  closingTime: '',
  rating: '',
  establishedYear: '',
  description: '',
  images: [''],
  emergencyAvailable: false,
  ambulanceService: false,
}

const AddHospital = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [cities, setCities] = useState([])

  useEffect(() => {
    const getCities = async () => {
      try {
        const response = await fetch(CITY_API_URL)
        const data = await response.json()
        setCities(data.cities || [])
      } catch (error) {
        setMessage('City data could not be loaded')
        console.error(error)
      }
    }

    getCities()
  }, [])

  const selectedCity = cities.find((item) => item._id === form.address)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (event, index) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const newImages = [...form.images]
      newImages[index] = reader.result
      setForm({ ...form, images: newImages })
    }
    reader.readAsDataURL(file)
  }

  const addImageInput = () => {
    setForm({ ...form, images: [...form.images, ''] })
  }

  const removeImageInput = (index) => {
    if (form.images.length === 1) {
      setForm({ ...form, images: [''] })
      return
    }

    setForm({ ...form, images: form.images.filter((_, imageIndex) => imageIndex !== index) })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (!form.name || !form.email || !form.address || !form.pincode || !form.speciality || !form.contact) {
      setMessage('Please fill all required fields')
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          images: form.images.filter(Boolean),
          numberOfDoctors: Number(form.numberOfDoctors || 0),
          numberOfBeds: Number(form.numberOfBeds || 0),
          rating: form.rating ? Number(form.rating) : undefined,
          establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
        }),
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Hospital added successfully')
        setForm(emptyForm)
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Hospital could not be added')
      alert('Hospital could not be added')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Hospital</p>
          <h1>Add Hospital</h1>
          <p className="muted">Create a hospital record with contact and facility details.</p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      <form className="hospital-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Hospital name *" value={form.name} onChange={handleChange} />
        <input name="email" type="email" placeholder="Hospital email *" value={form.email} onChange={handleChange} />
        <input name="speciality" placeholder="Speciality *" value={form.speciality} onChange={handleChange} />
        <input name="contact" type="number" placeholder="Contact number *" value={form.contact} onChange={handleChange} />
        <select name="address" value={form.address} onChange={handleChange}>
          <option value="">Select city *</option>
          {cities.map((item) => (
            <option key={item._id} value={item._id}>{item.city}</option>
          ))}
        </select>
        <input value={selectedCity?.district?.district || ''} placeholder="District" readOnly />
        <input value={selectedCity?.state?.state || ''} placeholder="State" readOnly />
        <input name="pincode" placeholder="Pincode *" value={form.pincode} onChange={handleChange} />
        <input name="numberOfDoctors" type="number" min="0" placeholder="Number of doctors" value={form.numberOfDoctors} onChange={handleChange} />
        <input name="numberOfBeds" type="number" min="0" placeholder="Number of beds" value={form.numberOfBeds} onChange={handleChange} />
        <input name="openingTime" type="time" value={form.openingTime} onChange={handleChange} />
        <input name="closingTime" type="time" value={form.closingTime} onChange={handleChange} />
        <input name="rating" type="number" min="1" max="5" placeholder="Rating 1 to 5" value={form.rating} onChange={handleChange} />
        <input name="establishedYear" type="number" min="1900" placeholder="Established year" value={form.establishedYear} onChange={handleChange} />

        <label className="check-field">
          <input name="emergencyAvailable" type="checkbox" checked={form.emergencyAvailable} onChange={handleChange} />
          Emergency available
        </label>
        <label className="check-field">
          <input name="ambulanceService" type="checkbox" checked={form.ambulanceService} onChange={handleChange} />
          Ambulance service
        </label>

        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

        <div className="hospital-image-box">
          <div className="hospital-image-head">
            <span>Hospital images</span>
            <button type="button" className="add-symbol-btn" onClick={addImageInput} title="Add image">+</button>
          </div>

          {form.images.map((image, index) => (
            <div className="hospital-image-row" key={index}>
              <input type="file" accept="image/*" onChange={(event) => handleImageChange(event, index)} />
              <button type="button" className="icon-btn delete-icon" onClick={() => removeImageInput(index)} title="Remove image">-</button>
              {image && <img src={image} alt={`Hospital ${index + 1}`} />}
            </div>
          ))}
        </div>

        <div className="form-actions hospital-actions">
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Hospital'}</button>
          <button type="button" className="secondary-btn" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>

      {message && <p className="message profile-message">{message}</p>}
    </main>
  )
}

export default AddHospital
