import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/appointment'
const MEDICINE_URL = 'http://localhost:5000/medicine'
const TEST_URL = 'http://localhost:5000/test'
const TEST_REPORT_URL = 'http://localhost:5000/testReport'

const emptyMedicineForm = {
  test: '',
  name: '',
  description: '',
  dosage: '',
  timing: '',
  duration: '',
  quantity: 1,
  price: 0,
  instructions: '',
}

const DoctorAppointment = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm)
  const [tests, setTests] = useState([])
  const [reports, setReports] = useState([])

  const getAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/doctorappointments`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const getTests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${TEST_URL}/gettest`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        setTests(data.tests || [])
      } else {
        setTests([])
      }
    } catch (error) {
      setTests([])
      console.error(error)
    }
  }

  const getReports = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${TEST_REPORT_URL}/get`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      if (response.ok) {
        const appointmentReports = (data.reports || []).filter((report) => {
          const reportAppointmentId = report.appointmentId?._id || report.appointmentId
          return reportAppointmentId === appointmentId
        })
        setReports(appointmentReports)
      } else {
        setReports([])
      }
    } catch (error) {
      setReports([])
      console.error(error)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => getAppointments())
  }, [])

  const getDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const openMedicinePopup = (appointment) => {
    setSelectedAppointment(appointment)
    setMedicineForm(emptyMedicineForm)
    setReports([])
    getTests()
    getReports(appointment._id)
    setShowPopup(true)
  }

  const closeMedicinePopup = () => {
    setShowPopup(false)
    setSelectedAppointment(null)
    setMedicineForm(emptyMedicineForm)
    setReports([])
  }

  const handleMedicineChange = (event) => {
    setMedicineForm({ ...medicineForm, [event.target.name]: event.target.value })
  }

  const saveMedicine = async (event) => {
    event.preventDefault()

    if (!selectedAppointment) {
      setMessage('Appointment select nahi hai')
      return
    }

    if (selectedAppointment.isReached) {
      setMessage('This appointment is already reached')
      return
    }

    if (!medicineForm.test || !medicineForm.name || !medicineForm.dosage || !medicineForm.timing || !medicineForm.duration) {
      setMessage('Test, medicine name, dosage, timing and duration required hai')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${MEDICINE_URL}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...medicineForm,
          appointmentId: selectedAppointment._id,
          patientId: selectedAppointment.userId?._id,
          doctorId: selectedAppointment.doctorId?._id,
          hospitalId: selectedAppointment.hospitalId?._id,
        }),
      })
      const data = await response.json()
      setMessage(data.message)

      if (response.ok) {
        alert('Medicine added successfully')
        closeMedicinePopup()
        getAppointments()
      } else {
        alert(data.message)
      }
    } catch (error) {
      setMessage('Medicine save nahi ho payi')
      console.error(error)
    }
  }

  const searchText = search.toLowerCase().trim()
  const filteredAppointments = appointments.filter((item) => {
    if (!searchText) return true

    const appointmentText = [
      item.userId?.name,
      item.userId?.email,
      item.userId?.phone,
      item.hospitalId?.name,
      item.time,
      getDate(item.date),
    ].join(' ').toLowerCase()

    return appointmentText.includes(searchText)
  })

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Appointments</h1>
          <p className="muted">Patients who booked appointment with you.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate('/doctordashboard')}>Back</button>
          <button className="secondary-btn" onClick={() => navigate('/doctorprofile')}>Profile</button>
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <input
          type="text"
          placeholder="Search patient, phone, email or date"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
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
          <p className="muted">No patient appointment is booked yet.</p>
        </div>
      )}

      {!loading && filteredAppointments.length > 0 && (
        <div className="hospital-grid">
          {filteredAppointments.map((item) => (
            <article className="hospital-card" key={item._id}>
              <div className="hospital-card-top">
                <div>
                  <span className="status-pill">{item.isReached ? 'Reached' : 'Booked'}</span>
                  <h2>{item.userId?.name || 'Patient'}</h2>
                </div>
              </div>

              <div className="hospital-info-grid">
                <span><b>Email</b>{item.userId?.email || '-'}</span>
                <span><b>Phone</b>{item.userId?.phone || '-'}</span>
                <span><b>Age</b>{item.userId?.age || '-'}</span>
                <span><b>Gender</b>{item.userId?.gender || '-'}</span>
                <span><b>Date</b>{getDate(item.date)}</span>
                <span><b>Time</b>{item.time || '-'}</span>
              </div>
              <button className="view-btn approve-btn" onClick={() => openMedicinePopup(item)}>
                {item.isReached ? 'View Details' : 'Is Reached'}
              </button>
            </article>

          ))}
        </div>
      )}

      {showPopup && (
        <div className="popup-bg">
          <section className="popup-box doctor-popup">
            <div className="popup-head">
              <div>
                <h2>{selectedAppointment?.isReached ? 'Appointment Details' : 'Add Medicine'}</h2>
                <p className="muted">{selectedAppointment?.userId?.name || 'Patient'} prescription</p>
              </div>
              <button className="icon-btn delete-icon" onClick={closeMedicinePopup} type="button">×</button>
            </div>

            {!selectedAppointment?.isReached && (
              <form className="doctor-form" onSubmit={saveMedicine}>
                <select name="test" value={medicineForm.test} onChange={handleMedicineChange}>
                  <option value="">Select test</option>
                  {tests.map((test) => (
                    <option value={test._id} key={test._id}>
                      {test.name} - Rs. {test.price || 0}
                    </option>
                  ))}
                  {tests.length === 0 && <option value="">No test found</option>}
                </select>
                <input
                  name="name"
                  type="text"
                  placeholder="Medicine name"
                  value={medicineForm.name}
                  onChange={handleMedicineChange}
                />
                <input
                  name="dosage"
                  type="text"
                  placeholder="Dosage ex: 500mg"
                  value={medicineForm.dosage}
                  onChange={handleMedicineChange}
                />
                <select name="timing" value={medicineForm.timing} onChange={handleMedicineChange}>
                  <option value="">Select timing</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                  <option value="Morning and Night">Morning and Night</option>
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                </select>
                <input
                  name="duration"
                  type="text"
                  placeholder="Duration ex: 5 days"
                  value={medicineForm.duration}
                  onChange={handleMedicineChange}
                />
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={medicineForm.quantity}
                  onChange={handleMedicineChange}
                />
                <input
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Price"
                  value={medicineForm.price}
                  onChange={handleMedicineChange}
                />
                <textarea
                  name="description"
                  placeholder="Medicine description"
                  value={medicineForm.description}
                  onChange={handleMedicineChange}
                />
                <textarea
                  name="instructions"
                  placeholder="Extra instructions"
                  value={medicineForm.instructions}
                  onChange={handleMedicineChange}
                />

                <button type="submit">Save Medicine</button>
                <button type="button" className="secondary-btn" onClick={closeMedicinePopup}>Cancel</button>
              </form>
            )}

            {reports.length > 0 && (
              <div className="hospital-grid">
                {reports.map((report) => (
                  <article className="hospital-card" key={report._id}>
                    <div className="hospital-card-top">
                      <div>
                        <span className="status-pill">Report Ready</span>
                        <h2>{report.testId?.name || 'Test Report'}</h2>
                      </div>
                    </div>
                    <div className="hospital-info-grid">
                      <span><b>Price</b>Rs. {report.testId?.price || 0}</span>
                      <span><b>Result</b>{report.result || '-'}</span>
                      <span><b>Normal Range</b>{report.normalRange || '-'}</span>
                      <span><b>Remark</b>{report.remark || '-'}</span>
                      <span><b>Date</b>{getDate(report.createdAt)}</span>
                    </div>
                    {report.image && (
                      <div className="doctor-image-preview">
                        <img src={report.image} alt="Report" />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {selectedAppointment?.isReached && reports.length === 0 && (
              <div className="empty-state">
                <h2>No report found</h2>
                <p className="muted">Lab has not added report yet.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default DoctorAppointment
