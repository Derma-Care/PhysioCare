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
// import { appointments_Ref } from '../../baseUrl'
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
  const [activeCard, setActiveCard] = useState('') // state to keep track of which card is clicked eg:"appointments"
  const [len, setLen] = useState(0)
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0) // NEW: State to hold total appointments count
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0) // NEW: State to hold total appointments count
  const [totalPatientsCount, setTotalPatientsCount] = useState(0) // NEW: State to hold total appointments count
  const [loadingAppointments, setLoadingAppointments] = useState(true) // New state for loading indicator
  const [appointmentError, setAppointmentError] = useState(null) // New state for appointment fetch error
  const [loadingPatients, setLoadingPatients] = useState(true) // New state for loading indicator
  const [loadingDoctors, setLoadingDoctors] = useState(true) // New state for loading indicator
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
  const [statusFilter, setStatusFilter] = useState('');
  const [showAppointments, setShowAppointments] = useState(false)
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [printData, setPrintData] = useState(null)
  const statusLabelMap = {
    'In-Progress': 'Active',
    Completed: 'Completed',
    Pending: 'Pending',
    Rejected: 'Rejected',
    Confirmed: 'Confirmed',
  }
  const handleStatusChange = (e) => {
    const value = e.target.value

    if (statusFilters.includes(value)) {
      setStatusFilters([]) // Deselect if the same one is clicked
    } else {
      setStatusFilters([value]) // Allow only one selection
    }
  }
  const role = localStorage.getItem('role')
  const PrintContent = ({ data }) => {
    if (!data) return null

    return (
      <PrintLetterHead>
        <div style={{ padding: 20, fontFamily: 'Arial' }}>

          {/* TITLE */}
          <h2 style={{ textAlign: 'center', marginBottom: 10 }}>
            CONSULTATION RECEIPT
          </h2>

          {/* RECEIPT META */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 14,
            marginBottom: 10
          }}>
            <div><strong>Booking Id:</strong> {data.bookingId || '---'}</div>
            <div><strong>Date:</strong> {data.serviceDate}</div>
          </div>

          <hr />

          {/* PATIENT DETAILS */}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: 14, color: "black" }}  >
            <p style={{ color: "black" }}><strong>Patient ID:</strong> {data.patientId}</p>
            <p style={{ color: "black" }}><strong>Name:</strong> {data.name}</p>
            <p style={{ color: "black" }}><strong>Doctor:</strong> {data.doctorName}</p>
            <p style={{ color: "black" }}><strong>Time:</strong> {data.slot || data.servicetime}</p>
          </div>

          <hr />

          {/* BILL TABLE */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 10
          }}>
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

          {/* TOTAL */}
          <div style={{
            marginTop: 15,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <div style={{
              border: '1px solid black',
              padding: '10px 20px',
              fontWeight: 'bold'
            }}>
              Total: ₹ {data.consultationFee ?? 0}
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div style={{
            marginTop: 20,
            fontSize: 12,
            textAlign: 'center',
            color: 'gray'
          }}>
            * This is a computer-generated receipt. No signature required.
          </div>

        </div>
      </PrintLetterHead>
    )
  }
  const navigate = useNavigate()
  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }
  const convertToISODate = useCallback((dateString) => {
    if (!dateString) return ''

    let date
    // Check if dateString is already in YYYY-MM-DD format (preferred)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString)
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      // dd-MM-yyyy format
      const [day, month, year] = dateString.split('-')
      date = new Date(`${year}-${month}-${day}`)
    } else {
      // Attempt to parse other formats, though YYYY-MM-DD or dd-MM-yyyy are safer
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      // Use getTime() for robust NaN check
      // console.warn('Invalid date string for conversion:', dateString)
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }, [])

  const normalize = (str) => (str ? str.toString().toLowerCase().trim() : '')

  // Get today's date in YYYY-MM-DD format, using a consistent method
  const todayISO = new Date().toISOString().split('T')[0]

  // Fetch Advertisements (unchanged)
  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get(`${MainAdmin_URL}/${AllCustomerAdvertisements}`) //TODO:chnage when apigetway call axios to http
      console.log('✅ Advertisements Response:', response.data)
      if (Array.isArray(response.data)) {
        setSlides(response.data)
      } else {
        console.error('No advertisements found:', response.data)
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
    }
  }

  // Use useCallback for fetchAppointments to stabilize the function reference
  const fetchAppointments = useCallback(
    async (clinicId) => {
      setLoadingAppointments(true)
      setAppointmentError(null)

      try {
        const response = await GetTodayBooking()
        console.log('Raw Appointments Data:', response)

        if (response && Array.isArray(response.data)) {
          const allAppointments = response.data
          setTotalAppointmentsCount(allAppointments.length)

          const inprogreeAppointments = allAppointments.filter((item) => {
            const itemDate = item.status
            return itemDate === 'in-progress'
          })
          const filteredAppointments = allAppointments;
          setInprogressApt(inprogreeAppointments)
          setTodayBookings(filteredAppointments)
        } else {
          setTodayBookings([])
          setAppointmentError('No  appointments found.')
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
        setAppointmentError('No Appointment Found')
        setTodayBookings([])
      } finally {
        setLoadingAppointments(false)
      }
    },
    [todayISO, convertToISODate],
  )
  const fetchPatients = useCallback(async (clinicId) => {
    setLoadingPatients(true)
    setPatientError(null)
    try {
      const branchId = localStorage.getItem('branchId')
      // The response here is ALREADY the array of patients, 
      // as determined by the CustomerByClinicNdBranchId function.
      const response = await CustomerByClinicNdBranchId(clinicId, branchId)
      console.log('Raw Patients Data:', response)

      //  Access the response directly, not response?.data
      const patientArray = response || []

      if (Array.isArray(patientArray)) {
        // Use setTotalPatientsCount, not setTotalDoctorsCount
        setTotalPatientsCount(patientArray.length)
        setPatients(patientArray)
      } else {
        console.error('Invalid patients response format:', response)
        //Use setPatientError, not setDoctorError
        setPatientError('No patients found.')
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      //  Use setPatientError, not setDoctorError
      setPatientError('Failed to fetch patients.')
    } finally {
      setLoadingPatients(false)
    }
  }, [])

  const updatePaymentStatus = async (bookingId, paymentType) => {
    try {
      await bookingUpdate({ bookingId, paymentType }) // Assuming bookingUpdate accepts an object with these properties


      // ✅ update UI locally (no reload)
      setTodayBookings((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId
            ? { ...item, paymentType }
            : item
        )
      );
    } catch (err) {
      console.error("Payment update failed", err);
    }
  };

  const fetchDoctors = useCallback(async (clinicId) => {
    setLoadingDoctors(true)
    setDoctorError(null)
    try {
      const branchId = localStorage.getItem('branchId')
      const response = await getDoctorByClinicIdData(clinicId, branchId)
      console.log('Raw Doctors Data:', response)

      // ✅ Access the inner data array
      const doctorArray = response?.data || []

      if (Array.isArray(doctorArray)) {
        setTotalDoctorsCount(doctorArray.length)
        setDoctors(doctorArray)
      } else {
        console.error('Invalid doctors response format:', response)
        setDoctorError('No doctors found.')
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
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
    console.log(hospitalId)
    if (hospitalId) {
      fetchAppointments(hospitalId)
      fetchDoctors(hospitalId)
      fetchPatients(hospitalId)
      // Set up daily refresh:
      // 1. Calculate time until next midnight
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Set to midnight of the next day

      const timeUntilMidnight = tomorrow.getTime() - now.getTime()

      // 2. Set a timeout to refresh exactly at midnight
      const midnightTimeout = setTimeout(() => {
        fetchAppointments(hospitalId) // Fetch date at midnight
        // After the first midnight fetch, set up an interval for daily fetches
        const dailyInterval = setInterval(() => fetchAppointments(hospitalId), 24 * 60 * 60 * 1000) // Fetch every 24 hours
        return () => clearInterval(dailyInterval) // Cleanup interval on unmount
      }, timeUntilMidnight)

      // Cleanup the initial midnight timeout if the component unmounts
      return () => clearTimeout(midnightTimeout)
    } else {
      // console.warn('No HospitalId in localStorage for fetching appointments')
      setAppointmentError('No appointments found for this Hospital Id')
      setLoadingAppointments(false)
    }
  }, [fetchAppointments, fetchDoctors]) // Depend on fetchAppointments

  // confirmed appointments count for today
  const confirmedTodayCount = todayBookings.filter(
    (item) => item.status?.toLowerCase() === 'confirmed',
  ).length

  // Slider settings for react-slick
  useEffect(() => {
    // Clear existing interval
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

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [slides])
  const consultationTypeMap = {
    'Service & Treatment': 'services & treatments',
    'Tele Consultation': ['tele consultation', 'online consultation'], // Map a single button to multiple backend values
    'In-clinic': 'in-clinic consultation',
  }
  const getMediaSrc = (src) => {
    if (!src) return ''
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('blob:')) return src
    if (src.toLowerCase().endsWith('.mp4')) return src // for external mp4 links
    return `data:image/png;base64,${src}` // adjust type if JPG or SVG
  }

  // styles
  const thStyle = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'center'
  }

  const tdStyle = {
    border: '1px solid black',
    padding: '8px',
    textAlign: 'center'
  }

  const sliderSettings = {
    dots: true,
    infinite: slides.length > 1, // Only enable loop when more than 1
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  }

  // Auto-slide for images
  useEffect(() => {
    let imageTimer
    if (slides.length > 0) {
      // Watch current slide index
      const handleBeforeChange = (oldIndex, newIndex) => {
        // Clear previous timer
        clearTimeout(imageTimer)

        const current = slides[newIndex]
        const isVideo = isVideoFile(current.mediaUrlOrImage)

        if (!isVideo) {
          // For images: move to next after 3s
          imageTimer = setTimeout(() => {
            if (sliderRef.current) {
              sliderRef.current.slickNext()
            }
          }, 1000)
        }
      }

      // attach to slider events
      sliderRef.current?.innerSlider?.list.addEventListener('transitionend', () => {
        // optionally handle something after transition
      })

      // If using react-slick, you can get current index in afterChange
      sliderRef.current?.props?.afterChange && sliderRef.current.props.afterChange(0)

      return () => {
        clearTimeout(imageTimer)
      }
    }
  }, [slides])

  // After component mounts, attach ended listeners for each video
  useEffect(() => {
    slides.forEach((item, idx) => {
      const videoEl = document.getElementById(`video-${idx}`)
      if (videoEl) {
        // Clean up previous listener
        videoEl.onended = null
        videoEl.onended = () => {
          if (sliderRef.current) {
            sliderRef.current.slickNext()
          }
        }
      }
    })
  }, [slides])

  // Helper to check if it's video
  const isVideoFile = (src) => {
    if (!src) return false
    const lower = src.toLowerCase()
    return (
      lower.startsWith('data:video') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.includes('video') // fallback if backend sends mime type
    )
  }
  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => {
        window.print()

        // ✅ IMPORTANT: clear after print
        setTimeout(() => {
          setPrintData(null)
        }, 300)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [printData])

  const handlePrint = (item) => {
    console.log("PRINT DATA:", item)
    setPrintData(item)


  }
  return (
    <>
   
      {/* Carousel Section */}
      {/* <CCard
        className="mt-4 text-center border-2 border-dashed rounded"
        style={{ backgroundColor: 'var(--color-bgcolor)' }}
      > */}
        {/* <CCardBody className="fw-bold fs-3" style={{ color: 'var(--color-black)' }}>
          {/* Ad Space */}
        {/* </CCardBody> */}
      {/* </CCard> */} 

      {/*to display today Appointments Table */}
      <div className="container mt-3 ">

        <div className="row">
          <div className="d-flex justify-content-between align-items-center align-content-center  ">
            <h5 className="mb-4 "  style={{ color: "var(--color-bgcolor)"  , fontSize: FONT_SIZES.lg}}>Today's Appointments</h5>

            {/* 
            <div className="d-flex gap-2">
              <CButton
                style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                onClick={() => {
                  setSelectedServiceTypes([])
                  setSelectedConsultationTypes([])
                  setFilterTypes([])
                  setStatusFilters([])
                }}
              >
                All
              </CButton>

              <button
                onClick={() => toggleFilter('Service & Treatment')}
                className={`btn ${filterTypes.includes('Service & Treatment') ? 'btn-selected' : 'btn-unselected'
                  }`}
              >
                Therapy
              </button>

              <button
                onClick={() => toggleFilter('In-clinic')}
                className={`btn ${filterTypes.includes('In-clinic') ? 'btn-selected' : 'btn-unselected'
                  }`}
              >
                Consultation
              </button>


            </div> */}

            {/* <CButton
              className="mx-2"
              style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
              onClick={() => navigate('/in-progress')}
            >
              Active Appointments
            </CButton> */}
          </div>
          <div className="d-flex gap-2 mb-3">
            <CButton
              style={{
                backgroundColor: statusFilter === '' ? 'var(--color-bgcolor)' : '#ccc',
                color: '#fff'
              }}
              onClick={() => setStatusFilter('')}
            >
              All
            </CButton>


            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`btn ${statusFilter.includes('confirmed') ? 'btn-selected' : 'btn-unselected'
                }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`btn ${statusFilter.includes('pending') ? 'btn-selected' : 'btn-unselected'
                }`}
            >
              Pending
            </button>

          </div>
        </div>

        <CTable striped hover responsive>
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Booking Id</CTableHeaderCell>
              <CTableHeaderCell>Patient File_ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Doctor Name</CTableHeaderCell>
              <CTableHeaderCell>Payment Status</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loadingAppointments ? (

              <CTableDataCell
                colSpan="9"
                className="text-center"
                style={{ color: 'var(--color-black)' }}
              >
                <LoadingIndicator message="Loading appointments..." />
              </CTableDataCell>

            ) : appointmentError ? (
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  className="text-center "
                  style={{ color: 'var(--color-black)' }}
                >
                  {appointmentError}
                </CTableDataCell>
              </CTableRow>
            ) : (
              (() => {
                // 1. Filter by status (Confirmed appointments)
                const filteredByStatus = todayBookings.filter((item) => {
                  if (!statusFilter) return true;
                  return item.status?.toLowerCase() === statusFilter;
                });

                // 2. Filter by consultation type
                const filteredByTypes = filteredByStatus.filter((item) => {
                  if (filterTypes.length === 0) {
                    return true
                  }
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

                // 3. Apply global search filter to the result
                const finalFilteredData = filteredByTypes.filter((item) => {
                  if (searchQuery.trim().length < 2) {
                    return true
                  }
                  return Object.values(item).some((val) =>
                    normalize(val).includes(normalize(searchQuery)),
                  )
                })

                // 4. Handle no results found
                if (finalFilteredData.length === 0) {
                  return (
                    <CTableRow>
                      <CTableDataCell
                        colSpan="9"
                        className="text-center"
                        style={{ color: 'var(--color-black)' }}
                      >
                        {searchQuery || filterTypes.length > 0
                          ? 'No appointments match your search and filters.'
                          : 'No appointments for today.'}
                      </CTableDataCell>
                    </CTableRow>
                  )
                }

                // 5. Render the filtered data
                return finalFilteredData
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <CTableRow key={`${item.id}-${index}`} className="pink-table">
                      <CTableDataCell>{(currentPage - 1) * pageSize + index + 1}</CTableDataCell>
                      <CTableDataCell>
                        {item.bookingId ? item.bookingId.slice(-4) : "-"}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.patientId ? item.patientId.slice(-6) : "-"}
                      </CTableDataCell>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.doctorName}</CTableDataCell>
                      <CTableDataCell>
                        {editingPaymentId === item.bookingId ? (
                          <select
                            className="form-select"
                            autoFocus
                            onChange={(e) => {
                              updatePaymentStatus(item.bookingId, e.target.value);
                              setEditingPaymentId(null);
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select Payment</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                          </select>
                        ) : (
                          <CBadge
                            style={{ cursor: "pointer" }}
                            color={
                              item.paymentType && item.paymentType.toLowerCase() !== "not paid"
                                ? "success"
                                : "danger"
                            }
                            onClick={() => {
                              if (
                                !item.paymentType ||
                                item.paymentType.toLowerCase() === "not paid"
                              ) {
                                setEditingPaymentId(item.bookingId);
                              }
                            }}
                          >
                            {item.paymentType && item.paymentType.toLowerCase() !== "not paid"
                              ? "Paid"
                              : "Not Paid"}
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{item.serviceDate}</CTableDataCell>
                      <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge
                          style={{ backgroundColor: 'var(--color-bgcolor)', color: COLORS.white }}
                        >
                          {statusLabelMap[item.status] || item.status}
                        </CBadge>
                      </CTableDataCell>
                      {/* <CTableDataCell>
                        <CButton
                          style={{ backgroundColor: 'var(--color-black)' }}
                          className="text-white"
                          size="sm"
                          onClick={() =>
                            navigate(`/appointment-details/${item.bookingId}`, {
                              state: { appointment: item },
                            })
                          }
                        >
                          View
                        </CButton>


                      </CTableDataCell> */}
                      <CTableDataCell>
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
                            <Eye size={18} />
                          </CButton>

                          <CButton

                            className="text-white d-flex align-items-center justify-content-center actionBtn"
                            size="sm"
                            onClick={() => handlePrint(item)}
                          >
                            <Printer size={18} />
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
         {role.toLowerCase() === "admin" && (
        <>
          {/*to display cards*/}
          <CRow className={props.className} xs={{ gutter: 4 }}>
            {/* <CCol sm={6} xl={3}>
          <CCard>
            <CCardBody style={{ textAlign: "center" }}>
              <h5>🏥Chiselon Clinic Management System</h5>

              <p style={{ margin: "5px 0" }}>
                Developed by <strong>ss</strong>
              </p>

              <p style={{ margin: "5px 0" }}>
                Company: <strong>BP Tech Solutions</strong>
              </p>

              <p style={{ margin: "5px 0" }}>
                📧 support@bptech.com | 📞 +91 9876543210
              </p>

              <small style={{ color: "gray" }}>
                © 2026 All Rights Reserved
              </small>
            </CCardBody>
          </CCard>
        </CCol> */}
            {/* <CCol sm={6} xl={4}>

              <CCard
                onClick={() => navigate("/appointment-management")}
                style={{
                  cursor: "pointer",
                  border: "1px solid #var(--color-black)",
                  borderRadius: "14px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <CCardBody
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                  }}
                >
           
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", }}>

                
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#e7f1ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "var(--color-black)",
                        fontSize: "16px",
                      }}
                    >
                      {totalAppointmentsCount}
                    </div>
                    <div style={{ fontSize: "15px", color: "var(--color-black)", fontWeight: "500" }}>
                      Total Appointments
                    </div>
          
                  </div>

         
                  <CIcon icon={cilArrowRight} size="lg" style={{ color: "var(--color-black)" }} />
                </CCardBody>
              </CCard>


            </CCol> */}

            <CCol sm={6} xl={4}>


              <CCard
                onClick={() => navigate("/patient-management")}
                style={{
                  cursor: "pointer",
                  border: "1px solid #var(--color-black)",
                  borderRadius: "14px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <CCardBody
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                  }}
                >
                  {/* 🔹 Left Side (Count + Text) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

                    {/* 🔵 Rounded Count */}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#e7f1ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "var(--color-bgcolor)",

                        fontSize: "16px",
                      }}
                    >
                      {totalPatientsCount}
                    </div>

                    {/* 📝 Text */}
                    <div style={{ fontSize: "15px", color: "var(--color-bgcolor)", fontWeight: "500" }}>
                      Search Patients
                    </div>
                  </div>

                  {/* ➡️ Arrow */}
                  <CIcon icon={cilArrowRight} size="lg" style={{ color: "var(--color-bgcolor)" }} />
                </CCardBody>
              </CCard>


            </CCol>

            {/* <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="success"
            value={totalPatientsCount}
            title="Total Patients"

          />
        </CCol> */}
            <CCol sm={6} xl={4}>
              <CCard
                onClick={() => navigate("/employee-management/doctor")}
                style={{
                  cursor: "pointer",
                  border: "1px solid #var(--color-black)",
                  borderRadius: "14px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"
                }}
              >
                <CCardBody
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                  }}
                >
                  {/* 🔹 Left Side (Count + Text) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

                    {/* 🔵 Rounded Count */}
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: "#e7f1ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "var(--color-bgcolor)",

                        fontSize: "16px",
                      }}
                    >
                      {totalDoctorsCount}
                    </div>

                    {/* 📝 Text */}
                    <div style={{ fontSize: "15px", color: "var(--color-bgcolor)", fontWeight: "500" }}>
                      Search Doctors
                    </div>
                  </div>

                  {/* ➡️ Arrow */}
                  <CIcon icon={cilArrowRight} size="lg" style={{ color: "var(--color-bgcolor)" }} />
                </CCardBody>
              </CCard>
            </CCol>

          </CRow>
        </>
      )}
      {todayBookings.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(todayBookings.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
      <div
        id="print-area"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: 'white',
          zIndex: 9999,
          display: printData ? 'block' : 'none', // ✅ hide when no data
        }}
      >
        {printData && <PrintContent data={printData} />}
      </div>
    </>
  )
}

export default WidgetsDropdown
