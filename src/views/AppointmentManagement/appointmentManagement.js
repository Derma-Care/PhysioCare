import React, { useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CSpinner,
} from '@coreui/react'
import { CBadge } from '@coreui/react'
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { AppointmentData } from './appointmentAPI'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GetBookingByClinicIdData } from './appointmentAPI'
import { GetBookingBy_ClinicId } from '../../baseUrl'
import BookAppointmentModal from './BookAppointmentModal '

import { COLORS } from '../../Constant/Themes'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import LoadingIndicator from '../../Utils/loader'
import Pagination from '../../Utils/Pagination'
import PrintLetterHead from '../../Utils/PrintLetterHead'
const appointmentManagement = () => {
  const [viewService, setViewService] = useState(null)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [availableServiceTypes, setAvailableServiceTypes] = useState([])
  const [availableConsultationTypes, setAvailableConsultationTypes] = useState([])
  const { searchQuery } = useGlobalSearch()
  const consultationTypeLabels = {
    'In-clinic': 'In-clinic',
    Online: 'Tele Consultation',
  }
  const [bookings, setBookings] = useState([])
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  const itemsPerPage = 7
  const navigate = useNavigate()
  const [sortOrder, setSortOrder] = useState('asc')
  const role = localStorage.getItem('role') // or from context/state


  const fetchAppointments = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      console.log('Hospital ID from localStorage:', hospitalId)

      if (!hospitalId) {
        setBookings([])
        setLoading(false) //stop loading even if no hospitalId
        return
      }
      console.log('Appointments for this Hospital:', hospitalId)

      const filteredDataResponse = await GetBookingByClinicIdData(hospitalId)
      console.log('Appointments for this Hospital:', filteredDataResponse)

      setBookings(filteredDataResponse.data || [])
      if (filteredDataResponse?.data) {
      } else {
        console.warn('No data returned for Hospital ID:', hospitalId)
        setBookings([])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setBookings([])
    } finally {
      setLoading(false) // ✅ stop loading after fetch completes
    }
  }
  //Status color logics
  // const getStatusColor = (status) => {
  //   console.log(status)
  //   switch (status?.toLowerCase()) {
  //     case 'completed':
  //       return 'success'
  //     // case 'Rejected':
  //     //   return 'danger'
  //     // case 'pending':
  //     //   return 'warning'
  //     case 'confirmed':
  //       return 'info'
  //     case 'in progress':
  //       return 'primary'
  //     case 'rescheduled':
  //       return 'secondary'
  //     default:
  //       return 'dark'
  //   }
  // }
  const [printData, setPrintData] = useState(null)
  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      fetchAppointments()
    }
  }, [localStorage.getItem('HospitalId')])

  //filtering
  useEffect(() => {
    let filtered = [...bookings]
    console.log('Initial bookings:', filtered)
    const normalize = (val) => val?.toLowerCase().trim()

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          normalize(String(val || '')).includes(normalize(searchQuery)),
        ),
      )
    }

    // Filter by status (use 'status', not 'bookedStatus')
    if (statusFilters.length > 0) {
      filtered = filtered.filter((item) =>
        statusFilters.some((status) => normalize(status) === normalize(item.status)),
      )
      console.log('After status filter:', filtered)
    }
    const consultationTypeMap = {
      'Service & Treatment': 'services & treatments',
      'Tele Consultation': 'Tele consultation',
      'In-clinic': 'in-clinic consultation',
    }

    // Filter by consultation type (only one at a time)
    if (filterTypes.length === 1) {
      const selectedType = filterTypes[0]

      if (selectedType === 'Tele Consultation') {
        filtered = filtered.filter(
          (item) =>
            normalize(item.consultationType) === 'tele consultation' ||
            normalize(item.consultationType) === 'online consultation',
        )
        console.log(`After ${selectedType} filter:`, filtered)
      } else {
        const mappedType = consultationTypeMap[selectedType]
        if (mappedType) {
          filtered = filtered.filter((item) => normalize(item.consultationType) === mappedType)
          console.log(`After ${selectedType} filter:`, filtered)
        }
      }
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          item.patientId?.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [bookings, filterTypes, statusFilters, searchQuery])

  const statusLabelMap = {
    'In-Progress': 'Active',
    Completed: 'Completed',
    Pending: 'Pending',
    Rejected: 'Rejected',
    Confirmed: 'Confirmed',
  }

  useEffect(() => {
    const serviceTypes = [...new Set(bookings.map((item) => item.subServiceName).filter(Boolean))]
    const consultationTypes = [
      ...new Set(bookings.map((item) => item.consultationType).filter(Boolean)),
    ]
    setAvailableServiceTypes(serviceTypes)
    setAvailableConsultationTypes(consultationTypes)
    console.log('Available Consultation Types:', consultationTypes)
  }, [bookings])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.serviceDate)
    const dateB = new Date(b.serviceDate)
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  //to view appointments
  const ViewService = (row) => {
    setViewService(row)
  }
  const normalize = (value) => value?.toLowerCase().trim()

  //filtering for  service&treatment,in-clinic,tele-consultaion
  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }

  //filtering for pending,completed ,In-Progress - one selection at a time
  const handleStatusChange = (e) => {
    const value = e.target.value

    if (statusFilters.includes(value)) {
      setStatusFilters([]) // Deselect if the same one is clicked
    } else {
      setStatusFilters([value]) // Allow only one selection
    }
  }
  // const sortedAppointments = [...appointments].sort((a, b) => {
  //   const dateA = new Date(a.date)
  //   const dateB = new Date(b.date)

  //   if (sortOrder === 'asc') {
  //     return dateA - dateB
  //   } else {
  //     return dateB - dateA
  //   }
  // })
  useEffect(() => {
    let filtered = [...bookings]
    console.log('Initial bookings:', filtered)
    const normalize = (val) => val?.toLowerCase().trim()

    if (searchQuery.trim() !== '') {
      const q = normalize(searchQuery)

      filtered = filtered.filter((item) =>
        Object.values(item).some((val) => normalize(String(val)).includes(q)),
      )
    }

    // if (searchQuery.trim() !== '') {
    //   result = result.filter(
    //     (doc) =>
    //       doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       doc.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       doc.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()),
    //   )
    // }

    setFilteredData(filtered)
  }, [searchQuery])

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
  const handlePrint = (item) => {
    console.log("PRINT DATA:", item)
    setPrintData(item)


  }
  useEffect(() => {
    if (printData) {
      setTimeout(() => {
        window.print()
      }, 300)
    }
  }, [printData])
  return (
    <div style={{ overflow: 'hidden' }}>
      <div className="container ">
        <h5>Appointments</h5>
        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* <CInputGroup style={{ width: '300px' }}>
            <CFormInput
              type="text"
              placeholder="Search by Patient Name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup> */}
        </div>

        <div className="d-flex gap-2 mb-3">
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
            Services & Treatment
          </button>

          <button
            onClick={() => toggleFilter('In-clinic')}
            className={`btn ${filterTypes.includes('In-clinic') ? 'btn-selected' : 'btn-unselected'
              }`}
          >
            In-Clinic Consultation
          </button>

          {/* <button
            onClick={() => toggleFilter('Tele Consultation')}
            className={`btn ${
              filterTypes.includes('Tele Consultation') ? 'btn-selected' : 'btn-unselected'
            }`}
          >
            Tele Consultation
          </button> */}
        </div>

        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap" style={{ color: 'var(--color-black)' }}>
            {/* <CFormCheck
              label="Pending"
              value="Pending"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Pending')}
            /> */}
            <CFormCheck
              style={{ color: 'var(--color-black)' }}
              label="Active" // UI
              value="In-Progress" //Backend value
              onChange={handleStatusChange}
              checked={statusFilters.includes('In-Progress')}
            />

            <CFormCheck
              style={{ color: 'var(--color-black)' }}
              label="Completed"
              value="Completed"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Completed')}
            />
            <CFormCheck
              style={{ color: 'var(--color-black)' }}
              label="Confirmed"
              value="Confirmed"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Confirmed')}
            />
            {/* <CFormCheck
              label="Rejected"
              value="Rejected"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Rejected')}
            /> */}
          </div>
          {(role == 'admin' || role == 'receptionist') && (
            <CButton
              style={{
                backgroundColor: 'var(--color-black)',
                color: 'white',
                marginLeft: '325px',
              }}
              onClick={() => setVisible(true)} // open modal
            >
              Book Appointment
            </CButton>
          )}


          {/* Modal imported from separate file */}
          <BookAppointmentModal visible={visible} onClose={() => setVisible(false)} />
        </div>

        <CTable striped hover responsive>
          <CTableHead className="pink-table  w-auto">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Patient_ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Doctor Name</CTableHeaderCell>
              <CTableHeaderCell>Consultation Type</CTableHeaderCell>
              <CTableHeaderCell
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{ cursor: 'pointer' }}
              >
                Date {sortOrder === 'asc' ? '▲' : '▼'}
              </CTableHeaderCell>

              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading ? (
              // Show loading row while fetching
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  className="text-center  "
                  style={{ color: 'var(--color-black)' }}
                >
                  <div className="d-flex justify-content-center align-items-center">
                    <LoadingIndicator message="Loading appointments..." />
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <CTableRow key={`${item.id}-${index}`} className="pink-table">
                  <CTableDataCell> {(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>{item.patientId}</CTableDataCell>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.doctorName}</CTableDataCell>
                  <CTableDataCell>{item.consultationType}</CTableDataCell>
                  <CTableDataCell>
                    {item.sele ? `${item.sele} ` : ''}
                    {item.serviceDate}
                  </CTableDataCell>
                  <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}>
                      {statusLabelMap[item.status] || item.status}
                    </CBadge>
                  </CTableDataCell>

                  <CTableDataCell>
                    <CButton
                      style={{ backgroundColor: 'var(--color-black)' }}
                      className="text-white mx-2"
                      size="sm"
                      onClick={() =>
                        navigate(`/appointment-details/${item.bookingId}`, {
                          state: { appointment: item },
                        })
                      }
                    >
                      View
                    </CButton>
                    <CButton
                      style={{ backgroundColor: 'var(--color-black)' }}
                      className="text-white"
                      size="sm"
                      onClick={() => handlePrint(item)}
                    >
                      Print
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              // ✅ Show only when loading is false and no data
              <CTableRow>
                <CTableDataCell
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No appointments found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        {paginatedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / rowsPerPage)}
            pageSize={rowsPerPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setRowsPerPage}
          />
        )}

        {/* {filteredData.length > itemsPerPage && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                style={{
                  margin: '0 5px',
                  padding: '5px 10px',
                  backgroundColor: currentPage === index + 1 ? 'var(--color-black)' : '#fff',
                  color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )} */}
      </div>
      <div
        id="print-area"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: 'white',
          zIndex: -1,
        }}
      >
        {printData && <PrintContent data={printData} />}
      </div>

    </div>
  )
}

export default appointmentManagement
