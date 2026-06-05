import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import HospitalSidebar from './HospitalSidebar'

const DEPARTMENT_URL = 'http://localhost:5000/department'
const SUB_DEPARTMENT_URL = 'http://localhost:5000/subdepartment'
const DOCTOR_URL = 'http://localhost:5000/doctor'
const LAB_URL = 'http://localhost:5000/lab'
const TEST_URL = 'http://localhost:5000/test'
const REPORT_URL = 'http://localhost:5000/testReport'
const REPORTS_PER_PAGE = 8

const Report = () => {
  const [departments, setDepartments] = useState([])
  const [subDepartments, setSubDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [labs, setLabs] = useState([])
  const [tests, setTests] = useState([])
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const getToken = () => localStorage.getItem('token')

  const getData = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }

      const departmentResponse = await fetch(`${DEPARTMENT_URL}/get`, { headers })
      const subDepartmentResponse = await fetch(`${SUB_DEPARTMENT_URL}/get`, { headers })
      const doctorResponse = await fetch(`${DOCTOR_URL}/get`, { headers })
      const labResponse = await fetch(`${LAB_URL}/getlab`, { headers })
      const testResponse = await fetch(`${TEST_URL}/gettest`, { headers })
      const reportResponse = await fetch(`${REPORT_URL}/get`, { headers })

      const departmentData = await departmentResponse.json()
      const subDepartmentData = await subDepartmentResponse.json()
      const doctorData = await doctorResponse.json()
      const labData = await labResponse.json()
      const testData = await testResponse.json()
      const reportData = await reportResponse.json()

      if (departmentResponse.ok) setDepartments(departmentData.departments || [])
      if (subDepartmentResponse.ok) setSubDepartments(subDepartmentData.subDepartments || [])
      if (doctorResponse.ok) setDoctors(doctorData.doctors || [])
      if (labResponse.ok) setLabs(labData.labs || [])
      if (testResponse.ok) setTests(testData.tests || [])
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
  }, [search, sortBy, fromDate, toDate])

  const getActiveCount = (list) => {
    return list.filter((item) => (item.status || 'active') === 'active').length
  }

  const getInactiveCount = (list) => {
    return list.filter((item) => item.status === 'inactive').length
  }

  const getDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString()
  }

  const getFilterDate = (date) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  const isDateMatch = (date) => {
    if (!fromDate && !toDate) return true
    if (!date) return false

    const itemDate = getFilterDate(date)

    if (fromDate && itemDate < fromDate) return false
    if (toDate && itemDate > toDate) return false

    return true
  }

  const searchText = search.toLowerCase().trim()
  const filteredReports = reports
    .filter((report) => {
      const reportText = [
        report.testId?.name,
        report.medicineId?.name,
        report.patientId?.name,
        report.doctorId?.name,
        report.result,
        report.remark,
        getDate(report.createdAt),
      ].join(' ').toLowerCase()

      const textMatch = !searchText || reportText.includes(searchText)
      const dateMatch = isDateMatch(report.createdAt)

      return textMatch && dateMatch
    })
    .sort((a, b) => {
      if (sortBy === 'test') {
        return (a.testId?.name || '').localeCompare(b.testId?.name || '')
      }

      if (sortBy === 'patient') {
        return (a.patientId?.name || '').localeCompare(b.patientId?.name || '')
      }

      if (sortBy === 'doctor') {
        return (a.doctorId?.name || '').localeCompare(b.doctorId?.name || '')
      }

      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  const clearFilter = () => {
    setSearch('')
    setSortBy('newest')
    setFromDate('')
    setToDate('')
    setCurrentPage(1)
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

        pdf.setFontSize(10)
        const lines = pdf.splitTextToSize(row, 180)
        pdf.text(lines, 14, y)
        y += lines.length * 7
      })
    }

    const fileName = title.toLowerCase().replaceAll(' ', '-') + '.pdf'
    pdf.save(fileName)
  }

  const setupCards = [
    { label: 'Departments', value: departments.length },
    { label: 'Subdepartments', value: subDepartments.length },
    { label: 'Doctors', value: doctors.length },
    { label: 'Labs', value: labs.length },
    { label: 'Tests', value: tests.length },
    { label: 'Reports', value: filteredReports.length },
  ]

  const labTestCards = [
    { label: 'Labs', value: labs.length },
    { label: 'Active Labs', value: getActiveCount(labs) },
    { label: 'Inactive Labs', value: getInactiveCount(labs) },
    { label: 'Tests', value: tests.length },
    { label: 'Active Tests', value: getActiveCount(tests) },
    { label: 'Inactive Tests', value: getInactiveCount(tests) },
  ]

  const statusCards = [
    { label: 'Active Departments', value: getActiveCount(departments) },
    { label: 'Inactive Departments', value: getInactiveCount(departments) },
    { label: 'Active Doctors', value: getActiveCount(doctors) },
    { label: 'Inactive Doctors', value: getInactiveCount(doctors) },
    { label: 'Active Labs', value: getActiveCount(labs) },
    { label: 'Inactive Labs', value: getInactiveCount(labs) },
  ]

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE)
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE
  const showReports = filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE)

  return (
    <main className="hospital-dash-layout">
      <HospitalSidebar />

      <section className="hospital-main report-main-scroll">
        <header className="hospital-topbar">
          <div>
            <p className="eyebrow">Hospital Workspace</p>
            <h1>Hospital Dashboard</h1>
            <p className="muted">Manage departments, subdepartments, doctors, and daily hospital setup from one focused workspace.</p>
          </div>
          <button className="secondary-btn" onClick={getData}>Refresh</button>
        </header>

        <div className="hospital-toolbar">
          <input
            type="text"
            placeholder="Search reports, patients, doctors, labs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="test">Test name</option>
            <option value="patient">Patient name</option>
            <option value="doctor">Doctor name</option>
          </select>
        </div>

        <section className="report-page-card">
          <div className="report-head">
            <div>
              <h2>Hospital Reports</h2>
              <p className="muted">Section-wise hospital dashboard statistics with PDF download.</p>
            </div>

            <div className="report-date-row">
              <label>
                <span>From</span>
                <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              </label>
              <label>
                <span>To</span>
                <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
              </label>
              <button className="secondary-btn" onClick={clearFilter}>Clear</button>
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
                    <h2>Hospital Setup Report</h2>
                    <p className="muted">Department, doctor, lab, and test setup statistics.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Hospital Setup Report', setupCards)}>↓</button>
                </div>

                <div className="report-stat-grid">
                  {setupCards.map((card) => (
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
                    <p className="eyebrow">Status</p>
                    <h2>Active Inactive Report</h2>
                    <p className="muted">Current active and inactive hospital setup records.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Active Inactive Report', statusCards)}>↓</button>
                </div>

                <div className="report-stat-grid">
                  {statusCards.map((card) => (
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
                    <p className="eyebrow">Labs And Tests</p>
                    <h2>Labs And Tests Report</h2>
                    <p className="muted">Lab and test setup statistics.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Labs And Tests Report', labTestCards)}>↓</button>
                </div>

                <div className="report-stat-grid">
                  {labTestCards.map((card) => (
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
                    <p className="eyebrow">Lab Reports</p>
                    <h2>Patient Test Reports</h2>
                    <p className="muted">Reports filtered by search and selected date.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Patient Test Reports', [
                    { label: 'Total Reports', value: filteredReports.length },
                    { label: 'From Date', value: fromDate || '-' },
                    { label: 'To Date', value: toDate || '-' },
                  ], filteredReports.map((report) => `Date: ${getDate(report.createdAt)} | ${report.testId?.name || 'Test'} | ${report.patientId?.name || 'Patient'} | ${report.result || '-'}`))}>↓</button>
                </div>

                {filteredReports.length === 0 ? (
                  <p className="muted">No report found.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Test</th>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Result</th>
                          <th>Remark</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showReports.map((report) => (
                          <tr key={report._id}>
                            <td>{report.testId?.name || 'Test Report'}</td>
                            <td>{report.patientId?.name || '-'}</td>
                            <td>{report.doctorId?.name || '-'}</td>
                            <td>{report.result || '-'}</td>
                            <td>{report.remark || '-'}</td>
                            <td>{getDate(report.createdAt)}</td>
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

export default Report
