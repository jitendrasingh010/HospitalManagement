import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/appointment'
const MEDICINE_URL = 'http://localhost:5000/medicine'

const Appointment = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [appointments, setAppointments] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showPopup, setShowPopup] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [medicineLoading, setMedicineLoading] = useState(false)

  const getAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`${API_URL}/myappointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Appointments load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => getAppointments())
  }, [])

  const getDate = (date) => {
    if (!date) {
      return '-'
    }

    return new Date(date).toLocaleDateString()
  }

  const viewMedicine = async (appointment) => {
    try {
      setSelectedAppointment(appointment)
      setShowPopup(true)
      setMedicineLoading(true)
      setMedicines([])

      const token = localStorage.getItem('token')
      const response = await fetch(`${MEDICINE_URL}/appointment/${appointment._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setMedicines(data.medicines || [])
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Medicine details load nahi ho payi')
      console.error(error)
    } finally {
      setMedicineLoading(false)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedAppointment(null)
    setMedicines([])
  }

  const searchText = search.toLowerCase().trim()

  const filteredAppointments = appointments
    .filter((item) => {
      if (!searchText) {
        return true
      }

      const appointmentText = [
        item.doctorId?.name,
        item.hospitalId?.name,
        item.doctorId?.specialization,
        item.time,
        getDate(item.date),
      ].join(' ').toLowerCase()

      return appointmentText.includes(searchText)
    })
    .sort((a, b) => {
      if (sortBy === 'doctor') {
        return (a.doctorId?.name || '').localeCompare(b.doctorId?.name || '')
      }
      if (sortBy === 'hospital') {
        return (a.hospitalId?.name || '').localeCompare(b.hospitalId?.name || '')
      }
      if (sortBy === 'fees') {
        return Number(b.doctorId?.fees || 0) - Number(a.doctorId?.fees || 0)
      }

      return new Date(b.date || 0) - new Date(a.date || 0)
    })

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>My Appointments</h1>
          <p className="muted">Your booked appointments are shown here.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(-1)}>back</button>
          <button className="secondary-btn" onClick={() => navigate('/')}>Book New</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search doctor, hospital, speciality or date"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="newest">Newest date</option>
          <option value="doctor">Doctor A-Z</option>
          <option value="hospital">Hospital A-Z</option>
          <option value="fees">Fees high</option>
        </select>
      </div>

      {loading && (
        <div className="empty-state">
          <h2>Loading appointments...</h2>
          <p className="muted">Please wait.</p>
        </div>
      )}

      {!loading && filteredAppointments.length === 0 && (
        <div className="empty-state">
          <h2>No appointment found</h2>
          <p className="muted">Book appointment or change search text.</p>
        </div>
      )}

      {!loading && filteredAppointments.length > 0 && (
        <div className="hospital-grid">
          {filteredAppointments.map((item) => (
            <article className="hospital-card" key={item._id}>
              <div className="hospital-card-top">
                <div>
                  <span className="status-pill">Booked</span>
                  <h2>Dr. {item.doctorId?.name || 'Doctor'}</h2>
                </div>
              </div>

              <div className="hospital-info-grid">
                <span><b>Hospital</b>{item.hospitalId?.name || '-'}</span>
                <span><b>Specialization</b>{item.doctorId?.specialization || '-'}</span>
                <span><b>Date</b>{getDate(item.date)}</span>
                <span><b>Time</b>{item.time || '-'}</span>
                <span><b>Fees</b>Rs. {item.doctorId?.fees || 0}</span>
                <span><b>Contact</b>{item.hospitalId?.contact || '-'}</span>
              </div>

              <button className="view-btn approve-btn" onClick={() => viewMedicine(item)}>
                View
              </button>
            </article>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="popup-bg">
          <section className="public-popup">
            <div className="popup-head">
              <div>
                <h2>Medicine Details</h2>
                <p className="muted">Dr. {selectedAppointment?.doctorId?.name || 'Doctor'} prescription</p>
              </div>
              <button className="close-btn" onClick={closePopup} type="button">×</button>
            </div>

            {medicineLoading && (
              <div className="empty-state">
                <h2>Loading medicines...</h2>
                <p className="muted">Please wait.</p>
              </div>
            )}

            {!medicineLoading && medicines.length === 0 && (
              <div className="empty-state">
                <h2>No medicine added</h2>
                <p className="muted">Doctor has not added medicine for this appointment.</p>
              </div>
            )}

            {!medicineLoading && medicines.length > 0 && (
              <div className="hospital-grid">
                {medicines.map((medicine) => (
                  <article className="hospital-card" key={medicine._id}>
                    <div className="hospital-card-top">
                      <div>
                        <span className="status-pill">Medicine</span>
                        <h2>{medicine.name}</h2>
                      </div>
                    </div>

                    <div className="hospital-info-grid">
                      <span><b>Dosage</b>{medicine.dosage || '-'}</span>
                      <span><b>Timing</b>{medicine.timing || '-'}</span>
                      <span><b>Duration</b>{medicine.duration || '-'}</span>
                      <span><b>Quantity</b>{medicine.quantity || 0}</span>
                      <span><b>Price</b>Rs. {medicine.price || 0}</span>
                      <span><b>Total</b>Rs. {medicine.totalPrice || 0}</span>
                    </div>

                    {medicine.description && <p className="hospital-desc">{medicine.description}</p>}
                    {medicine.instructions && <p className="hospital-desc"><b>Instructions: </b>{medicine.instructions}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default Appointment
