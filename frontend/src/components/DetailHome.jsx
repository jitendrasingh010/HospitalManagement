import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = 'http://localhost:5000/hospitalmanagement'
const APPOINTMENT_URL = 'http://localhost:5000/appointment'

const DetailHome = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [hospitals, setHospitals] = useState([])
  const [allDoctors, setAllDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('hospital')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showAppointment, setShowAppointment] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [doctors, setDoctors] = useState([])
  const [subDepartments, setSubDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [popupLoading, setPopupLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [appointmentMessage, setAppointmentMessage] = useState('')

  useEffect(() => {
    getHospitals()
    getDoctors()
  }, [])

  const getHospitals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/public`)
      const data = await response.json()

      if (response.ok) {
        setHospitals(data.hospitals || [])
      } else {
        setMessage(data.message || 'Hospital data not found')
      }
    } catch (error) {
      setMessage('Backend server start karo, hospital data show ho jayega')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/public-doctors`)
      const data = await response.json()

      if (response.ok) {
        setAllDoctors(data.doctors || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openHospital = async (hospital) => {
    setSelectedHospital(hospital)
    setDoctors([])
    setSubDepartments([])

    try {
      setPopupLoading(true)
      const response = await fetch(`${API_URL}/public/${hospital._id}`)
      const data = await response.json()

      if (response.ok) {
        setSelectedHospital(data.hospital)
        setDoctors(data.doctors || [])
        setSubDepartments(data.subDepartments || [])
      } else {
        setMessage(data.message || 'Hospital details not found')
      }
    } catch (error) {
      setMessage('Details load nahi ho payi')
      console.error(error)
    } finally {
      setPopupLoading(false)
    }
  }

  const closePopup = () => {
    setSelectedHospital(null)
    setSelectedDoctor(null)
    setShowAppointment(false)
    setAppointmentDate('')
    setAppointmentTime('')
    setAppointmentMessage('')
    setDoctors([])
    setSubDepartments([])
  }

  const openDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setShowAppointment(false)
    setAppointmentMessage('')
  }

  const openAppointment = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to book an appointment')
      navigate('/login')
      return
    }
    setShowAppointment(true)
    setAppointmentMessage('')
  }

  const saveAppointment = async (event) => {
    event.preventDefault()

    if (!appointmentDate || !appointmentTime) {
      setAppointmentMessage('Date and time required')
      return
    }

    try {
      const response = await fetch(`${APPOINTMENT_URL}/addappointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          date: appointmentDate,
          time: appointmentTime,
          doctorId: selectedDoctor._id,
          hospitalId: selectedDoctor.hospital?._id
        })
      })

      const data = await response.json()
      setAppointmentMessage(data.message)

      if (response.ok) {
        setAppointmentDate('')
        setAppointmentTime('')
        setShowAppointment(false)
      }
    } catch (error) {
      setAppointmentMessage('Appointment save nahi ho paya')
      console.error(error)
    }
  }

  const getAddressText = (address) => {
    if (!address) {
      return 'Address not available'
    }

    if (typeof address === 'string') {
      return address
    }

    const city = address.city || ''
    const district = address.district?.district || ''
    const state = address.state?.state || ''
    return [city, district, state].filter(Boolean).join(', ')
  }

  const getHospitalImage = (hospital) => {
    if (hospital.images && hospital.images.length > 0) {
      return hospital.images[0]
    }

    return ''
  }

  const getDepartmentText = (hospital) => {
    const departments = hospital.departments?.map((item) => item.name) || []
    const subDepartmentNames = hospital.subDepartments?.map((item) => item.name) || []
    return [...departments, ...subDepartmentNames].join(' ')
  }

  const searchText = search.toLowerCase().trim()

  const filteredHospitals = hospitals.filter((hospital) => {
    if (!searchText) {
      return true
    }

    const hospitalText = [
      hospital.name,
      hospital.speciality,
      getAddressText(hospital.address),
      getDepartmentText(hospital)
    ].join(' ').toLowerCase()

    return hospitalText.includes(searchText)
  })

  const filteredDoctors = allDoctors.filter((doctor) => {
    if (!searchText) {
      return true
    }

    const doctorText = [
      doctor.name,
      doctor.specialization,
      doctor.hospital?.name,
      doctor.subDepartmentId?.name,
      doctor.subDepartmentId?.departmentId?.name
    ].join(' ').toLowerCase()

    return doctorText.includes(searchText)
  })

  return (
    <main className="public-page">
      <header className="public-header">
        <button className="public-logo" onClick={() => navigate('/login')}>
          <span>H</span>
          <b>MediCare</b>
        </button>

        <nav className="public-nav">
          <a href="#hospitals">Hospitals</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="public-actions">
          <button className="theme-btn" onClick={toggleTheme} title="Change theme">
            {theme === 'light' ? '☾' : '☀'}
          </button>
          <button className="public-login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </header>

      <section className="public-hero">
        <div className="public-hero-content">
          <p className="eyebrow">Hospital Management</p>
          <h1>Find trusted hospitals, doctors, and departments in one place.</h1>
          <p>
            Browse approved hospitals, check their facilities, and view available doctors with sub departments.
          </p>
          <div className="public-hero-actions">
            <a className="primary-link" href="#hospitals">View Hospitals</a>
            <button className="ghost-btn" onClick={() => navigate('/addhospital')}>Register Hospital</button>
          </div>
        </div>

        <div className="hero-info-panel">
          <span>24/7</span>
          <b>Emergency Support</b>
          <small>Approved hospitals with ambulance, beds, specialist care and doctor details.</small>
        </div>
      </section>

      <section className="public-stats" id="services">
        <div>
          <strong>{hospitals.length}</strong>
          <span>Approved Hospitals</span>
        </div>
        <div>
          <strong>Easy</strong>
          <span>Doctor View</span>
        </div>
        <div>
          <strong>Fast</strong>
          <span>Department Details</span>
        </div>
      </section>

      <section className="public-section" id="hospitals">
        <div className="section-title">
          <div>
            <p className="eyebrow">Available Hospitals</p>
            <h2>{viewMode === 'hospital' ? 'Hospitals' : 'Doctors'}</h2>
          </div>
          <button className="secondary-btn" onClick={getHospitals}>Refresh</button>
        </div>

        <div className="public-filter-bar">
          <input
            type="text"
            placeholder="Search by department, hospital, doctor or speciality"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="mode-buttons">
            <button
              className={viewMode === 'hospital' ? 'mode-btn active-mode' : 'mode-btn'}
              onClick={() => setViewMode('hospital')}
            >
              By Hospital
            </button>
            <button
              className={viewMode === 'doctor' ? 'mode-btn active-mode' : 'mode-btn'}
              onClick={() => setViewMode('doctor')}
            >
              By Doctor
            </button>
          </div>
        </div>

        {message && <p className="message">{message}</p>}

        {loading && (
          <div className="empty-state">
            <h2>Loading hospitals...</h2>
            <p className="muted">Please wait.</p>
          </div>
        )}

        {!loading && viewMode === 'hospital' && filteredHospitals.length === 0 && (
          <div className="empty-state">
            <h2>No approved hospital found</h2>
            <p className="muted">Admin approve karega tab hospital yaha show hoga.</p>
          </div>
        )}

        {viewMode === 'hospital' && (
          <div className="public-hospital-grid">
          {filteredHospitals.map((hospital) => (
            <article className="public-hospital-card" key={hospital._id}>
              {getHospitalImage(hospital) ? (
                <img src={getHospitalImage(hospital)} alt={hospital.name} />
              ) : (
                <div className="hospital-image-placeholder">{hospital.name?.charAt(0) || 'H'}</div>
              )}

              <div className="public-card-body">
                <div className="hospital-card-title">
                  <span className="status-pill">Approved</span>
                  <span>{hospital.rating || '4.5'} Star</span>
                </div>
                <h3>{hospital.name}</h3>
                <p>{getAddressText(hospital.address)}</p>

                <div className="public-info-row">
                  <span><b>{hospital.numberOfBeds || 0}</b>Beds</span>
                  <span><b>{hospital.numberOfDoctors || 0}</b>Doctors</span>
                  <span><b>{hospital.speciality || 'General'}</b>Speciality</span>
                </div>

                <div className="service-row">
                  <span>{hospital.emergencyAvailable ? 'Emergency' : 'General Care'}</span>
                  <span>{hospital.ambulanceService ? 'Ambulance' : 'OPD'}</span>
                </div>

                <button className="view-btn hospital-view-btn" onClick={() => openHospital(hospital)}>
                  View Hospital
                </button>
              </div>
            </article>
          ))}
          </div>
        )}

        {!loading && viewMode === 'doctor' && filteredDoctors.length === 0 && (
          <div className="empty-state">
            <h2>No doctor found</h2>
            <p className="muted">Doctor add hoga tab yaha show hoga.</p>
          </div>
        )}

        {viewMode === 'doctor' && (
          <div className="public-doctor-grid">
            {filteredDoctors.map((doctor) => (
              <article className="public-doctor-card" key={doctor._id}>
                <div className="doctor-avatar large-avatar">
                  {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : doctor.name?.charAt(0)}
                </div>
                <div>
                  <span className="status-pill">Doctor</span>
                  <h3>Dr. {doctor.name}</h3>
                  <p>{doctor.hospital?.name || 'Hospital name'}</p>
                </div>
                <div className="doctor-card-info">
                  <span><b>{doctor.experience || 0}</b>Experience</span>
                  <span><b>Rs. {doctor.fees || 0}</b>Fees</span>
                  <span><b>{doctor.specialization || '-'}</b>Specialization</span>
                </div>
                <button className="view-btn" onClick={() => openDoctor(doctor)}>
                  View Doctor
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer" id="contact">
        <div>
          <h2>MediCare</h2>
          <p>Professional hospital discovery and management platform.</p>
        </div>
        <div>
          <b>Contact</b>
          <span>support@medicare.com</span>
          <span>+91 98765 43210</span>
        </div>
        <div>
          <b>Quick Links</b>
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/addhospital')}>Register Hospital</button>
        </div>
      </footer>

      {selectedHospital && (
        <div className="popup-bg">
          <section className="public-popup">
            <div className="popup-head">
              <div>
                <p className="eyebrow">Hospital Details</p>
                <h2>{selectedHospital.name}</h2>
              </div>
              <button className="close-btn" onClick={closePopup}>X</button>
            </div>

            <p className="muted">{getAddressText(selectedHospital.address)}</p>

            {popupLoading && <p className="message">Loading details...</p>}

            <div className="popup-summary">
              <span><b>Contact</b>{selectedHospital.contact || '-'}</span>
              <span><b>Email</b>{selectedHospital.email || '-'}</span>
              <span><b>Timing</b>{selectedHospital.openingTime || '--'} - {selectedHospital.closingTime || '--'}</span>
              <span><b>Pincode</b>{selectedHospital.pincode || '-'}</span>
            </div>

            <div className="popup-columns">
              <div>
                <h3>Doctors</h3>
                {doctors.length === 0 && !popupLoading && <p className="muted">No doctor added yet.</p>}
                <div className="doctor-list">
                  {doctors.map((doctor) => (
                    <div className="doctor-item" key={doctor._id}>
                      <div className="doctor-avatar">
                        {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : doctor.name?.charAt(0)}
                      </div>
                      <div>
                        <b>Dr. {doctor.name}</b>
                        <span>{doctor.specialization}</span>
                        <small>{doctor.qualification || 'Qualification'} - {doctor.experience || 0} years</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3>Sub Departments</h3>
                {subDepartments.length === 0 && !popupLoading && <p className="muted">No sub department added yet.</p>}
                <div className="subdept-list">
                  {subDepartments.map((subDepartment) => (
                    <span key={subDepartment._id}>
                      <b>{subDepartment.name}</b>
                      {subDepartment.departmentId?.name || 'Department'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedDoctor && (
        <div className="popup-bg">
          <section className="doctor-detail-popup">
            <div className="popup-head">
              <div>
                <p className="eyebrow">Doctor Details</p>
                <h2>Dr. {selectedDoctor.name}</h2>
              </div>
              <button className="close-btn" onClick={closePopup}>X</button>
            </div>

            <div className="doctor-detail-head">
              <div className="doctor-avatar large-avatar">
                {selectedDoctor.image ? <img src={selectedDoctor.image} alt={selectedDoctor.name} /> : selectedDoctor.name?.charAt(0)}
              </div>
              <div>
                <h3>{selectedDoctor.specialization || 'Specialist'}</h3>
                <p className="muted">{selectedDoctor.hospital?.name || 'Hospital name not available'}</p>
              </div>
            </div>

            <div className="popup-summary doctor-detail-grid">
              <span><b>Doctor Name</b>Dr. {selectedDoctor.name}</span>
              <span><b>Hospital Name</b>{selectedDoctor.hospital?.name || '-'}</span>
              <span><b>Experience</b>{selectedDoctor.experience || 0} years</span>
              <span><b>Fees</b>Rs. {selectedDoctor.fees || 0}</span>
              <span><b>Department</b>{selectedDoctor.subDepartmentId?.departmentId?.name || '-'}</span>
              <span><b>Sub Department</b>{selectedDoctor.subDepartmentId?.name || '-'}</span>
            </div>

            <button className="view-btn appointment-open-btn" onClick={openAppointment}>
              Book Appointment
            </button>

            {appointmentMessage && <p className="message appointment-message">{appointmentMessage}</p>}

            {showAppointment && (
              <form className="appointment-form" onSubmit={saveAppointment}>
                <h3>Book Appointment</h3>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                />
                <input
                  type="time"
                  value={appointmentTime}
                  onChange={(event) => setAppointmentTime(event.target.value)}
                />
                <div className="form-actions">
                  <button type="submit">Save</button>
                  <button type="button" className="secondary-btn" onClick={() => setShowAppointment(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default DetailHome
