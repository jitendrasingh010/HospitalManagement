import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import DoctorSidebar from './DoctorSidebar'

const APPOINTMENT_URL = 'http://localhost:5000/appointment'
const REPORT_URL = 'http://localhost:5000/testReport'
const REPORTS_PER_PAGE = 8

const DoctorReport = () => {
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const getDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const downloadPdf = (title, cards, rows = []) => {
    const pdf = new jsPDF()
    let y = 18

    pdf.setFontSize(18)
    pdf.text(title, 14, y)
    y += 8

    pdf.setFontSize(10)
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 14, y)
    y += 12

    cards.forEach((card) => {
      pdf.setFontSize(11)
      pdf.text(`${card.label}: ${card.value}`, 14, y)
      y += 8
    })

    if (rows.length > 0) {
      y += 6
      rows.forEach((row) => {
        if (y > 280) {
          pdf.addPage()
          y = 18
        }

        const lines = pdf.splitTextToSize(row, 180)
        pdf.text(lines, 14, y)
        y += lines.length * 7
      })
    }

    const fileName = title.toLowerCase().replaceAll(' ', '-') + '.pdf'
    pdf.save(fileName)
  }

  const getData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const appointmentResponse = await fetch(`${APPOINTMENT_URL}/doctorappointments`, { headers })
      const reportResponse = await fetch(`${REPORT_URL}/get`, { headers })

      const appointmentData = await appointmentResponse.json()
      const reportData = await reportResponse.json()

      if (appointmentResponse.ok) setAppointments(appointmentData.appointments || [])
      if (reportResponse.ok) setReports(reportData.reports || [])

      setMessage('Reports loaded successfully')
    } catch (error) {
      setMessage('Reports load nahi ho payi')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, sortBy])

  const reachedPatients = appointments.filter((item) => item.isReached)
  const pendingPatients = appointments.filter((item) => !item.isReached)
  const searchText = search.toLowerCase().trim()

  const summaryCards = [
    { label: 'Total Appointments', value: appointments.length },
    { label: 'Reached Patients', value: reachedPatients.length },
    { label: 'Pending Patients', value: pendingPatients.length },
    { label: 'Test Reports', value: reports.length },
  ]

  const filteredReports = reports
    .filter((item) => {
      if (!searchText) return true

      const reportText = [
        item.patientId?.name,
        item.testId?.name,
        item.result,
        item.remark,
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

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE)
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE
  const showReports = filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE)

  return (
    <main className="hospital-dash-layout">
      <DoctorSidebar />

      <section className="hospital-main report-main-scroll">
        <header className="hospital-topbar">
          <div>
            <p className="eyebrow">Doctor</p>
            <h1>Doctor Reports</h1>
            <p className="muted">Appointment and patient test report summary.</p>
          </div>
          <button className="secondary-btn" onClick={getData}>Refresh</button>
        </header>

        <div className="hospital-toolbar">
          <input
            type="text"
            placeholder="Search patient, test, result"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="patient">Patient name</option>
            <option value="test">Test name</option>
          </select>
        </div>

        <section className="report-page-card">
          <div className="report-head">
            <div>
              <h2>Doctor Report</h2>
              <p className="muted">Appointment and patient test report details with PDF download.</p>
            </div>
          </div>

          {message && <p className="message">{message}</p>}

          {loading && (
            <div className="empty-state">
              <h2>Loading reports...</h2>
              <p className="muted">Please wait.</p>
            </div>
          )}

          {!loading && (
            <>
              <article className="report-box">
                <div className="report-box-head">
                  <div>
                    <p className="eyebrow">Overview</p>
                    <h2>Appointment Summary</h2>
                    <p className="muted">Patient visit and test report count.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Doctor Appointment Summary', summaryCards)}>↓</button>
                </div>

                <div className="report-stat-grid">
                  {summaryCards.map((card) => (
                    <div className="report-stat-card" key={card.label}>
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="report-box">
                <div className="report-box-head">
                  <div>
                    <p className="eyebrow">Reports</p>
                    <h2>Patient Test Reports</h2>
                    <p className="muted">Reports filtered by search and sort.</p>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => downloadPdf(
                      'Doctor Patient Test Reports',
                      [{ label: 'Total Reports', value: filteredReports.length }],
                      filteredReports.map((item) => `${item.patientId?.name || 'Patient'} | ${item.testId?.name || 'Test'} | ${item.result || '-'} | ${item.remark || '-'} | ${getDate(item.createdAt)}`)
                    )}
                  >
                    ↓
                  </button>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="empty-state">
                    <h2>No report found</h2>
                    <p className="muted">No patient test report found.</p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Patient</th>
                          <th>Test</th>
                          <th>Result</th>
                          <th>Remark</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showReports.map((item, index) => (
                          <tr key={item._id}>
                            <td>{startIndex + index + 1}</td>
                            <td>{item.patientId?.name || '-'}</td>
                            <td>{item.testId?.name || '-'}</td>
                            <td>{item.result || '-'}</td>
                            <td>{item.remark || '-'}</td>
                            <td>{getDate(item.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {totalPages > 0 && (
                  <div className="pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                  </div>
                )}
              </article>
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default DoctorReport
