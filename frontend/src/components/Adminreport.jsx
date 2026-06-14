import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import AdminSidebar from './AdminSidebar'

const API_URL = `${BASE_URL}`

const Adminreport = () => {
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [cities, setCities] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const getData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const stateResponse = await fetch(`${API_URL}/state/getstate`)
      const districtResponse = await fetch(`${API_URL}/district/getdistrict`)
      const cityResponse = await fetch(`${API_URL}/city/getcity`)
      const hospitalResponse = await fetch(`${API_URL}/hospitalmanagement/get`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const stateData = await stateResponse.json()
      const districtData = await districtResponse.json()
      const cityData = await cityResponse.json()
      const hospitalData = await hospitalResponse.json()

      setStates(stateData.states || [])
      setDistricts(districtData.districts || [])
      setCities(cityData.cities || [])
      setHospitals(hospitalData.hospitals || [])
      setMessage('Admin reports loaded successfully')
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

  const summaryCards = [
    { label: 'States', value: states.length },
    { label: 'Districts', value: districts.length },
    { label: 'Cities', value: cities.length },
    { label: 'Hospitals', value: hospitals.length },
  ]

  const getCity = (item) => item.address?.city || item.cityId?.city || item.city || '-'
  const getDistrict = (item) => item.address?.district?.district || item.districtId?.district || item.district || '-'
  const getState = (item) => item.address?.state?.state || item.stateId?.state || item.state || '-'
  const getPhone = (item) => item.contact || item.phone || '-'

  const searchText = search.toLowerCase().trim()
  const filteredHospitals = hospitals
    .filter((item) => {
      if (!searchText) return true

      const text = [
        item.name,
        item.email,
        getPhone(item),
        getCity(item),
        getDistrict(item),
        getState(item),
      ].join(' ').toLowerCase()

      return text.includes(searchText)
    })
    .sort((a, b) => {
      if (sortBy === 'city') {
        return getCity(a).localeCompare(getCity(b))
      }

      if (sortBy === 'state') {
        return getState(a).localeCompare(getState(b))
      }

      return (a.name || '').localeCompare(b.name || '')
    })

  return (
    <main className="hospital-dash-layout">
      <AdminSidebar />

      <section className="hospital-main report-main-scroll">
        <header className="hospital-topbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Admin Reports</h1>
            <p className="muted">Master data and hospital summary report.</p>
          </div>
          <button className="secondary-btn" onClick={getData}>Refresh</button>
        </header>

        <div className="hospital-toolbar">
          <input
            type="text"
            placeholder="Search hospital, city, district or state"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="name">Hospital name</option>
            <option value="city">City name</option>
            <option value="state">State name</option>
          </select>
        </div>

        <section className="report-page-card">
          <div className="report-head">
            <div>
              <h2>Admin Report</h2>
              <p className="muted">Master data and hospital summary with PDF download.</p>
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
                    <h2>Master Data Summary</h2>
                    <p className="muted">State, district, city, and hospital counts.</p>
                  </div>
                  <button className="download-btn" onClick={() => downloadPdf('Admin Master Data Summary', summaryCards)}>↓</button>
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
                    <p className="eyebrow">Hospitals</p>
                    <h2>Hospital List Report</h2>
                    <p className="muted">Hospitals filtered by search and sort.</p>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => downloadPdf(
                      'Admin Hospital List Report',
                      [{ label: 'Total Hospitals', value: filteredHospitals.length }],
                      filteredHospitals.map((item) => `${item.name || 'Hospital'} | ${item.email || '-'} | ${getPhone(item)} | ${getCity(item)} | ${getDistrict(item)} | ${getState(item)}`)
                    )}
                  >
                    ↓
                  </button>
                </div>

                {filteredHospitals.length === 0 ? (
                  <div className="empty-state">
                    <h2>No hospital found</h2>
                    <p className="muted">No hospital matches your search.</p>
                  </div>
                ) : (
                  <div className="table-wrap report-table-wrap">
                    <table className="report-data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Hospital</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>City</th>
                          <th>District</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHospitals.map((item, index) => (
                          <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td>{item.name || '-'}</td>
                            <td>{item.email || '-'}</td>
                            <td>{getPhone(item)}</td>
                            <td>{getCity(item)}</td>
                            <td>{getDistrict(item)}</td>
                            <td>{getState(item)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default Adminreport
