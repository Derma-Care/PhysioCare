import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CFormInput,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { getInProgressfollowupBookings } from '../../APIs/GetFollowUpApi'
import { getBookingsByPatientId } from '../../APIs/GetpatinetData'
import { showCustomToast } from '../../Utils/Toaster'

const BookingSearch = ({
  visitType,
  fetchSlots,

  onSelectBooking,
}) => {
  const [patientSearch, setPatientSearch] = useState('')
  const [bookingData, setBookingData] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  // 🧠 Common API handler
  const fetchBookings = async (apiFunc, searchValue) => {
    const query = searchValue?.trim()
    if (!query) return

    setLoading(true)
    try {
      const res = await apiFunc(query)

      setBookingData(res?.data?.data || [])
      console.log('Fetched bookings:', res?.data?.data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setBookingData([])
    } finally {
      setLoading(false)
    }
  }

  // 🔍 Manual search on button click
  const handleSearch = async () => {
    if (!patientSearch.trim()) {
      showCustomToast('Please enter a valid Patient ID / Name / Mobile','error')
      return
    }

    // Reset previous selection
    setSelectedBooking(null)
    setModalVisible(false)

    if (visitType === 'followup') {
      await fetchBookings(getInProgressfollowupBookings, patientSearch)
    } else {
      await fetchBookings(getBookingsByPatientId, patientSearch)
    }
  }

  // ⚡ Auto-fetch on typing (debounced)
  useEffect(() => {
    if (!patientSearch.trim()) {
      setBookingData([])
      setSelectedBooking(null)
      setModalVisible(false)
      return
    }

    const delayDebounce = setTimeout(async () => {
      setSelectedBooking(null) // Reset before new fetch
      setModalVisible(false)
      if (visitType === 'followup') {
        await fetchBookings(getInProgressfollowupBookings, patientSearch)
      } else {
        await fetchBookings(getBookingsByPatientId, patientSearch)
      }
    }, 600)

    return () => clearTimeout(delayDebounce)
  }, [patientSearch, visitType])

  // // ⚡ Auto-fetch on typing (debounced)
  // useEffect(() => {
  //   if (!patientSearch.trim()) {
  //     setBookingData([])
  //     return
  //   }

  //   const delayDebounce = setTimeout(async () => {
  //     if (visitType === 'followup') {
  //       const res = await fetchBookings(getInProgressfollowupBookings, patientSearch)
  //       console.log(bookingData.doctorId)
  //       // await fetchSlots(res.doctorId)
  //     } else {
  //       fetchBookings(getBookingsByPatientId, patientSearch)
  //     }
  //   }, 600) // wait 600ms after typing stops

  //   return () => clearTimeout(delayDebounce)
  // }, [patientSearch, visitType])

  //   const handleSelectBooking = async (booking) => {
  //     console.log(booking.doctorId)
  //     console.log(booking.doctorId)
  //     await fetchSlots(booking.doctorId)
  //     setSelectedBooking(booking)
  //     onSelectBooking?.(booking) // ✅ send to parent
  //     setModalVisible(true)
  //   }
  const handleSelectBooking = async (booking) => {
    if (visitType === 'followup') {
      if (!booking?.doctorId) {
        console.warn('Doctor ID missing for follow-up booking:', booking)
        showCustomToast('Doctor details missing for this booking.','error')
        return
      }

      try {
        await fetchSlots(booking.doctorId)
      } catch (err) {
        console.error('Error fetching slots:', err)
        // showCustomToast('Failed to load doctor slots.','error')
      }
    }

    setSelectedBooking(booking)
    onSelectBooking?.(booking)
    setModalVisible(true)
  }

  return (
    <div>
      {/* 🔍 Search Bar */}
      <CRow className="mb-3">
        <CCol md={10}>
          <CFormInput
            type="text"
            placeholder={visitType === 'followup' ? "Search by Patient ID":"Search by Name / Patient ID / Mobile"}
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
        </CCol>
        <CCol md={2}>
          <CButton  style={{color:"white",backgroundColor:"var(--color-black)"}} onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </CButton>
        </CCol>
      </CRow>

      {/* 📋 Booking List */}
      {Array.isArray(bookingData) && bookingData.length > 0
        ? !selectedBooking &&
          Array.isArray(bookingData) &&
          bookingData.length > 0 && (
            <CListGroup className="shadow-sm mb-4">
              {bookingData.map((item) => (
                <CListGroupItem
                  key={item.bookingId}
                  action
                  onClick={() => handleSelectBooking(item)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <strong>{item.name}</strong>
                  <span className="text-muted">{item.patientId}</span>
                  <span className="text-muted">{item.doctorName}</span>
                  <span className="text-muted">{item.branchname}</span>
                </CListGroupItem>
              ))}
            </CListGroup>
          )
        : !loading &&
          patientSearch && (
            <p className="text-muted">
              {visitType === 'followup'
                ? `No bookings found for ${patientSearch}`
                : `No Patient details found for ${patientSearch}`}
            </p>
          )}
      {/* {visitType === 'followup' && (
        <div className="mt-4 text-end d-flex justify-content-end gap-2">
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>

          <CButton
            onClick={() => handleFollowUpSubmit(selectedBooking)}
            style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
          >
            Submit
          </CButton>
        </div>
      )} */}

      {/* 🧾 Modal */}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
        backdrop="static"
        className="custom-modal"
      >
        <CModalHeader>
          <CModalTitle>
            {visitType === 'followup' ? 'Booking Details' : 'Patient Details'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBooking && (
            <div>
              <p>
                <strong>Name:</strong> {selectedBooking.name}
              </p>
              <p>
                <strong>Patient ID:</strong> {selectedBooking.patientId}
              </p>
              <p>
                <strong>customer ID:</strong> {selectedBooking.customerId}
              </p>
              <p>
                <strong>age:</strong> {selectedBooking.age}
              </p>
              <p>
                <strong>Gender:</strong> {selectedBooking.gender}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedBooking.mobileNumber}
              </p>

              <p>
                <strong>Address:</strong> {selectedBooking.patientAddress}
              </p>

              {/* 🧠 Conditional Info based on visitType */}
              {visitType === 'followup' && (
                <>
                  <hr />
                  <p>
                    <strong>Visit Type:</strong> {selectedBooking.visitType}
                  </p>
                  <p>
                    <strong>Consultation Type:</strong> {selectedBooking.consultationType}
                  </p>
                  <p>
                    <strong>Consultation Fee:</strong> ₹{selectedBooking.consultationFee}
                  </p>
                  <p>
                    <strong>Total Fee:</strong> ₹{selectedBooking.totalFee}
                  </p>
                  <p>
                    <strong>Service Date:</strong> {selectedBooking.serviceDate}
                  </p>
                  <p>
                    <strong>Service Time:</strong> {selectedBooking.servicetime}
                  </p>
                  <p>
                    <strong>Doctor:</strong> {selectedBooking.doctorName}
                  </p>
                  <p>
                    <strong>Clinic:</strong> {selectedBooking.clinicName}
                  </p>
                  <p>
                    <strong>Branch:</strong> {selectedBooking.branchname}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedBooking.status}
                  </p>
                </>
              )}
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default BookingSearch
