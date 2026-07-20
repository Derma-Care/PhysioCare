import React, { useEffect, useState } from 'react'
import {
  CButton, CCol, CFormInput, CModal, CModalBody,
  CModalHeader, CModalTitle, CRow,
} from '@coreui/react'
import { getBookingsForFollowUps } from '../../APIs/GetFollowUpApi'
import { getBookingsByPatientId } from '../../APIs/GetpatinetData'
import { showCustomToast } from '../../Utils/Toaster'
import { COLORS } from '../../Constant/Themes'

const BookingSearch = ({ visitType, fetchSlots, onSelectBooking, onProceed }) => {
  const [patientSearch, setPatientSearch] = useState('')
  const [bookingData, setBookingData] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')

  const formatAddress = (address) => {
    if (!address) return ''
    const { houseNo, street, landmark, city, state, country, postalCode } = address
    return [houseNo, street, landmark, city, state, country, postalCode].filter(Boolean).join(', ')
  }

  const getInitials = (name) =>
    name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

  const fetchBookings = async (apiFunc, searchValue) => {
    const query = searchValue?.trim()
    if (!query) return
    setLoading(true)
    setSearchMessage('')
    setBookingData([])
    try {
      const res = await apiFunc(query)
      const rawItems = Array.isArray(res?.data?.data) ? res.data.data : [res?.data?.data]
      const validItems = rawItems.filter((item) => item?.patientId && item?.name)
      if (validItems.length === 0) {
        setSearchMessage(visitType === 'followup'
          ? 'No follow-up booking found for this Booking ID.'
          : 'No patient found.')
        if (visitType !== 'followup') showCustomToast('No patient records found.', 'info')
      } else {
        setBookingData(validItems.map((item) => ({
          ...item, patientAddress: visitType === 'followup' ? item?.patientAddress : formatAddress(item.patientAddress),
        })))
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong while fetching data.'
      setSearchMessage(msg)
      showCustomToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    const trimmed = patientSearch.trim()
    if (!trimmed) { showCustomToast('Please enter a valid Patient ID / Name / Mobile', 'error'); return }
    setSelectedBooking(null); setConfirmed(false); setModalVisible(false)
    await fetchBookings(visitType === 'followup' ? getBookingsForFollowUps : getBookingsByPatientId, trimmed)
  }

  const handleClear = () => {
    setPatientSearch(''); setBookingData([]); setSearchMessage('')
    setSelectedBooking(null); setConfirmed(false); setModalVisible(false)
  }

  useEffect(() => {
    setBookingData([]); setSearchMessage('')
    setSelectedBooking(null); setConfirmed(false); setModalVisible(false)
  }, [visitType])

  const handleSelectBooking = async (booking) => {
    if (visitType === 'followup') {
      if (!booking?.doctorId) { showCustomToast('Doctor details missing for this booking.', 'error'); return }
      try { await fetchSlots(booking.doctorId) } catch (err) { console.error(err) }
    }
    setConfirmed(false)
    setSelectedBooking(booking)
    onSelectBooking?.(booking)
    setModalVisible(true)
  }

  const handleConfirmAndProceed = () => {
    setModalVisible(false)
    setConfirmed(true)
  }

  const cardStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
    background: isActive ? '#e6f1fb' : 'white',
    border: `0.5px solid ${isActive ? '#378add' : '#dee2e6'}`,
    borderRadius: 10, marginBottom: 6, cursor: 'pointer', transition: 'all .15s',
  })

  const avatarStyle = {
    width: 40, height: 40, borderRadius: '50%', background: '#b5d4f4',
    color: '#0c447c', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0,
  }

  const badgeStyle = (isFollowup) => ({
    fontSize: 11, padding: '3px 9px', borderRadius: 20, fontWeight: 500,
    background: isFollowup ? '#faeeda' : '#eaf3de',
    color: isFollowup ? '#854f0b' : '#3b6d11',
  })

  console.log(selectedBooking)

  return (
    <div>
      {/* Search Bar */}
      <CRow className="mb-3">
        <CCol md={9}>
          <CFormInput
            type="text"
            placeholder={visitType === 'followup' ? 'Search by Booking ID' : 'Search by Name / Patient ID / Mobile'}
            value={patientSearch}
            // style={{ textTransform: 'uppercase' }}
            onChange={(e) => setPatientSearch(e.target.value.trimStart())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </CCol>
        <CCol md={3} className="d-flex gap-2">
          <CButton style={{ color: 'white', backgroundColor: COLORS.primary }} onClick={handleSearch} disabled={loading} className="flex-grow-1">
            {loading ? 'Searching...' : 'Search'}
          </CButton>
          <CButton color="secondary" variant="outline" onClick={handleClear} disabled={loading} className="flex-grow-1">
            Clear
          </CButton>
        </CCol>
      </CRow>

      {/* Patient List */}
      {bookingData.length > 0 && !confirmed && (
        <div className="mb-3">
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.07em', color: '#6c757d', textTransform: 'uppercase', marginBottom: 8 }}>
            {bookingData.length} patient{bookingData.length > 1 ? 's' : ''} found
          </div>
          {bookingData.map((item) => (
            <div key={item.patientId} style={cardStyle(selectedBooking?.patientId === item.patientId)} onClick={() => handleSelectBooking(item)}>
              <div style={avatarStyle}>{getInitials(item.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>
                  {item.patientId} · {item.gender}, {item.age}y · {visitType === 'followup' ? item.doctorName || '—' : ''}
                </div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>{item.branchname || '—'}</div>
              </div>
              {
                visitType === 'followup' && (
                  <span style={badgeStyle(item.status === 'Follow-up')}>{item.status}</span>

                )
              }
              <span style={{ color: '#6c757d', fontSize: 16 }}>›</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && bookingData.length === 0 && searchMessage && !confirmed && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '0.5px dashed #dee2e6', borderRadius: 10, color: '#6c757d' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 14 }}>{searchMessage}</div>
        </div>
      )}

      {/* ✅ Proceed Bar */}
      {confirmed && selectedBooking && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', background: '#e6f1fb', border: '0.5px solid #b5d4f4',
          borderRadius: 10, marginTop: 8,
        }}>
          <div>
            <div style={{ fontSize: 13, color: '#0c447c', fontWeight: 500 }}>
              ✓ {selectedBooking.name} selected
            </div>
            <div style={{ fontSize: 12, color: '#185fa5', marginTop: 2 }}>
              {selectedBooking.patientId} · {selectedBooking.doctorName} · {selectedBooking.branchname}
            </div>
          </div>
          {/* <CButton style={{ background: COLORS.primary, color: '#fff', border: 'none' }} onClick={() => onProceed?.()}>
            Continue to slots →
          </CButton> */}
        </div>
      )}

      {/* Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>{visitType === 'followup' ? 'Booking Details' : 'Patient Details'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBooking && (
            <div>
              {/* Avatar row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ ...avatarStyle, width: 52, height: 52, fontSize: 16 }}>{getInitials(selectedBooking.name)}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{selectedBooking.name}</div>
                  <div style={{ fontSize: 13, color: '#6c757d' }}>{selectedBooking.patientId}</div>
                </div>
              </div>

              {/* Detail grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                {[
                  ['Customer ID', selectedBooking.customerId],
                  ['Age / Gender', `${selectedBooking.age}y, ${selectedBooking.gender}`],
                  ['Mobile', selectedBooking.mobileNumber || selectedBooking.patientMobileNumber],

                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: '#6c757d', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{val || '—'}</div>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#6c757d', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>Address</div>
                  <div style={{ fontSize: 13, marginTop: 2 }}>{selectedBooking.patientAddress || '—'}</div>
                </div>
              </div>

              {visitType === 'followup' && (
                <>
                  <hr style={{ margin: '16px 0', borderColor: '#dee2e6' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                    {[
                      ['Visit Type', selectedBooking.visitType],
                      ['Doctor', selectedBooking.doctorName],
                      ['Consultation Type', selectedBooking.consultationType],
                      ['Consultation Fee', `₹${selectedBooking?.listOfConsultationFee?.[0]?.consulationFee || selectedBooking.consultationFee || 0}`],
                      // ['Total Fee', `₹${selectedBooking.totalFee}`],
                      ['Service Start Date', selectedBooking.serviceDate],
                      ['Service Time', selectedBooking.servicetime],
                      ['Clinic', selectedBooking.clinicName],
                      ['Branch', selectedBooking.branchname],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: 11, color: '#6c757d', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                        <div style={{ fontSize: 13, marginTop: 2 }}>{val || '—'}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                <CButton color="secondary" variant="outline" onClick={() => setModalVisible(false)}>Cancel</CButton>
                <CButton style={{ background: COLORS.primary, color: '#fff', border: 'none' }} onClick={handleConfirmAndProceed}>
                  Confirm & Continue →
                </CButton>
              </div>
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default BookingSearch
