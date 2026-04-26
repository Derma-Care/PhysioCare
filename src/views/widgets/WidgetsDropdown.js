import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CCarousel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CCard,
  CCardBody,
  CBadge,
  CFormCheck,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilOptions } from '@coreui/icons'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import axios from 'axios'
import { MainAdmin_URL, AllCustomerAdvertisements } from '../../baseUrl'
import { AppointmentData, bookingUpdate, GetBookingByClinicIdData, GetTodayBooking } from '../AppointmentManagement/appointmentAPI'
import { DoctorData, getDoctorByClinicIdData } from '../Doctors/DoctorAPI'
import { COLORS, FONT_SIZES } from '../../Constant/Themes'
import './Widget.css'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { http } from '../../Utils/Interceptors'
import Pagination from '../../Utils/Pagination'
import { CustomerByClinicNdBranchId } from '../customerManagement/CustomerManagementAPI'
import { Eye, Printer } from 'lucide-react'
import PrintLetterHead from '../../Utils/PrintLetterHead'

const WidgetsDropdown = (props) => {
  const [slides, setSlides] = useState([])
  const sliderRef = useRef(null)
  const currentIndex = useRef(0)
  const intervalRef = useRef(null)
  const [bookings, setBookings] = useState([])
  const [activeCard, setActiveCard] = useState('')
  const [len, setLen] = useState(0)
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0)
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0)
  const [totalPatientsCount, setTotalPatientsCount] = useState(0)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [appointmentError, setAppointmentError] = useState(null)
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [patientError, setPatientError] = useState(null)
  const [doctorError, setDoctorError] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const { searchQuery } = useGlobalSearch()
  const [filteredData, setFilteredData] = useState([])
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [inprogressApt, setInprogressApt] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [statusFilter, setStatusFilter] = useState('')
  const [showAppointments, setShowAppointments] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState(null)
  const [printData, setPrintData] = useState(null)

  const statusLabelMap = {
    'In-Progress': 'Active',
    Completed: 'Completed',
    Pending: 'Pending',
    Rejected: 'Rejected',
    Confirmed: 'Confirmed',
  }

  // Status badge color map aligned with pm-* design language
  const statusColorMap = {
    'In-Progress': { bg: '#e6f1fb', color: '#185fa5', border: '#b5d4f4' },
    Completed:    { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
    Pending:      { bg: '#fff8e1', color: '#92680a', border: '#f0d080' },
    Rejected:     { bg: '#fcebeb', color: '#a32d2d', border: '#f4b5b5' },
    Confirmed:    { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
  }

  const role = localStorage.getItem('role')

  const PrintContent = ({ data }) => {
    if (!data) return null
    return (
      <PrintLetterHead>
        <div style={{ padding: 20, fontFamily: 'Arial' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 10 }}>CONSULTATION RECEIPT</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
            <div><strong>Booking Id:</strong> {data.bookingId || '---'}</div>
            <div><strong>Date:</strong> {data.serviceDate}</div>
          </div>
          <hr />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 14, color: 'black' }}>
            <p style={{ color: 'black' }}><strong>Patient ID:</strong> {data.patientId}</p>
            <p style={{ color: 'black' }}><strong>Name:</strong> {data.name}</p>
            <p style={{ color: 'black' }}><strong>Doctor:</strong> {data.doctorName}</p>
            <p style={{ color: 'black' }}><strong>Time:</strong> {data.slot || data.servicetime}</p>
          </div>
          <hr />
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>1</td>
                <td style={tdStyle}>Consultation Fee</td>
                <td style={tdStyle}>{data.consultationFee ?? 0}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 15, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ border: '1px solid black', padding: '10px 20px', fontWeight: 'bold' }}>
              Total: ₹ {data.consultationFee ?? 0}
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, textAlign: 'center', color: 'gray' }}>
            * This is a computer-generated receipt. No signature required.
          </div>
        </div>
      </PrintLetterHead>
    )
  }

  const navigate = useNavigate()

  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      setFilterTypes([])
    } else {
      setFilterTypes([type])
    }
  }

  const convertToISODate = useCallback((dateString) => {
    if (!dateString) return ''
    let date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString)
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-')
      date = new Date(`${year}-${month}-${day}`)
    } else {
      date = new Date(dateString)
    }
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const normalize = (str) => (str ? str.toString().toLowerCase().trim() : '')
  const todayISO = new Date().toISOString().split('T')[0]

  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get(`${MainAdmin_URL}/${AllCustomerAdvertisements}`)
      if (Array.isArray(response.data)) {
        setSlides(response.data)
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
    }
  }

  const fetchAppointments = useCallback(async (clinicId) => {
    setLoadingAppointments(true)
    setAppointmentError(null)
    try {
      const response = await GetTodayBooking()
      if (response && Array.isArray(response.data)) {
        const allAppointments = response.data
        setTotalAppointmentsCount(allAppointments.length)
        const inprogreeAppointments = allAppointments.filter((item) => item.status === 'in-progress')
        setInprogressApt(inprogreeAppointments)
        setTodayBookings(allAppointments)
      } else {
        setTodayBookings([])
        setAppointmentError('No appointments found.')
      }
    } catch (error) {
      setAppointmentError('No Appointment Found')
      setTodayBookings([])
    } finally {
      setLoadingAppointments(false)
    }
  }, [todayISO, convertToISODate])

  const fetchPatients = useCallback(async (clinicId) => {
    setLoadingPatients(true)
    setPatientError(null)
    try {
      const branchId = localStorage.getItem('branchId')
      const response = await CustomerByClinicNdBranchId(clinicId, branchId)
      const patientArray = response || []
      if (Array.isArray(patientArray)) {
        setTotalPatientsCount(patientArray.length)
        setPatients(patientArray)
      } else {
        setPatientError('No patients found.')
      }
    } catch (error) {
      setPatientError('Failed to fetch patients.')
    } finally {
      setLoadingPatients(false)
    }
  }, [])

  const fetchDoctors = useCallback(async (clinicId) => {
    setLoadingDoctors(true)
    setDoctorError(null)
    try {
      const branchId = localStorage.getItem('branchId')
      const response = await getDoctorByClinicIdData(clinicId, branchId)
      const doctorArray = response?.data || []
      if (Array.isArray(doctorArray)) {
        setTotalDoctorsCount(doctorArray.length)
        setDoctors(doctorArray)
      } else {
        setDoctorError('No doctors found.')
      }
    } catch (error) {
      setDoctorError('Failed to fetch doctors.')
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  useEffect(() => {
    fetchAdvertisements()
  }, [])

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      fetchAppointments(hospitalId)
      fetchDoctors(hospitalId)
      fetchPatients(hospitalId)
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const timeUntilMidnight = tomorrow.getTime() - now.getTime()
      const midnightTimeout = setTimeout(() => {
        fetchAppointments(hospitalId)
        const dailyInterval = setInterval(() => fetchAppointments(hospitalId), 24 * 60 * 60 * 1000)
        return () => clearInterval(dailyInterval)
      }, timeUntilMidnight)
      return () => clearTimeout(midnightTimeout)
    } else {
      setAppointmentError('No appointments found for this Hospital Id')
      setLoadingAppointments(false)
    }
  }, [fetchAppointments, fetchDoctors])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (slides.length === 0 || !sliderRef.current) return
    const handleSlide = () => {
      const currentSlide = slides[currentIndex.current]
      const isVideo = currentSlide.mediaUrlOrImage?.toLowerCase().endsWith('.mp4')
      if (isVideo) {
        const video = document.getElementById(`video-${currentIndex.current}`)
        if (video) {
          video.onended = () => {
            currentIndex.current = (currentIndex.current + 1) % slides.length
            sliderRef.current.slickGoTo(currentIndex.current)
            handleSlide()
          }
        }
      } else {
        intervalRef.current = setTimeout(() => {
          currentIndex.current = (currentIndex.current + 1) % slides.length
          sliderRef.current.slickGoTo(currentIndex.current)
          handleSlide()
        }, 3000)
      }
    }
    handleSlide()
    return () => clearInterval(intervalRef.current)
  }, [slides])

  const consultationTypeMap = {
    'Service & Treatment': 'services & treatments',
    'Tele Consultation': ['tele consultation', 'online consultation'],
    'In-clinic': 'in-clinic consultation',
  }

  const getMediaSrc = (src) => {
    if (!src) return ''
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('blob:')) return src
    if (src.toLowerCase().endsWith('.mp4')) return src
    return `data:image/png;base64,${src}`
  }

  const thStyle = { border: '1px solid black', padding: '8px', textAlign: 'center' }
  const tdStyle = { border: '1px solid black', padding: '8px', textAlign: 'center' }

  const isVideoFile = (src) => {
    if (!src) return false
    const lower = src.toLowerCase()
    return (
      lower.startsWith('data:video') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.includes('video')
    )
  }

  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => {
        window.print()
        setTimeout(() => setPrintData(null), 300)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [printData])

  const handlePrint = (item) => {
    setPrintData(item)
  }

  // ── Filter button styles (matching pm-* aesthetic) ────────────────────────
  const filterBtnBase = {
    fontSize: '12px',
    fontWeight: '500',
    padding: '5px 13px',
    borderRadius: '6px',
    cursor: 'pointer',
    lineHeight: '1.5',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, color 0.15s',
    border: '0.5px solid #d0dce9',
  }

  const filterBtnActive = {
    ...filterBtnBase,
    backgroundColor: '#185fa5',
    color: '#fff',
    border: '0.5px solid #185fa5',
    boxShadow: '0 2px 8px rgba(24,95,165,0.18)',
  }

  const filterBtnInactive = {
    ...filterBtnBase,
    backgroundColor: '#f0f5fb',
    color: '#374151',
  }

  return (
    <>
      {/* ── TODAY'S APPOINTMENTS SECTION ─────────────────────────────────── */}
      <div className="container mt-3">

        {/* ── Page Header (matches pm-page-header) ─────────────────────── */}
        <div className="wd-page-header">
          <div className="wd-page-title-group">
            <div className="wd-page-icon">
              {/* Calendar SVG icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h4 className="wd-page-title">Today's Appointments</h4>
              <p className="wd-page-sub">{todayBookings.length} appointment{todayBookings.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          {/* ── Right side: filter buttons + nav buttons ───────────────── */}
          <div className="wd-header-right">
            {/* Status filter buttons */}
            <button style={statusFilter === '' ? filterBtnActive : filterBtnInactive} onClick={() => setStatusFilter('')}>All</button>
            <button style={statusFilter === 'confirmed' ? filterBtnActive : filterBtnInactive} onClick={() => setStatusFilter('confirmed')}>Confirmed</button>
            <button style={statusFilter === 'pending' ? filterBtnActive : filterBtnInactive} onClick={() => setStatusFilter('pending')}>Pending</button>

            {/* Divider */}
            <div className="wd-divider" />

            {/* Search Patients */}
            <button className="wd-nav-btn" onClick={() => navigate('/Patient-Management')}>
              <span className="wd-count-badge">{totalPatientsCount}</span>
              Search Patients
              <CIcon icon={cilArrowRight} style={{ width: '13px', height: '13px' }} />
            </button>

            {/* Search Doctors */}
            <button className="wd-nav-btn" onClick={() => navigate('/employee-management/doctor')}>
              <span className="wd-count-badge">{totalDoctorsCount}</span>
              Search Doctors
              <CIcon icon={cilArrowRight} style={{ width: '13px', height: '13px' }} />
            </button>
          </div>
        </div>

        {/* ── TABLE (matches pm-table-wrapper / pm-table) ───────────────── */}
        <div className="wd-table-wrapper">
          <CTable className="wd-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="wd-th" style={{ width: 52 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Booking Id</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Patient File ID</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Name</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Doctor Name</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Date</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Time</CTableHeaderCell>
                <CTableHeaderCell className="wd-th">Status</CTableHeaderCell>
                <CTableHeaderCell className="wd-th" style={{ width: 100 }}>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {loadingAppointments ? (
                <CTableRow>
                  <CTableDataCell colSpan="9" className="text-center wd-td" style={{ padding: '32px 0' }}>
                    <LoadingIndicator message="Loading appointments..." />
                  </CTableDataCell>
                </CTableRow>
              ) : appointmentError ? (
                <CTableRow>
                  <CTableDataCell colSpan="9" className="wd-td">
                    <div className="wd-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="wd-empty-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <p>{appointmentError}</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                (() => {
                  // 1. Filter by status
                  const filteredByStatus = todayBookings.filter((item) => {
                    if (!statusFilter) return true
                    return item.status?.toLowerCase() === statusFilter
                  })

                  // 2. Filter by consultation type
                  const filteredByTypes = filteredByStatus.filter((item) => {
                    if (filterTypes.length === 0) return true
                    const itemType = item.consultationType?.toLowerCase().trim()
                    return filterTypes.some((type) => {
                      const mappedValues = consultationTypeMap[type]
                      if (Array.isArray(mappedValues)) {
                        return mappedValues.some((val) => itemType === val.toLowerCase().trim())
                      } else {
                        return itemType === mappedValues.toLowerCase().trim()
                      }
                    })
                  })

                  // 3. Global search filter
                  const finalFilteredData = filteredByTypes.filter((item) => {
                    if (searchQuery.trim().length < 2) return true
                    return Object.values(item).some((val) =>
                      normalize(val).includes(normalize(searchQuery)),
                    )
                  })

                  // 4. No results
                  if (finalFilteredData.length === 0) {
                    return (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="wd-td">
                          <div className="wd-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="wd-empty-icon">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <p>
                              {searchQuery || filterTypes.length > 0
                                ? 'No appointments match your search and filters.'
                                : 'No appointments for today.'}
                            </p>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  }

                  // 5. Render rows
                  return finalFilteredData
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((item, index) => {
                      const statusKey = statusLabelMap[item.status] || item.status
                      const statusStyle = statusColorMap[item.status] || { bg: '#f0f5fb', color: '#374151', border: '#d0dce9' }
                      return (
                        <CTableRow key={`${item.id}-${index}`} className="wd-tr">
                          <CTableDataCell className="wd-td wd-td-num">
                            {(currentPage - 1) * pageSize + index + 1}
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            <span className="wd-booking-id">{item.bookingId || '-'}</span>
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            {item.patientId || '-'}
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            <span className="wd-name">{item.name}</span>
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            {item.doctorName}
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            {item.serviceDate}
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            {item.slot || item.servicetime}
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            <span
                              className="wd-status-badge"
                              style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `0.5px solid ${statusStyle.border}`,
                              }}
                            >
                              {statusKey}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell className="wd-td">
                            <div className="wd-actions">
                              <button
                                className="wd-action-btn view"
                                title="View"
                                onClick={() =>
                                  navigate(`/appointment-details/${item.bookingId}`, {
                                    state: { appointment: item },
                                  })
                                }
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="wd-action-btn print"
                                title="Print"
                                onClick={() => handlePrint(item)}
                              >
                                <Printer size={14} />
                              </button>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })
                })()
              )}
            </CTableBody>
          </CTable>
        </div>
      </div>

      {/* ── ADMIN CARDS ───────────────────────────────────────────────────── */}
      {role?.toLowerCase() === 'admin' && (
        <CRow className={props.className} xs={{ gutter: 4 }} />
      )}

      {/* ── PAGINATION ───────────────────────────────────────────────────── */}
      {todayBookings.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(todayBookings.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {/* ── PRINT AREA ───────────────────────────────────────────────────── */}
      <div
        id="print-area"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: 'white',
          zIndex: 9999,
          display: printData ? 'block' : 'none',
        }}
      >
        {printData && <PrintContent data={printData} />}
      </div>

      {/* ── STYLES ───────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Page Header ─────────────────────────── */
        .wd-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 0.5px solid #d0dce9;
        }
        .wd-page-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wd-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #185fa5;
          flex-shrink: 0;
        }
        .wd-page-title {
          font-size: 17px;
          font-weight: 600;
          color: #0c447c;
          margin: 0;
        }
        .wd-page-sub {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
        }

        /* ── Header right cluster ────────────────── */
        .wd-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .wd-divider {
          width: 1px;
          height: 22px;
          background: #d0dce9;
          margin: 0 4px;
        }

        /* ── Nav buttons (Search Patients / Doctors) ─ */
        .wd-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0f5fb;
          color: #374151;
          border: 0.5px solid #d0dce9;
          border-radius: 6px;
          padding: 5px 13px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }
        .wd-nav-btn:hover { background: #e6f1fb; color: #185fa5; }

        .wd-count-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e6f1fb;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #185fa5;
          font-size: 11px;
          flex-shrink: 0;
        }

        /* ── Table wrapper ───────────────────────── */
        .wd-table-wrapper {
          border: 0.5px solid #d0dce9;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .wd-table { margin-bottom: 0 !important; font-size: 13px; }

        /* ── Table header ────────────────────────── */
        .wd-th {
          background: #185fa5 !important;
          color: #fff !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 11px 14px !important;
          white-space: nowrap;
          border: none !important;
          vertical-align: middle !important;
        }

        /* ── Table rows ──────────────────────────── */
        .wd-tr { transition: background 0.12s; }
        .wd-tr:hover { background: #f0f5fb !important; }
        .wd-td {
          padding: 11px 14px !important;
          vertical-align: middle !important;
          font-size: 13px;
          color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important;
          border-top: none !important;
        }
        .wd-td-num { color: #9ca3af; font-size: 12px; }

        /* ── Booking ID chip ─────────────────────── */
        .wd-booking-id {
          background: #e6f1fb;
          color: #185fa5;
          border: 0.5px solid #b5d4f4;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 9px;
          white-space: nowrap;
        }

        /* ── Patient name ────────────────────────── */
        .wd-name {
          font-weight: 600;
          color: #0c447c;
          font-size: 13px;
        }

        /* ── Status badge ────────────────────────── */
        .wd-status-badge {
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          white-space: nowrap;
          display: inline-block;
        }

        /* ── Action buttons ──────────────────────── */
        .wd-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .wd-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
          flex-shrink: 0;
        }
        .wd-action-btn.view  { background: #e6f1fb; color: #185fa5; }
        .wd-action-btn.print { background: #eaf3de; color: #3b6d11; }
        .wd-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .wd-action-btn:active { transform: scale(0.94); }

        /* ── Empty state ─────────────────────────── */
        .wd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 40px 0;
          color: #9ca3af;
          font-size: 14px;
        }
        .wd-empty-icon { color: #d0dce9; }
      `}</style>
    </>
  )
}

export default WidgetsDropdown