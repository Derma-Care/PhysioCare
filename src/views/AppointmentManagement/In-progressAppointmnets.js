import React, { useEffect, useState, useCallback } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormSelect,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CCard,
  CCardBody,
  CFormInput,
  CCollapse,
} from '@coreui/react'
import { Edit, Save } from 'lucide-react'
import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { bookingUpdate, GetBookingByClinicIdData, GetBookingInprogress } from './appointmentAPI'
import { http } from '../../Utils/Interceptors'
import axios from 'axios'
import { BASE_URL, Booking_sevice } from '../../baseUrl'
import { toast } from 'react-toastify'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import LoadingIndicator from '../../Utils/loader'
import capitalizeWords from '../../Utils/capitalizeWords'
import { getFollowOptions } from '../../APIs/FollowOptions'
import { showCustomToast } from '../../Utils/Toaster'
import Pagination from '../../Utils/Pagination'
import { getDoctorDetailsById } from '../Doctors/DoctorAPI'
import RazorpayButton from '../Payments/RazorpayButton'
import {
  CategoryData,
  getSubServiceById,
  serviceData,
  serviceDataH,
  subServiceData,
} from '../ProcedureManagement/ProcedureManagementAPI'
// const followOptions = [
//   { label: 'Follow-up Required', value: 'followup' },
//   { label: 'No Follow-up Needed', value: 'no-followup' },
//   { label: 'Patient Not Responding', value: 'no-response' },
//   { label: 'Reschedule Needed (Doctor Unavailable)', value: 'reschedule-doctor' },
//   { label: 'Reschedule Needed (Patient Request)', value: 'reschedule-patient' },
//   { label: 'Request to Book', value: 'request-to-book' },
//   { label: 'Booked by Admin', value: 'booked-admin' },
//   { label: 'we will book', value: 'patient-will book' },
//   { label: 'Waiting for Patient Confirmation', value: 'waiting-patient-confirmation' },
//   { label: 'Waiting for Doctor Confirmation', value: 'waiting-doctor-confirmation' },
// ]

const InProgressAppointmentsPage = () => {
  const [inprogressApt, setInprogressApt] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [followStatuses, setFollowStatuses] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [days, setDays] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [allSlots, setAllSlots] = useState([])
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const dispatch = useDispatch()
  const [selectedDateFilter, setSelectedDateFilter] = useState('today')
  const [allAppointments, setAllAppointments] = useState([])
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [value, setValue] = useState('') // selected dropdown value
  const [custom, setCustom] = useState('')
  const [editMode, setEditMode] = useState({})
  const [showAllSlots, setShowAllSlots] = useState(false)
  const [reschedule, setReschedule] = useState(false)
  // Whenever appointments are fetched, set edit mode
  const [expandedPatient, setExpandedPatient] = useState(null)
  const [followOptions, setFollowOptions] = useState([])
  const [expandedTreatment, setExpandedTreatment] = useState(null)
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [doctorDetails, setDoctorDetails] = useState(null)
  const [loadingDoctor, setLoadingDoctor] = useState(false)
  const [selectedSubService, setSelectedSubService] = useState(null)
  const [finalCost, setFinalCost] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchData()
    const mode = {}
    inprogressApt.forEach((apt) => {
      // If followupStatus exists → not editable by default
      mode[apt.bookingId] = apt.followupStatus ? false : true
    })
    setEditMode(mode)
  }, [inprogressApt])

  const fetchData = async () => {
    const options = await getFollowOptions()
    setFollowOptions(options)
    console.log(options)
  }

  const fetchDoctorBtId = async (id) => {
    try {
      setLoadingDoctor(true)
      const res = await getDoctorDetailsById(id)
      setDoctorDetails(res.data)
    } catch (err) {
      console.error('Error fetching doctor details', err)
    } finally {
      setLoadingDoctor(false)
    }
  }

  const fetchAppointments = useCallback(async () => {
    setError(null)

    try {
      setLoading(true)
      const response = await GetBookingInprogress()
      console.log('In-progress appointments:', response)

      if (response && Array.isArray(response)) {
        setAllAppointments(response) // ✅ store unfiltered appointments
        setInprogressApt(response)
        console.log('In-progress appointments:', response)
      } else {
        setAllAppointments([])
        setInprogressApt([])
        setError('No appointments found.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch appointments')
      setAllAppointments([])
      setInprogressApt([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    dispatch({ type: 'set', sidebarShow: false })
    fetchAppointments()
  }, [fetchAppointments, dispatch])

  const handleChange = (bookingId, newValue) => {
    // newValue can be a string or an object { value, customReason }
    setFollowStatuses((prev) => ({
      ...prev,
      [bookingId]: typeof newValue === 'string' ? { value: newValue } : newValue,
    }))
  }

  const [sortOrder, setSortOrder] = useState('asc')

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const [disabledIds, setDisabledIds] = useState({}) // Track disabled appointments

  const handleSave = async (sittingKey, bookingId) => {
    const current = followStatuses[sittingKey]
    if (!current) return alert('Select or type a reason')

    const status = current.value === 'other' ? current.custom?.trim() : current.value
    if (!status) return alert('Status cannot be empty')

    try {
      const payload = { bookingId, followupStatus: status }

      await bookingUpdate(payload) // send to backend

      // mark as saved
      setFollowStatuses((prev) => ({
        ...prev,
        [sittingKey]: { ...prev[sittingKey], saved: status },
      }))

      // exit edit mode
      setEditMode((prev) => ({ ...prev, [sittingKey]: false }))
      setSelected(current)
      showCustomToast('Status saved successfully.', 'success')
      fetchAppointments()
    } catch (err) {
      console.error('Failed to save status:', err)
      alert('Failed to save status')
    }
  }

  const currentStatus = followStatuses[inprogressApt.bookingId] || {}
  // Inside the modal body, after fetching slots and filtering for selectedDate
  const filteredSlots = slotsForSelectedDate.filter((slotObj) => {
    if (!slotObj.slot) return false
    const now = new Date()
    const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
    const isBooked = slotObj.slotbooked === true || slotObj.slotbooked === 'true'

    // show booked slots, but mark as disabled
    if (selectedDate === format(now, 'yyyy-MM-dd')) {
      return slotTime > now || isBooked
    }
    return true
  })

  // Slot click handler - only one slot allowed
  // const handleSlotClick = (slot) => {
  //   if (slot.slotbooked) return // booked slot not selectable
  //   setSelectedSlots([slot.slot]) // only one slot
  // }

  // Booking payload and API call
  const bookSlot = async (paymentType = 'hospital', razorpayResponse = null) => {
    if (!modalData || selectedSlots.length === 0) {
      showCustomToast('Please select a slot before booking.', 'warning')
      return
    }

    const payload = {
      bookingId: modalData.bookingId,
      doctorId: modalData.doctorId,
      patientId: modalData.patientId,
      visitType: 'Follow-Up',
      serviceDate: selectedDate,
      servicetime: selectedSlots,
      mobileNumber: modalData.mobileNumber,
      bookingFor: modalData.bookingFor,
      // paymentType, // 🧩 add payment type (hospital/online)
      // razorpayPaymentId: razorpayResponse?.razorpay_payment_id || null,
    }

    // const selected = followStatuses[modalData.bookingId]
    const status = selected?.value === 'other' ? selected.custom?.trim() : selected?.value

    try {
      const rescheduleStatuses = ['reschedule-doctor', 'reschedule-patient']
      const shouldReschedule =
        rescheduleStatuses.includes(status) || rescheduleStatuses.includes(modalData.followupStatus)

      if (reschedule) {
        const reschedulePayload = {
          bookingId: modalData.bookingId,
          followupStatus: status,
          serviceDate: selectedDate,
          servicetime: selectedSlots,
        }
        console.log(reschedulePayload)
        await bookingUpdate(reschedulePayload)
        showCustomToast('Booking has been rescheduled successfully.', 'success')
      } else {
        console.log('Booking Payload:', payload)

        // 🔹 Example: Post booking to your backend
        const response = await axios.post(`${Booking_sevice}/customer/bookService`, payload)

        if (response?.data?.success) {
          showCustomToast(response.data.message || 'Booking successful!', 'success')
        } else {
          showCustomToast(response?.data?.message || 'Booking failed. Please try again.', 'error')
        }

        if (paymentType === 'online') {
          showCustomToast('Online Payment Successful! Booking Confirmed.', 'success')
        } else {
          showCustomToast('Booking Confirmed. Pay at Hospital.', 'success')
        }
      }

      await fetchAppointments()
      setModalVisible(false)
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while booking. Please try again.'
      // showCustomToast(msg, 'error')
      console.error('Booking failed:', error)
    }
  }

  const handleDateFilter = (filter) => {
    setSelectedDateFilter(filter)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let targetDate = new Date(today)
    if (filter === 'tomorrow') targetDate.setDate(today.getDate() + 1)
    if (filter === 'dayafter') targetDate.setDate(today.getDate() + 2)

    const formattedDate = format(targetDate, 'yyyy-MM-dd')
    const filteredAppointments = allAppointments.filter((apt) => apt.serviceDate === formattedDate)
    setInprogressApt(filteredAppointments)
  }

  useEffect(() => {
    const generateUpcomingDays = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dayList = []

      for (let i = 0; i < 15; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dayList.push({
          date,
          dayLabel: format(date, 'EEE'), // use date here
          dateLabel: format(date, 'dd MMM'),
        })
      }

      setDays(dayList)
      setSelectedDate(format(today, 'yyyy-MM-dd'))
    }

    generateUpcomingDays()
  }, [])

  // Fetch slots for doctor
  // Fetch slots for doctor when modal opens
  const fetchSlots = async () => {
    if (!modalData) return
    try {
      setModalLoading(true)
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const response = await http.get(
        `/getDoctorSlots/${hospitalId}/${branchId}/${modalData.doctorId}`,
      )
      if (response.data.success && Array.isArray(response.data.data)) {
        setAllSlots(response.data.data) // store all slot objects (with date)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setModalError('Failed to load slots')
    } finally {
      setModalLoading(false)
    }
  }

  const getSubServiceByIdFun = async (subServiceId) => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const res = await getSubServiceById(hospitalId, subServiceId)
      console.log('API Response:', res)

      // Safely calculate
      const total = (res.finalCost || 0) - (res.consultationFee || 0)

      console.log('Calculated Final Cost:', total)

      setFinalCost(total) // ✅ Correct way to update state
      setSelectedSubService(res) // ✅ Store full object
    } catch (error) {
      console.error('Error fetching sub service:', error)
    }
  }

  // Filter slots for selected date and doctor
  useEffect(() => {
    if (!allSlots.length || !modalData || !selectedDate) return

    // Filter slots for selected date ignoring branchId mismatch
    const doctorSlots = allSlots.find(
      (d) => d.doctorId === modalData.doctorId && d.date === selectedDate, // ignore branchId for now
    )

    if (doctorSlots && Array.isArray(doctorSlots.availableSlots)) {
      setSlotsForSelectedDate(doctorSlots.availableSlots)
      setSelectedSlots([]) // reset selection
    } else {
      setSlotsForSelectedDate([])
    }
  }, [allSlots, selectedDate, modalData])

  useEffect(() => {
    if (modalData) fetchSlots()
  }, [modalData])
  const handleSlotClick = (slotObj) => {
    if (slotObj.slotbooked) return // booked slot not selectable
    setSelectedSlots([slotObj.slot]) // only one slot
  }

  const openBookingModal = async (bookingId) => {
    setModalVisible(true)
    // setModalLoading(true)
    setModalError(null)
    setModalData(bookingId)
  }
  useEffect(() => {
    if (inprogressApt && inprogressApt.length > 0) {
      const hasReschedule = inprogressApt.some(
        (apt) =>
          apt.followupStatus === 'reschedule-doctor' || apt.followupStatus === 'reschedule-patient',
      )

      setReschedule(hasReschedule)
    }
  }, [inprogressApt])

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return inprogressApt
    return inprogressApt.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, inprogressApt])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const sortedAppointments = [...displayData].sort((a, b) => {
    const dateA = new Date(a.serviceDate)
    const dateB = new Date(b.serviceDate)
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center">
        <LoadingIndicator message="Loading active appointmnets..." />
      </div>
    )

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // full viewport height
        }}
      >
        <p>{error}</p>
      </div>
    )
  }

  const groupedAppointments = sortedAppointments.reduce((acc, apt) => {
    if (!acc[apt.patientId]) acc[apt.patientId] = []
    acc[apt.patientId].push(apt)
    return acc
  }, {})

  if (sortedAppointments.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '300px' }}
      >
        <h6
          style={{
            color: 'var(--color-black)',
            fontWeight: 'normal',
            textAlign: 'center',
          }}
        >
          No Active Appointments
        </h6>
      </div>
    )
  }
  const COLUMNS = 4 // Number of columns in your grid
  const INITIAL_ROWS = 3 // Number of rows to show initially
  const INITIAL_COUNT = COLUMNS * INITIAL_ROWS // Number of sl
  return (
    <div className="container my-2">
      <div className="row d-flex w-100">
        <div className="col-6">
          <h4>In-Progress Appointments</h4>
        </div>
        {/* <div className="col-6 flex-column d-flex justify-content-center align-items-center align-content-center"> */}
        {/* 🔥 Filter Buttons */}
        {/* <div className="row my-2">
            <div className="col d-flex gap-2">
              {['today', 'tomorrow', 'dayafter'].map((filter) => {
                const isSelected = selectedDateFilter === filter
                const label =
                  filter === 'today'
                    ? 'Today'
                    : filter === 'tomorrow'
                      ? 'Tomorrow'
                      : 'Day After Tomorrow'

                return (
                  <CButton
                    key={filter}
                    onClick={() => handleDateFilter(filter)}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-bgcolor)' : 'transparent',
                      color: isSelected ? 'var(--color-black)' : 'var(--color-black)',
                      border: `1px solid var(--color-bgcolor)`,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    }}
                  >
                    {label}
                  </CButton>
                )
              })}
            </div>
          </div> */}

        {/* <div className="mb-4">
            <span>(Only Showing Active Appointments)</span>
          </div> */}
        {/* </div> */}
      </div>
      {/* Table Section */}
      <div className="mt-4">
        {Object.entries(groupedAppointments).map(([patientId, appointments]) => (
          <CCard key={patientId} className="mb-3">
            {/* Accordion Header for patient */}
            <div
              onClick={() => setExpandedPatient(expandedPatient === patientId ? null : patientId)}
              style={{
                cursor: 'pointer',
                backgroundColor: 'var(--color-bgcolor)',
                padding: '10px 15px',
                fontWeight: '500',
                borderBottom: '1px solid #dee2e6',
                color: 'var(--color-black)',
              }}
            >
              {capitalizeWords(appointments[0].name)} ({appointments[0].patientId}) -{' '}
              {appointments.length} Appointment
              {appointments.length > 1 ? 's' : ''}
              <span style={{ float: 'right' }}>{expandedPatient === patientId ? '▲' : '▼'}</span>
            </div>

            <CCollapse visible={expandedPatient === patientId}>
              <CCardBody style={{ padding: '10px' }}>
                {appointments.map((apt) => (
                  <CCard
                  
                    key={apt.bookingId}
                    className="mb-3"
                    style={{ color: 'var(--color-black)'  }}
                  >
                    {/* 🔹 Booking header */}
                    <div
                      onClick={() =>
                        setExpandedBooking(expandedBooking === apt.bookingId ? null : apt.bookingId)
                      }
                      style={{
                        cursor: 'pointer',
                        padding: '8px 12px',
                        fontWeight: 600,
                        backgroundColor: '#e0e0e03f',
                        // borderBottom: '1px solid #ddd',
                        color: 'grey',
                      }}
                    >
                      Booking Id: {apt.bookingId} — No. of Treatments:{' '}
                      {Object.keys(apt.treatments?.generatedData || {}).length}
                      <span style={{ float: 'right' }}>
                        {expandedBooking === apt.bookingId ? '▲' : '▼'}
                      </span>
                    </div>

                    {/* 🔹 When booking expanded */}
                    <CCollapse visible={expandedBooking === apt.bookingId}>
                      {apt.treatments?.generatedData &&
                        Object.entries(apt.treatments.generatedData).map(
                          ([treatmentName, treatment]) => (
                            <CCard
                              key={treatmentName}
                              className="mt-2"
                              style={{ border: '1px solid #ddd', borderRadius: '8px' }}
                            >
                              {/* 🔹 Treatment accordion header */}
                              <div
                                onClick={() =>
                                  setExpandedTreatment(
                                    expandedTreatment === treatmentName ? null : treatmentName,
                                  )
                                }
                                style={{
                                  cursor: 'pointer',
                                  padding: '8px 12px',

                                  backgroundColor: '#f1f1f1',
                                  borderBottom: '1px solid #ddd',
                                  color: 'var(--color-black)',
                                }}
                              >
                                {treatmentName} ({treatment.dates.length} sittings)
                                <span style={{ float: 'right' }}>
                                  {expandedTreatment === treatmentName ? '▲' : '▼'}
                                </span>
                              </div>

                              {/* 🔹 Treatment sittings table */}
                              <CCollapse visible={expandedTreatment === treatmentName}>
                                <CTable bordered hover responsive className="mt-2">
                                  <CTableHead>
                                    <CTableRow className="pink-table  w-auto">
                                      <CTableHeaderCell>Patient ID</CTableHeaderCell>
                                      <CTableHeaderCell>Doctor</CTableHeaderCell>
                                      <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                                      <CTableHeaderCell>Consultation</CTableHeaderCell>
                                      <CTableHeaderCell>Sitting Date</CTableHeaderCell>
                                      <CTableHeaderCell>Status</CTableHeaderCell>
                                      <CTableHeaderCell>Follow-Up Status</CTableHeaderCell>
                                      <CTableHeaderCell className="text-end">
                                        Action
                                      </CTableHeaderCell>
                                    </CTableRow>
                                  </CTableHead>

                                  <CTableBody>
                                    {treatment.dates.map((sitting, i) => {
                                      const sittingKey = `${apt.bookingId}-${treatmentName}-${i}`
                                     const isCompleted =
  sitting.status?.toLowerCase() === 'completed' ||
  sitting.status?.toLowerCase() === 'confirmed'

                                      const isEditMode = editMode[sittingKey]

                                      return (
                                        <CTableRow key={sittingKey} className="pink-table  w-auto">
                                          <CTableDataCell>{apt.patientId}</CTableDataCell>
                                          <CTableDataCell>
                                            {capitalizeWords(apt.doctorName)}
                                          </CTableDataCell>
                                          <CTableDataCell>{apt.mobileNumber}</CTableDataCell>
                                          <CTableDataCell>{apt.consultationType}</CTableDataCell>
                                          <CTableDataCell>{sitting.date}</CTableDataCell>
                                          <CTableDataCell>{sitting.status}</CTableDataCell>

                                          {/* 🔹 Follow-up Status */}
                                          <CTableDataCell>
                                            <div className="d-flex align-items-center gap-2">
                                              <CFormSelect
                                                size="sm"
                                                value={
                                                  followStatuses[sittingKey]?.saved ||
                                                  followStatuses[sittingKey]?.value ||
                                                  sitting.followupStatus ||
                                                  ''
                                                }
                                                onChange={async (e) => {
                                                  const selectedValue = e.target.value

                                                  setFollowStatuses((prev) => ({
                                                    ...prev,
                                                    [sittingKey]: {
                                                      ...prev[sittingKey],
                                                      value: selectedValue,
                                                    },
                                                  }))

                                                  const rescheduleStatuses = [
                                                    'reschedule-doctor',
                                                    'reschedule-patient',
                                                  ]

                                                  if (rescheduleStatuses.includes(selectedValue)) {
                                                    openBookingModal(apt)
                                                    await fetchDoctorBtId(apt.doctorId)
                                                    setReschedule(true)
                                                  } else {
                                                    setReschedule(false)
                                                  }
                                                }}
                                                disabled={isCompleted || !editMode[sittingKey]} // ✅ disabled when not in edit mode
                                              >
                                                <option value="">Select</option>
                                                {followOptions.map((opt) => (
                                                  <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                  </option>
                                                ))}
                                                <option value="other">Other</option>
                                              </CFormSelect>

                                              {(followStatuses[sittingKey]?.value === 'other' ||
                                                sitting.followupStatus === 'other') &&
                                                editMode[sittingKey] && (
                                                  <CFormInput
                                                    size="sm"
                                                    placeholder="Type reason if needed"
                                                    value={followStatuses[sittingKey]?.custom || ''}
                                                    onChange={(e) =>
                                                      setFollowStatuses((prev) => ({
                                                        ...prev,
                                                        [sittingKey]: {
                                                          ...prev[sittingKey],
                                                          custom: e.target.value,
                                                        },
                                                      }))
                                                    }
                                                  />
                                                )}

                                              {!isCompleted && (
                                                <CButton
                                                  size="sm"
                                                  onClick={async () => {
                                                    if (editMode[sittingKey]) {
                                                      // ✅ If in edit mode → save then disable
                                                      await handleSave(sittingKey, apt.bookingId)
                                                      setEditMode((prev) => ({
                                                        ...prev,
                                                        [sittingKey]: false,
                                                      }))
                                                    } else {
                                                      // ✅ If in view mode → enable edit
                                                      setEditMode((prev) => ({
                                                        ...prev,
                                                        [sittingKey]: true,
                                                      }))
                                                    }
                                                  }}
                                                >
                                                  {editMode[sittingKey] ? (
                                                    <Save
                                                      size={16}
                                                      style={{ color: 'var(--color-black)' }}
                                                    />
                                                  ) : (
                                                    <Edit
                                                      size={16}
                                                      style={{ color: 'var(--color-black)' }}
                                                    />
                                                  )}
                                                </CButton>
                                              )}
                                            </div>
                                          </CTableDataCell>

                                          {/* 🔹 Action */}
                                          <CTableDataCell className="text-end">
                                            <CButton
                                              size="sm"
                                              style={{
                                                backgroundColor: 'var(--color-bgcolor)',
                                                color: 'var(--color-black)',
                                              }}
                                              onClick={async () => {
                                                await fetchDoctorBtId(apt.doctorId)
                                                getSubServiceByIdFun(apt.subServiceId)
                                                openBookingModal(apt)
                                                fetchSlots()
                                              }}
                                              disabled={isCompleted}
                                            >
                                              BOOK
                                            </CButton>
                                          </CTableDataCell>
                                        </CTableRow>
                                      )
                                    })}
                                  </CTableBody>
                                </CTable>
                              </CCollapse>
                            </CCard>
                          ),
                        )}
                    </CCollapse>
                  </CCard>
                ))}
              </CCardBody>
            </CCollapse>
          </CCard>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / rowsPerPage)}
        pageSize={rowsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setRowsPerPage}
      />

      {/* Modal showing details without table */}
      {/* Modal for booking slots */}

      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <CModalTitle style={{ fontWeight: 600, fontSize: '18px', color: 'var(--color-black)' }}>
            Book Slots for {capitalizeWords(modalData?.doctorName)} (
            {capitalizeWords(modalData?.name)})
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ fontSize: '14px' }}>
          {/* Patient & Doctor Info */}
          {modalData && (
            <CCard
              className="mb-3"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                <strong>Patient:</strong> {capitalizeWords(modalData.name)} <br />
                <strong>Doctor:</strong> {capitalizeWords(modalData.doctorName)} <br />
                <strong>Clinic / Branch:</strong> {modalData.clinicName || modalData.branchname}{' '}
                <br />
                <strong>Branch:</strong> {modalData.branchname} <br />
                <strong>Consultation:</strong> {modalData.consultationType} <br />
              </p>
            </CCard>
          )}

          {/* Date selection */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            {days.map((dayObj, idx) => {
              const isSelected = selectedDate === format(dayObj.date, 'yyyy-MM-dd')
              return (
                <CButton
                  key={idx}
                  onClick={() => {
                    const formattedDate = format(dayObj.date, 'yyyy-MM-dd')
                    setSelectedDate(formattedDate)
                    fetchSlots(formattedDate) // pass the selected date if needed
                  }}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-black)' : 'white',
                    color: isSelected ? 'white' : 'var(--color-black)',
                    border: '1px solid grey',
                    borderRadius: '6px',
                    minWidth: '70px',
                    padding: '6px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{dayObj.dayLabel}</div>
                  <div style={{ fontSize: '12px' }}>{dayObj.dateLabel}</div>
                </CButton>
              )
            })}
          </div>

          {/* Slots for selected date */}
          <CCard style={{ borderRadius: '8px', border: '1px solid #ddd' }}>
            <CCardBody>
              {modalLoading ? (
                <LoadingIndicator message="Loading slots..." />
              ) : filteredSlots.length > 0 ? (
                <>
                  <div className="slot-grid mt-3">
                    <CCard className="mb-4">
                      <CCardBody>
                        <div
                          className="slot-container d-grid"
                          style={{
                            display: 'grid',
                            color: 'var(--color-black)',
                            gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
                            gap: '12px',
                          }}
                        >
                          {loadingDoctor ? (
                            <div className="text-center mt-3">Loading doctor details...</div>
                          ) : doctorDetails?.doctorAvailabilityStatus ? ( // ✅ optional chaining used
                            slotsForSelectedDate.length > 0 ? (
                              (showAllSlots
                                ? slotsForSelectedDate
                                : slotsForSelectedDate.slice(0, INITIAL_COUNT)
                              ).map((slotObj, i) => {
                                const isSelected = selectedSlots === slotObj.slot
                                const isBooked = slotObj?.slotbooked
                                const now = new Date()
                                const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
                                const today = format(now, 'yyyy-MM-dd') === selectedDate

                                // ✅ Only allow future slots for current date, all slots for other days
                                const isPastTime = !today || slotTime > now

                                return (
                                  isPastTime && (
                                    <div
                                      key={i}
                                      className={`slot-item text-center border rounded ${
                                        isBooked
                                          ? 'bg-danger text-white'
                                          : isSelected
                                            ? 'text-white'
                                            : 'bg-light var(--color-black)'
                                      }`}
                                      onClick={() => {
                                        if (isBooked) return
                                        setSelectedSlots(isSelected ? null : slotObj.slot)
                                      }}
                                      style={{
                                        padding: '10px 0',
                                        borderRadius: '8px',
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: isBooked ? 0.7 : 1,
                                        color: isBooked
                                          ? 'white'
                                          : isSelected
                                            ? 'white'
                                            : 'var(--color-black)',
                                        backgroundColor: isBooked
                                          ? 'red'
                                          : isSelected
                                            ? 'var(--color-black)'
                                            : 'transparent',
                                      }}
                                      title={isBooked ? 'Booked' : 'Available'}
                                    >
                                      {slotObj?.slot}
                                    </div>
                                  )
                                )
                              })
                            ) : (
                              <div className="text-center mt-3">
                                No slots available for selected date
                              </div>
                            )
                          ) : doctorDetails ? ( // ✅ shows message only if doctorDetails is fetched
                            <div className="text-center mt-3 text-danger w-100">
                              Doctor is not available now
                            </div>
                          ) : (
                            <div className="text-center mt-3">
                              Select a doctor to view availability
                            </div>
                          )}
                        </div>
                        {/* Show More / Show Less button */}
                        {slotsForSelectedDate.length > INITIAL_COUNT &&
                          doctorDetails?.doctorAvailabilityStatus && ( // ✅ also safely checked
                            <div className="text-center mt-2">
                              <CButton
                                size="sm"
                                onClick={() => setShowAllSlots((prev) => !prev)}
                                style={{
                                  borderRadius: '6px',
                                  fontWeight: 500,
                                  backgroundColor: 'var(--color-bgcolor)',
                                  color: 'var(--color-black)',
                                }}
                              >
                                {showAllSlots ? 'Show Less' : 'Show More'}
                              </CButton>
                            </div>
                          )}
                      </CCardBody>
                    </CCard>
                  </div>
                </>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--color-black)', margin: 0 }}>
                  No slots available for this date
                </p>
              )}
            </CCardBody>
          </CCard>

          {/* Book Slots Button */}
          <div className="mt-4 d-flex justify-content-end gap-2">
            {!reschedule && (
              <>
                {/* 💰 Pay at Hospital */}
                {/* <CButton
                  style={{
                    backgroundColor: 'gray',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontWeight: 600,
                  }}
                  // disabled={selectedSlots.length === 0}
                  onClick={() => {
                    if (selectedSlots.length === 0) {
                      showCustomToast('Please select one slot...', 'warning')
                      return // 🚫 stop execution here
                    }

                    bookSlot('hospital')
                  }}
                >
                  Pay at Hospital
                </CButton> */}

                {/* 💳 Pay Online */}

                <RazorpayButton
                  amount={finalCost}
                  onPaymentSuccess={bookSlot}
                  selectedSlots={selectedSlots}
                  clinicName={modalData?.clinicName || ''}
                  mobileNumber={modalData?.patientMobileNumber || modalData?.mobileNumber}
                />
              </>
            )}

            {/* Reschedule button (existing) */}
            <CButton
              style={{
                backgroundColor: 'var(--color-black)',
                color: 'white',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 600,
              }}
              disabled={selectedSlots.length === 0}
              onClick={bookSlot}
            >
              {reschedule
                ? 'Reschedule'
                : `Pay at Hospital ${selectedSlots ? `(${selectedSlots})` : ''}`}
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </div>
  )
}

export default InProgressAppointmentsPage
