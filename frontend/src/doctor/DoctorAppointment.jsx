import { BASE_URL } from '../config';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MedicationIcon from '@mui/icons-material/Medication'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DoctorSidebar from './DoctorSidebar'

const API_URL = `${BASE_URL}/appointment`
const MEDICINE_URL = `${BASE_URL}/medicine`
const TEST_URL = `${BASE_URL}/test`
const TEST_REPORT_URL = `${BASE_URL}/testReport`
const ITEMS_PER_PAGE = 6

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
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [patientVisits, setPatientVisits] = useState([])
  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm)
  const [tests, setTests] = useState([])
  const [reports, setReports] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [visitPage, setVisitPage] = useState(1)
  const [reportPage, setReportPage] = useState(1)

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

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const getDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getPatientId = (appointment) => {
    return appointment.userId?._id || appointment.userId
  }

  const openVisitDates = (appointment) => {
    const patientId = getPatientId(appointment)
    const visits = appointments
      .filter((item) => getPatientId(item) === patientId)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

    setPatientVisits(visits)
    setSelectedAppointment(null)
    setMedicineForm(emptyMedicineForm)
    setReports([])
    setVisitPage(1)
    setReportPage(1)
    setShowPopup(true)
  }

  const openMedicinePopup = (appointment) => {
    setSelectedAppointment(appointment)
    setMedicineForm(emptyMedicineForm)
    setReports([])
    setReportPage(1)
    getTests()
    getReports(appointment._id)
    setShowPopup(true)
  }

  const closeMedicinePopup = () => {
    setShowPopup(false)
    setSelectedAppointment(null)
    setPatientVisits([])
    setMedicineForm(emptyMedicineForm)
    setReports([])
    setVisitPage(1)
    setReportPage(1)
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

  const uniqueAppointments = []
  filteredAppointments.forEach((item) => {
    const alreadyAdded = uniqueAppointments.some((appointment) => (
      getPatientId(appointment) === getPatientId(item)
    ))

    if (!alreadyAdded) {
      uniqueAppointments.push(item)
    }
  })

  const totalPages = Math.ceil(uniqueAppointments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const showAppointments = uniqueAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const visitPages = Math.ceil(patientVisits.length / ITEMS_PER_PAGE)
  const visitStart = (visitPage - 1) * ITEMS_PER_PAGE
  const showVisits = patientVisits.slice(visitStart, visitStart + ITEMS_PER_PAGE)

  const reportPages = Math.ceil(reports.length / ITEMS_PER_PAGE)
  const reportStart = (reportPage - 1) * ITEMS_PER_PAGE
  const showReports = reports.slice(reportStart, reportStart + ITEMS_PER_PAGE)

  return (
    <main className="hospital-dash-layout">
      <DoctorSidebar />

      <section className="hospital-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor</p>
          <h1>Appointments</h1>
          <p className="muted">Patients who booked appointment with you.</p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="hospital-toolbar">
        <TextField
          fullWidth
          size="small"
          label="Search appointments"
          placeholder="Search patient, phone, email or date"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
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
          <p className="muted">No patient appointment is booked yet.</p>
        </div>
      )}

      {!loading && uniqueAppointments.length > 0 && (
        <>
          <div className="hospital-grid">
            {showAppointments.map((item) => (
              <Card component="article" className="hospital-card" key={getPatientId(item)}>
                <CardContent>
                <div className="hospital-card-top">
                  <div>
                    <Chip
                      color={item.isReached ? 'success' : 'primary'}
                      label={item.isReached ? 'Reached' : 'Booked'}
                      size="small"
                    />
                    <h2>{item.userId?.name || 'Patient'}</h2>
                  </div>
                </div>

                <div className="hospital-info-grid">
                  <span><b>Email</b>{item.userId?.email || '-'}</span>
                  <span><b>Phone</b>{item.userId?.phone || '-'}</span>
                  <span><b>Age</b>{item.userId?.age || '-'}</span>
                  <span><b>Gender</b>{item.userId?.gender || '-'}</span>
                  <span><b>Last Visit</b>{getDate(item.date)}</span>
                  <span><b>Total Visits</b>{appointments.filter((visit) => getPatientId(visit) === getPatientId(item)).length}</span>
                </div>
                <Button
                  className="view-btn approve-btn"
                  onClick={() => openVisitDates(item)}
                  startIcon={<VisibilityIcon />}
                  variant="contained"
                >
                  View
                </Button>
                </CardContent>
              </Card>

            ))}
          </div>

          {totalPages > 0 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {showPopup && (
        <div className="popup-bg">
          <section className="popup-box doctor-popup">
            <div className="popup-head">
              <div>
                <h2>{selectedAppointment ? (selectedAppointment.isReached ? 'Appointment Details' : 'Add Medicine') : 'Visit Dates'}</h2>
                <p className="muted">{patientVisits[0]?.userId?.name || selectedAppointment?.userId?.name || 'Patient'} prescription</p>
              </div>
              <IconButton className="icon-btn delete-icon" onClick={closeMedicinePopup} type="button" aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>

            <div className="hospital-grid">
              {showVisits.map((visit) => (
                <Card component="article" className="hospital-card" key={visit._id}>
                  <CardContent>
                  <div className="hospital-info-grid">
                    <span><b>Time</b>{visit.time || '-'}</span>
                    <span><b>Hospital</b>{visit.hospitalId?.name || '-'}</span>
                    <span><b>Status</b>{visit.isReached ? 'Reached' : 'Booked'}</span>
                  </div>
                  <Button
                    className="view-btn approve-btn"
                    onClick={() => openMedicinePopup(visit)}
                    startIcon={<MedicationIcon />}
                    variant="contained"
                  >
                    {getDate(visit.date)}
                  </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {visitPages > 0 && (
              <div className="pagination">
                <button disabled={visitPage === 1} onClick={() => setVisitPage(visitPage - 1)}>Prev</button>
                <span>Page {visitPage} of {visitPages}</span>
                <button disabled={visitPage === visitPages} onClick={() => setVisitPage(visitPage + 1)}>Next</button>
              </div>
            )}

            {selectedAppointment && !selectedAppointment.isReached && (
              <form className="doctor-form" onSubmit={saveMedicine}>
                <TextField select name="test" label="Select test" value={medicineForm.test} onChange={handleMedicineChange}>
                  <MenuItem value="">Select test</MenuItem>
                  {tests.map((test) => (
                    <MenuItem value={test._id} key={test._id}>
                      {test.name} - Rs. {test.price || 0}
                    </MenuItem>
                  ))}
                  {tests.length === 0 && <MenuItem value="">No test found</MenuItem>}
                </TextField>
                <TextField
                  name="name"
                  label="Medicine name"
                  value={medicineForm.name}
                  onChange={handleMedicineChange}
                />
                <TextField
                  name="dosage"
                  label="Dosage"
                  placeholder="ex: 500mg"
                  value={medicineForm.dosage}
                  onChange={handleMedicineChange}
                />
                <TextField select name="timing" label="Timing" value={medicineForm.timing} onChange={handleMedicineChange}>
                  <MenuItem value="">Select timing</MenuItem>
                  <MenuItem value="Morning">Morning</MenuItem>
                  <MenuItem value="Afternoon">Afternoon</MenuItem>
                  <MenuItem value="Night">Night</MenuItem>
                  <MenuItem value="Morning and Night">Morning and Night</MenuItem>
                  <MenuItem value="After Food">After Food</MenuItem>
                  <MenuItem value="Before Food">Before Food</MenuItem>
                </TextField>
                <TextField
                  name="duration"
                  label="Duration"
                  placeholder="ex: 5 days"
                  value={medicineForm.duration}
                  onChange={handleMedicineChange}
                />
                <TextField
                  name="quantity"
                  type="number"
                  label="Quantity"
                  value={medicineForm.quantity}
                  onChange={handleMedicineChange}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  name="price"
                  type="number"
                  label="Price"
                  value={medicineForm.price}
                  onChange={handleMedicineChange}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  name="description"
                  label="Medicine description"
                  value={medicineForm.description}
                  onChange={handleMedicineChange}
                  multiline
                  minRows={3}
                />
                <TextField
                  name="instructions"
                  label="Extra instructions"
                  value={medicineForm.instructions}
                  onChange={handleMedicineChange}
                  multiline
                  minRows={3}
                />

                <Button type="submit" variant="contained" startIcon={<MedicationIcon />}>Save Medicine</Button>
                <Button type="button" variant="outlined" onClick={closeMedicinePopup}>Cancel</Button>
              </form>
            )}

            {reports.length > 0 && (
              <div className="hospital-grid">
                {showReports.map((report) => (
                  <Card component="article" className="hospital-card" key={report._id}>
                    <CardContent>
                    <div className="hospital-card-top">
                      <div>
                        <Chip color="success" label="Report Ready" size="small" />
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {reportPages > 0 && (
              <div className="pagination">
                <button disabled={reportPage === 1} onClick={() => setReportPage(reportPage - 1)}>Prev</button>
                <span>Page {reportPage} of {reportPages}</span>
                <button disabled={reportPage === reportPages} onClick={() => setReportPage(reportPage + 1)}>Next</button>
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
      </section>
    </main>
  )
}

export default DoctorAppointment
