import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTheme from '../customhook/useTheme'

const API_URL = `${BASE_URL}/hospitalmanagement`
const APPOINTMENT_URL = `${BASE_URL}/appointment`

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

  const openDoctorAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    setAppointmentMessage('')

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to book an appointment')
      navigate('/login')
      return
    }

    setShowAppointment(true)
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

  const getRatingText = (rating) => {
    const ratingValue = Number(rating || 4.5)
    const safeRating = Number.isFinite(ratingValue) ? ratingValue.toFixed(1) : '4.5'
    const starCount = Math.max(1, Math.min(5, Math.round(Number(safeRating))))

    return {
      value: safeRating,
      stars: '★★★★★'.slice(0, starCount),
    }
  }

  const getDepartmentText = (hospital) => {
    const departments = hospital.departments?.map((item) => item.name) || []
    const subDepartmentNames = hospital.subDepartments?.map((item) => item.name) || []
    return [...departments, ...subDepartmentNames].join(' ')
  }

  const getDoctorDepartment = (doctor) => (
    doctor.subDepartmentId?.departmentId?.name || 'Department not assigned'
  )

  const getDoctorSubDepartment = (doctor) => (
    doctor.subDepartmentId?.name || 'Sub department not assigned'
  )

  const getAvailabilityText = (doctor) => {
    const days = doctor.availableDays?.length ? doctor.availableDays.join(', ') : 'Days not set'
    const start = doctor.availableTime?.start
    const end = doctor.availableTime?.end

    if (start && end) {
      return `${days} | ${start} - ${end}`
    }

    return days
  }

  const searchText = search.toLowerCase().trim()
  const hasSearch = searchText.length > 0
  const isLoggedIn = Boolean(localStorage.getItem('token'))
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const dashboardPath = currentUser.role === 'hospital'
    ? '/hospitaldashboard'
    : currentUser.role === 'doctor'
      ? '/doctordashboard'
      : currentUser.role === 'lab'
        ? '/labdashboard'
        : currentUser.role === 'user'
          ? '/userdashboard'
          : '/home'
  const emergencyHospitalCount = hospitals.filter((hospital) => hospital.emergencyAvailable).length

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
      doctor.qualification,
      doctor.phone,
      doctor.hospital?.name,
      doctor.subDepartmentId?.name,
      doctor.subDepartmentId?.departmentId?.name
    ].join(' ').toLowerCase()

    return doctorText.includes(searchText)
  })

  const showHospitalResults = viewMode === 'hospital' || hasSearch
  const showDoctorResults = viewMode === 'doctor' || hasSearch
  const sectionHeading = hasSearch
    ? 'Search Results'
    : viewMode === 'hospital' ? 'Hospitals' : 'Doctors'

  return (
    <main className="public-page">
      <header className="public-header video-header">
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
          {isLoggedIn ? (
            <button className="public-login-btn" onClick={() => navigate(dashboardPath)}>
              Dashboard
            </button>
          ) : (
            <button className="public-login-btn" onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </div>
      </header>

      <section className="public-hero video-hero">
        <video
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          className="hero-bg-video"
          src="https://videos.pexels.com/video-files/5867889/5867889-hd_2048_1080_25fps.mp4"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 1, display: 'block' }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)', zIndex: 1 }}></div>

        <div className="hero-container">
          <div className="public-hero-content">
            <div className="brand-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', fontSize: '13px', fontWeight: '500', marginBottom: '20px', whiteSpace: 'nowrap', width: 'fit-content' }}>
              <span className="brand-badge-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
              24/7 Emergency Support & Care
            </div>
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
        </div>
      </section>

      <section className="public-stats" id="services">
        <div>
          <strong>{hospitals.length || '120+'}</strong>
          <span>Approved Hospitals</span>
        </div>
        <div>
          <strong>{allDoctors.length || '450+'}</strong>
          <span>Expert Doctors</span>
        </div>
        <div>
          <strong>{emergencyHospitalCount || '24'}</strong>
          <span>Emergency Centers</span>
        </div>
        <div>
          <strong>30+</strong>
          <span>Specialized Labs</span>
        </div>
      </section>

      <section className="public-section bg-soft" id="specialities">
        <div className="section-title text-center">
          <div>
            <p className="eyebrow">Top Specialties</p>
            <h2>Find doctors by health concern</h2>
          </div>
        </div>
        <div className="department-grid">
          {[
            { name: 'Cardiology', icon: '❤️' },
            { name: 'Neurology', icon: '🧠' },
            { name: 'Orthopedics', icon: '🦴' },
            { name: 'Pediatrics', icon: '👶' },
            { name: 'Dentistry', icon: '🦷' },
            { name: 'Eye Care', icon: '👁️' },
            { name: 'Dermatology', icon: '✨' },
            { name: 'General Medicine', icon: '🩺' }
          ].map((dept) => (
            <div className="department-card" key={dept.name}>
              <span className="dept-icon">{dept.icon}</span>
              <h3>{dept.name}</h3>
              <p>Specialist Doctors</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-hero lab-promo" style={{ width: '100%', maxWidth: '100%', display: 'block', overflow: 'hidden', margin: '0 0 60px 0', padding: '80px 0' }}>
        <div className="hero-container">
          <div className="public-hero-content">
            <p className="eyebrow">Integrated Diagnostics</p>
            <h2>Book Lab Tests & Access Reports Online</h2>
            <p>
              Get tested at our certified partner labs. Book blood tests, MRI, X-Ray, and view your detailed medical reports directly from your secure dashboard.
            </p>
            <div className="public-hero-actions mt-3">
              <button className="view-btn" onClick={() => navigate('/login')}>Explore Labs</button>
            </div>
          </div>
          <div className="lab-promo-cards">
            <div className="promo-card">
              <span className="promo-badge">Fast</span>
              <b>Blood Test (CBC)</b>
              <small>Reports in 24 hrs</small>
            </div>
            <div className="promo-card">
              <span className="promo-badge">Advanced</span>
              <b>MRI Scan</b>
              <small>High resolution imaging</small>
            </div>
            <div className="promo-card">
              <span className="promo-badge">Routine</span>
              <b>X-Ray & Ultrasound</b>
              <small>Instant digital access</small>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section" id="hospitals">
        <div className="section-title">
          <div>
            <p className="eyebrow">Available Hospitals</p>
            <h2>{sectionHeading}</h2>
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

        {!loading && hasSearch && filteredHospitals.length === 0 && filteredDoctors.length === 0 && (
          <div className="empty-state">
            <h2>No result found</h2>
            <p className="muted">Search text change karke try karein.</p>
          </div>
        )}

        {!loading && !hasSearch && viewMode === 'hospital' && filteredHospitals.length === 0 && (
          <div className="empty-state">
            <h2>No approved hospital found</h2>
            <p className="muted">Admin approve karega tab hospital yaha show hoga.</p>
          </div>
        )}

        {showHospitalResults && filteredHospitals.length > 0 && (
          <div className="public-hospital-grid">
            {filteredHospitals.map((hospital) => {
              const rating = getRatingText(hospital.rating)

              return (
                <article className="public-hospital-card" key={hospital._id}>
                  {getHospitalImage(hospital) ? (
                    <img src={getHospitalImage(hospital)} alt={hospital.name} />
                  ) : (
                    <div className="hospital-image-placeholder">{hospital.name?.charAt(0) || 'H'}</div>
                  )}

                  <div className="public-card-body">
                    <div className="hospital-card-title">
                      <span className="status-pill">Approved</span>
                      <span className="rating-pill">
                        <span>{rating.stars}</span>
                        <b>{rating.value}</b>
                      </span>
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
              )
            })}
          </div>
        )}

        {!loading && !hasSearch && viewMode === 'doctor' && filteredDoctors.length === 0 && (
          <div className="empty-state">
            <h2>No doctor found</h2>
            <p className="muted">Doctor add hoga tab yaha show hoga.</p>
          </div>
        )}

        {showDoctorResults && filteredDoctors.length > 0 && (
          <div className="public-doctor-grid">
            {filteredDoctors.map((doctor) => (
              <article className="public-doctor-card" key={doctor._id}>
                <div className="doctor-card-head">
                  <div className="doctor-avatar large-avatar">
                    {doctor.image ? <img src={doctor.image} alt={doctor.name} /> : doctor.name?.charAt(0)}
                  </div>
                  <div>
                    <span className={doctor.isAvailable ? 'status-pill' : 'status-pill doctor-unavailable'}>
                      {doctor.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <h3>Dr. {doctor.name}</h3>
                    <p>{doctor.hospital?.name || 'Hospital name'}</p>
                  </div>
                </div>

                <div className="doctor-meta-row">
                  <span>{doctor.specialization || 'Specialist'}</span>
                  <span>{doctor.qualification || 'Qualification not added'}</span>
                </div>

                <div className="doctor-card-info">
                  <span><b>{doctor.experience || 0} yrs</b>Experience</span>
                  <span><b>Rs. {doctor.fees || 0}</b>Consultation Fees</span>
                  <span><b>{getDoctorDepartment(doctor)}</b>Department</span>
                  <span><b>{getDoctorSubDepartment(doctor)}</b>Sub Department</span>
                  <span><b>{doctor.phone || '-'}</b>Contact</span>
                  <span><b>{doctor.gender || '-'}{doctor.age ? `, ${doctor.age} yrs` : ''}</b>Profile</span>
                </div>

                <div className="doctor-availability">
                  <b>Availability</b>
                  <span>{getAvailabilityText(doctor)}</span>
                </div>

                {doctor.about && <p className="doctor-card-about">{doctor.about}</p>}

                <div className="doctor-card-actions">
                  <button className="secondary-btn" onClick={() => openDoctor(doctor)}>
                    View Details
                  </button>
                  <button className="view-btn" onClick={() => openDoctorAppointment(doctor)}>
                    Book Appointment
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer" id="contact" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', padding: '60px 20px 40px 20px', borderTop: '1px solid var(--border)', marginTop: '60px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', background: 'linear-gradient(135deg, var(--primary), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>MediCare</h2>
          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0', color: 'var(--muted)' }}>
            Professional healthcare management platform helping you find trusted hospitals, expert doctors, and book online services seamlessly.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '18px', cursor: 'pointer' }}>🌐</span>
            <span style={{ fontSize: '18px', cursor: 'pointer' }}>📘</span>
            <span style={{ fontSize: '18px', cursor: 'pointer' }}>🐦</span>
            <span style={{ fontSize: '18px', cursor: 'pointer' }}>💼</span>
          </div>
        </div>

        <div>
          <b style={{ fontSize: '16px', display: 'block', marginBottom: '16px', color: 'var(--text)' }}>Our Services</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Hospital Directory</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Specialist Doctors</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Online Lab Booking</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>24/7 Ambulance Support</span>
          </div>
        </div>

        <div>
          <b style={{ fontSize: '16px', display: 'block', marginBottom: '16px', color: 'var(--text)' }}>Contact Info</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--muted)' }}>
            <span>📍 123 Health Ave, Medical Zone, New Delhi</span>
            <span>📞 Helpline: +91 98765 43210</span>
            <span>✉️ Email: support@medicare.com</span>
            <span>⏰ Hours: 24/7 Emergency Support</span>
          </div>
        </div>

        <div>
          <b style={{ fontSize: '16px', display: 'block', marginBottom: '16px', color: 'var(--text)' }}>Quick Links</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
            {!isLoggedIn && <button onClick={() => navigate('/login')} style={{ fontSize: '14px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: '700' }}>Login to Dashboard</button>}
            <button onClick={() => navigate('/addhospital')} style={{ fontSize: '14px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: '700' }}>Register Hospital</button>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>Terms of Service</span>
          </div>
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
              <span><b>Qualification</b>{selectedDoctor.qualification || '-'}</span>
              <span><b>Contact</b>{selectedDoctor.phone || '-'}</span>
              <span><b>Gender / Age</b>{selectedDoctor.gender || '-'}{selectedDoctor.age ? `, ${selectedDoctor.age} years` : ''}</span>
              <span><b>Available Time</b>{getAvailabilityText(selectedDoctor)}</span>
            </div>

            {selectedDoctor.about && (
              <div className="doctor-about-box">
                <h3>About Doctor</h3>
                <p>{selectedDoctor.about}</p>
              </div>
            )}

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
