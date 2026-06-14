import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = `${BASE_URL}/appointment`
const MEDICINE_URL = `${BASE_URL}/medicine`
const TEST_REPORT_URL = `${BASE_URL}/testReport`

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
  const [doctorVisits, setDoctorVisits] = useState([])
  const [medicines, setMedicines] = useState([])
  const [reports, setReports] = useState([])
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

  const getDoctorId = (appointment) => {
    return appointment.doctorId?._id || appointment.doctorId
  }

  const openVisitDates = (appointment) => {
    const doctorId = getDoctorId(appointment)
    const visits = appointments
      .filter((item) => getDoctorId(item) === doctorId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

    setDoctorVisits(visits)
    setSelectedAppointment(null)
    setMedicines([])
    setReports([])
    setShowPopup(true)
  }

  const viewMedicine = async (appointment) => {
    try {
      setSelectedAppointment(appointment)
      setMedicineLoading(true)
      setMedicines([])
      setReports([])

      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`,
      }
      const [medicineResponse, reportResponse] = await Promise.all([
        fetch(`${MEDICINE_URL}/appointment/${appointment._id}`, { headers }),
        fetch(`${TEST_REPORT_URL}/get`, { headers }),
      ])
      const medicineData = await medicineResponse.json()
      const reportData = await reportResponse.json()

      if (medicineResponse.ok) {
        setMedicines(medicineData.medicines || [])
      } else {
        setMessage(medicineData.message)
      }

      if (reportResponse.ok) {
        const appointmentReports = (reportData.reports || []).filter((report) => {
          const reportAppointmentId = report.appointmentId?._id || report.appointmentId
          return reportAppointmentId === appointment._id
        })
        setReports(appointmentReports)
      } else {
        setMessage(reportData.message)
      }
    } catch (error) {
      setMessage('Medicine aur report details load nahi ho payi')
      console.error(error)
    } finally {
      setMedicineLoading(false)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedAppointment(null)
    setDoctorVisits([])
    setMedicines([])
    setReports([])
  }

  const getReportForMedicine = (medicineId) => (
    reports.find((report) => {
      const reportMedicineId = report.medicineId?._id || report.medicineId
      return reportMedicineId === medicineId
    })
  )

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

  const uniqueAppointments = []
  filteredAppointments.forEach((item) => {
    const alreadyAdded = uniqueAppointments.some((appointment) => (
      getDoctorId(appointment) === getDoctorId(item)
    ))

    if (!alreadyAdded) {
      uniqueAppointments.push(item)
    }
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

      {!loading && uniqueAppointments.length === 0 && (
        <div className="empty-state">
          <h2>No appointment found</h2>
          <p className="muted">Book appointment or change search text.</p>
        </div>
      )}

      {!loading && uniqueAppointments.length > 0 && (
        <div className="hospital-grid">
          {uniqueAppointments.map((item) => (
            <article className="hospital-card" key={getDoctorId(item)}>
              <div className="hospital-card-top">
                <div>
                  <span className="status-pill">Booked</span>
                  <h2>Dr. {item.doctorId?.name || 'Doctor'}</h2>
                </div>
              </div>

              <div className="hospital-info-grid">
                <span><b>Hospital</b>{item.hospitalId?.name || '-'}</span>
                <span><b>Specialization</b>{item.doctorId?.specialization || '-'}</span>
                <span><b>Last Visit</b>{getDate(item.date)}</span>
                <span><b>Total Visits</b>{appointments.filter((visit) => getDoctorId(visit) === getDoctorId(item)).length}</span>
                <span><b>Fees</b>Rs. {item.doctorId?.fees || 0}</span>
                <span><b>Contact</b>{item.hospitalId?.contact || '-'}</span>
              </div>

              <button className="view-btn approve-btn" onClick={() => openVisitDates(item)}>
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
                <h2>Visit Dates</h2>
                <p className="muted">
                  Dr. {doctorVisits[0]?.doctorId?.name || 'Doctor'} visits
                </p>
              </div>
              <button className="close-btn" onClick={closePopup} type="button">×</button>
            </div>

            <div className="hospital-grid">
              {doctorVisits.map((visit) => (
                <article className="hospital-card" key={visit._id}>
                  <div className="hospital-info-grid">
                    <span><b>Time</b>{visit.time || '-'}</span>
                    <span><b>Hospital</b>{visit.hospitalId?.name || '-'}</span>
                  </div>
                  <button className="view-btn approve-btn" onClick={() => viewMedicine(visit)}>
                    {getDate(visit.date)}
                  </button>
                </article>
              ))}
            </div>

            {medicineLoading && (
              <div className="empty-state">
                <h2>Loading details...</h2>
                <p className="muted">Please wait.</p>
              </div>
            )}

            {!medicineLoading && selectedAppointment && medicines.length === 0 && reports.length === 0 && (
              <div className="empty-state">
                <h2>No details added</h2>
                <p className="muted">Doctor has not added medicine or report for this visit.</p>
              </div>
            )}

            {!medicineLoading && selectedAppointment && medicines.length > 0 && (
              <div className="hospital-grid">
                {medicines.map((medicine) => {
                  const report = getReportForMedicine(medicine._id)

                  return (
                    <article className="hospital-card" key={medicine._id}>
                      <div className="hospital-card-top">
                        <div>
                          <span className="status-pill">
                            {report ? 'Report Ready' : 'Medicine'}
                          </span>
                          <h2>{medicine.name}</h2>
                        </div>
                      </div>

                      <div className="hospital-info-grid">
                        <span><b>Test</b>{report?.testId?.name || medicine.test?.name || '-'}</span>
                        <span><b>Test Price</b>Rs. {report?.testId?.price || medicine.test?.price || 0}</span>
                        <span><b>Dosage</b>{medicine.dosage || '-'}</span>
                        <span><b>Timing</b>{medicine.timing || '-'}</span>
                        <span><b>Duration</b>{medicine.duration || '-'}</span>
                        <span><b>Quantity</b>{medicine.quantity || 0}</span>
                        <span><b>Price</b>Rs. {medicine.price || 0}</span>
                        <span><b>Total</b>Rs. {medicine.totalPrice || 0}</span>
                      </div>

                      {medicine.description && <p className="hospital-desc">{medicine.description}</p>}
                      {medicine.instructions && <p className="hospital-desc"><b>Instructions: </b>{medicine.instructions}</p>}
                      {report && (
                        <div className="hospital-info-grid">
                          <span><b>Result</b>{report.result || '-'}</span>
                          <span><b>Normal Range</b>{report.normalRange || '-'}</span>
                          <span><b>Remark</b>{report.remark || '-'}</span>
                          <span><b>Report Date</b>{getDate(report.createdAt)}</span>
                        </div>
                      )}
                      {report?.image && (
                        <div className="doctor-image-preview">
                          <img src={report.image} alt="Report" />
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}

            {!medicineLoading && selectedAppointment && medicines.length === 0 && reports.length > 0 && (
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
                      <span><b>Test Price</b>Rs. {report.testId?.price || 0}</span>
                      <span><b>Result</b>{report.result || '-'}</span>
                      <span><b>Normal Range</b>{report.normalRange || '-'}</span>
                      <span><b>Remark</b>{report.remark || '-'}</span>
                      <span><b>Report Date</b>{getDate(report.createdAt)}</span>
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
          </section>
        </div>
      )}
    </main>
  )
}

export default Appointment
