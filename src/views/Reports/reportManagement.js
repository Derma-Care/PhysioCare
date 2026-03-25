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
  CModalBody,
  CFormCheck,
} from '@coreui/react'

import { AppointmentData } from '../AppointmentManagement/appointmentAPI'
import { useNavigate } from 'react-router-dom'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import Pagination from '../../Utils/Pagination'
const ReportsManagement = () => {
  // const [viewService, setViewService] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [viewService, setViewService] = useState([])
  const navigate = useNavigate()
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [availableServiceTypes, setAvailableServiceTypes] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState([])
  const [availableConsultationTypes, setAvailableConsultationTypes] = useState([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [clinicId, setClinicId] = useState(null)
  const [error, setError] = useState(null)
  const consultationTypeMap = {
    'Service & Treatment': 'services & treatments',
    'Tele Consultation': 'tele consultation',
    'In-clinic': 'in-clinic consultation',
  }

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  const fetchAppointments = async (hospitalId) => {
    // Added hospitalId parameter
    try {
         setLoading(true)
      const data = await AppointmentData()
      if (data && data.data) {
        // Filter initial bookings by clinicId here if it exists
        const relevantBookings = hospitalId
          ? data.data.filter((booking) => normalize(booking.clinicId) === normalize(hospitalId))
          : data.data
        setBookings(relevantBookings || [])
     
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setBookings([])
       // Ensure bookings is an empty array on error
    }
    finally{
      setLoading(false)

    }
  }

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      setClinicId(hospitalId) // Store clinicId in state
      fetchAppointments(hospitalId) // Pass hospitalId to fetch function
    } else {
      console.warn('No HospitalId found in localStorage. Displaying all relevant appointments.')
      // If no HospitalId, you might still want to fetch all appointments
      // or handle this case based on your application's requirements.
      fetchAppointments(null) // Fetch all if no specific clinicId
    }
  }, [])

  const handleStatusChange = (e) => {
    const value = e.target.value // "Completed" or "Active"

    if (statusFilters.includes(value)) {
      setStatusFilters([]) // remove if clicked again
    } else {
      setStatusFilters([value]) // only one selection at a time
    }
  }

  useEffect(() => {
    let currentFiltered = bookings

    // Only include Completed + Active(In-Progress) from backend
    currentFiltered = currentFiltered.filter((booking) =>
      ['completed', 'in-progress', 'active'].includes(normalize(booking.status)),
    )

    // Apply user-selected status filters
    if (statusFilters.length > 0) {
      currentFiltered = currentFiltered.filter((booking) => {
        const status = normalize(booking.status)

        if (statusFilters.includes('Completed')) {
          return status === 'completed'
        }

        if (statusFilters.includes('Active')) {
          // Treat both active + in-progress as Active
          return status === 'active' || status === 'in-progress'
        }

        return true
      })
    }

    // Consultation type filter
    if (filterTypes.length === 1) {
      const selectedType = filterTypes[0]

      if (selectedType === 'Tele Consultation') {
        currentFiltered = currentFiltered.filter(
          (item) =>
            normalize(item.consultationType) === 'tele consultation' ||
            normalize(item.consultationType) === 'online consultation',
        )
      } else {
        const mappedType = consultationTypeMap[selectedType]
        if (mappedType) {
          currentFiltered = currentFiltered.filter(
            (item) => normalize(item.consultationType) === mappedType,
          )
        }
      }
    }

    setFilteredData(currentFiltered)
  }, [bookings, filterTypes, statusFilters])

  useEffect(() => {
    const serviceTypes = [...new Set(bookings.map((item) => item.servicename).filter(Boolean))]
    const consultationTypes = [
      ...new Set(bookings.map((item) => item.consultationType).filter(Boolean)),
    ]
    setAvailableServiceTypes(serviceTypes)
    setAvailableConsultationTypes(consultationTypes)
    console.log('Available Consultation Types:', consultationTypes)
  }, [bookings])

  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }

  const selectedStatus = 'Completed' // or 'confirmed', etc.
  // 🔁 Filter when bookings or status changes
  // useEffect(() => {
  //   const filtered = bookings.filter(
  //     (booking) => booking.status?.toLowerCase().trim() === selectedStatus.toLowerCase().trim(),
  //   )
  //   setFilteredData(filtered)
  // }, [bookings, selectedStatus]) // dependencies: run whenever these change
  // useEffect(() => {
  //   let currentFiltered = bookings

  //   // 1. Filter by status (Completed only)
  //   currentFiltered = currentFiltered.filter((booking) => normalize(booking.status) === 'completed')

  //   // 2. Apply consultation type filter
  //   if (filterTypes.length === 1) {
  //     const selectedType = filterTypes[0]

  //     if (selectedType === 'Tele Consultation') {
  //       currentFiltered = currentFiltered.filter(
  //         (item) =>
  //           normalize(item.consultationType) === 'tele consultation' ||
  //           normalize(item.consultationType) === 'online consultation',
  //       )
  //     } else {
  //       const mappedType = consultationTypeMap[selectedType]
  //       if (mappedType) {
  //         currentFiltered = currentFiltered.filter(
  //           (item) => normalize(item.consultationType) === mappedType,
  //         )
  //       }
  //     }
  //   }

  //   setFilteredData(currentFiltered)
  // }, [bookings, filterTypes])

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      fetchAppointments(hospitalId)
    } else {
      console.warn('No HospitalId in localStorage')
    }
  }, [])

  const normalize = (value) => value?.toLowerCase().trim()

  return (
    <div style={{ overflowX: 'auto' }}>
      <div className="container  ">
        <h5 className="mb-3">Completed Appointments</h5>
        <div className="d-flex gap-2 mb-3">
          {['Service & Treatment', 'In-clinic', 'Tele Consultation'].map((label) => (
            <button
              key={label}
              onClick={() => toggleFilter(label)}
              className={`btn ${filterTypes.includes(label) ? 'btn-selected' : 'btn-unselected'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-3 d-flex justify-content-between">
          <div className="d-flex gap-3 mb-3" style={{ color: 'var(--color-black)' }}>
            <CFormCheck
              label="Completed"
              value="Completed"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Completed')}
            />
            <CFormCheck
              label="Active"
              value="Active"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Active')}
            />
          </div>
          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            onClick={() => {
              setFilterTypes([])
              setStatusFilters([])
            }}
          >
            Reset Filters
          </CButton>
        </div>

        {loading ? (
          // ✅ Show loading while data is being fetched

          <div className="d-flex justify-content-center align-items-center">
            <LoadingIndicator message="Loading reports..." />
          </div>
        ) : error ? (
          <div>{error}</div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead className="pink-table">
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Name</CTableHeaderCell>
                {/* <CTableHeaderCell>Service</CTableHeaderCell> */}
                <CTableHeaderCell>Consultation Type</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Time</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filteredData.length > 0 ? (
                filteredData
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((item, index) => (
                    <CTableRow key={`${item.bookingId}-${index}`} className="pink-table">
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.consultationType}</CTableDataCell>
                      <CTableDataCell>{item.serviceDate}</CTableDataCell>
                      <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
                      <CTableDataCell>
                        {normalize(item.status) === 'in-progress' ? 'Active' : item.status}
                      </CTableDataCell>
                      <CTableDataCell>
                        {can('Appointments', 'read') && (
                          <CButton
                            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                            className="text-white"
                            size="sm"
                            onClick={() =>
                              navigate(`/report-details/${item.bookingId}`, {
                                state: {
                                  report: item,
                                  appointmentInfo: {
                                    name: item.name,
                                    age: item.age,
                                    gender: item.gender,
                                    problem: item.problem,
                                    bookingId: item.bookingId,
                                    patientId: item.patientId || selectedAppointment?.patientId, // ✅ Use correct path
                                    item: item,
                                    selectedAppointment: selectedAppointment,
                                  },
                                },
                              })
                            }
                          >
                            View
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
              ) : (
                // ✅ Show only after loading is done and no data
                <CTableRow>
                  <CTableDataCell
                    colSpan="8"
                    className="text-center "
                    style={{ color: 'var(--color-black)' }}
                  >
                    No appointments found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="mb-3  mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / pageSize)}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
      {/* {filteredMedicines.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredMedicines.length / pageSize)}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )} */}
    </div>
  )
}

export default ReportsManagement
