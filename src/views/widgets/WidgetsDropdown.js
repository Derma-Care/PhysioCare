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

  // ─── Shared button style (matches Confirmed / Pending tabs) ───────────────
  const filterBtnBase = {
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    lineHeight: '1.5',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    whiteSpace: 'nowrap',
  }

  const filterBtnActive = {
    ...filterBtnBase,
    backgroundColor: 'var(--color-bgcolor)',
    color: '#fff',
    border: '1px solid var(--color-bgcolor)',
  }

  const filterBtnInactive = {
    ...filterBtnBase,
    backgroundColor: '#f0f0f0',
    color: '#555',
  }

  return (
    <>
      {/* ── TODAY'S APPOINTMENTS SECTION ─────────────────────────────────── */}
      <div className="container mt-3">

        {/* ── ROW: Title + Filter tabs + Search Patients / Search Doctors ── */}
        <div
          className="d-flex align-items-center mb-3"
          style={{ gap: '8px', flexWrap: 'wrap' }}
        >
          {/* Title */}
          <h5
            style={{
              color: 'var(--color-bgcolor)',
              fontSize: '14px',      // ← reduced to match doctor app
              fontWeight: '600',
              margin: 0,
              marginRight: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            Today's Appointments
          </h5>

          {/* ── Status filter buttons ─────────────────────────────────────── */}
          <button
            style={statusFilter === '' ? filterBtnActive : filterBtnInactive}
            onClick={() => setStatusFilter('')}
          >
            All
          </button>

          <button
            style={statusFilter === 'confirmed' ? filterBtnActive : filterBtnInactive}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed
          </button>

          <button
            style={statusFilter === 'pending' ? filterBtnActive : filterBtnInactive}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>

          {/* Spacer pushes the next items to the right */}
          <div style={{ flex: 1 }} />

          {/* ── Search Patients button ────────────────────────────────────── */}
          <button
            style={filterBtnInactive}
            onClick={() => navigate('/customer-management')}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#e7f1ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'var(--color-bgcolor)',
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              {totalPatientsCount}
            </span>
            Search Patients
            <CIcon icon={cilArrowRight} style={{ width: '13px', height: '13px' }} />
          </button>

          {/* ── Search Doctors button ─────────────────────────────────────── */}
          <button
            style={filterBtnInactive}
            onClick={() => navigate('/employee-management/doctor')}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#e7f1ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'var(--color-bgcolor)',
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              {totalDoctorsCount}
            </span>
            Search Doctors
            <CIcon icon={cilArrowRight} style={{ width: '13px', height: '13px' }} />
          </button>
        </div>

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        <CTable striped hover responsive style={{ fontSize: '13px' }}>
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>S.No</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Booking Id</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Patient File ID</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Name</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Doctor Name</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Date</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Time</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Status</CTableHeaderCell>
              <CTableHeaderCell style={{ fontSize: '12px', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loadingAppointments ? (
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center" style={{ color: 'var(--color-black)' }}>
                  <LoadingIndicator message="Loading appointments..." />
                </CTableDataCell>
              </CTableRow>
            ) : appointmentError ? (
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center" style={{ color: 'var(--color-black)' }}>
                  {appointmentError}
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
                      <CTableDataCell colSpan="9" className="text-center" style={{ color: 'var(--color-blue)', fontSize: '13px' }}>
                        {searchQuery || filterTypes.length > 0
                          ? 'No appointments match your search and filters.'
                          : 'No appointments for today.'}
                      </CTableDataCell>
                    </CTableRow>
                  )
                }

                // 5. Render rows
                return finalFilteredData
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <CTableRow key={`${item.id}-${index}`} className="pink-table">
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.bookingId || '-'}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.patientId || '-'}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.name}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.doctorName}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.serviceDate}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '12px', verticalAlign: 'middle' }}>
                        {item.slot || item.servicetime}
                      </CTableDataCell>
                      <CTableDataCell style={{ verticalAlign: 'middle' }}>
                        <CBadge
                          style={{
                            backgroundColor: 'var(--color-bgcolor)',
                            color: COLORS.white,
                            fontSize: '11px',
                          }}
                        >
                          {statusLabelMap[item.status] || item.status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell style={{ verticalAlign: 'middle' }}>
                        <div className="d-flex align-items-center gap-2">
                          <CButton
                            className="text-white d-flex align-items-center justify-content-center actionBtn"
                            size="sm"
                            onClick={() =>
                              navigate(`/appointment-details/${item.bookingId}`, {
                                state: { appointment: item },
                              })
                            }
                          >
                            <Eye size={15} />
                          </CButton>
                          <CButton
                            className="text-white d-flex align-items-center justify-content-center actionBtn"
                            size="sm"
                            onClick={() => handlePrint(item)}
                          >
                            <Printer size={15} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
              })()
            )}
          </CTableBody>
        </CTable>
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
    </>
  )
}

export default WidgetsDropdown