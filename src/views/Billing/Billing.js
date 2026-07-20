import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
} from '@coreui/react'
import { AppointmentData } from '../AppointmentManagement/appointmentAPI'
import Select from 'react-select'
import ProgramPayment from '../AppointmentManagement/PaymentProgram'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'
import { useHospital } from '../Usecontext/HospitalContext'
import { useNavigate } from 'react-router-dom'

/* ── status badge config ── */
const STATUS_CONFIG = {
  active: { bg: '#e8f5e9', color: '#2e7d32', dot: '#43a047' },
  'in-progress': { bg: '#fff8e1', color: '#f57f17', dot: '#ffc107' },
  completed: { bg: '#e3f2fd', color: '#1565c0', dot: '#1e88e5' },
  'follow-up': { bg: '#f3e5f5', color: '#6a1b9a', dot: '#8e24aa' },
}

const statusStyle = (status = '') => STATUS_CONFIG[status.toLowerCase()] || { bg: '#f5f5f5', color: '#555', dot: '#999' }

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

/* ── custom option renderer for react-select ── */
const BookingOption = ({ data, innerRef, innerProps, isFocused, isSelected }) => {


  const b = data.value
  const s = statusStyle(b.status)
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        background: isSelected ? '#e8f0fb' : isFocused ? '#f5f7fa' : '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.primary}55)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 15, color: COLORS.primary,
      }}>
        {(b.name || '?')[0].toUpperCase()}
      </div>

      {/* Details — two rows */}
      <div style={{ minWidth: 0 }}>
        {/* Row 1: Name + Booking ID */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {b.name || 'Unknown'}
          </span>
          <span style={{
            fontSize: 11, color: '#fff', background: COLORS.primary,
            padding: '1px 7px', borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            #{b.bookingId}
          </span>
        </div>
        {/* Row 2: Date + Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDate(b.serviceDate || b.appointmentDate || b.date || b.createdAt)}
          </span>
          <span style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.93v2z" /></svg>
            {b.mobileNumber || b.patientMobileNumber || b.mobile || 'N/A'}
          </span>
        </div>
      </div>

      {/* Status badge — right-aligned */}
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
        background: s.bg, color: s.color,
        display: 'flex', alignItems: 'center', gap: 4,
        textTransform: 'capitalize', whiteSpace: 'nowrap',
        border: `1px solid ${s.dot}44`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
        {b.status}
      </span>
    </div>
  )
}

/* ── custom single value shown after selection ── */
const BookingSingleValue = ({ data }) => {
  const b = data.value
  const s = statusStyle(b.status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{b.name}</span>
      <span style={{ fontSize: 11, color: '#888' }}>#{b.bookingId}</span>
      <span style={{ fontSize: 11, color: '#666' }}>· {formatDate(b.serviceDate || b.date || b.createdAt)}</span>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
        background: s.bg, color: s.color, textTransform: 'capitalize',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
        {b.status}
      </span>
    </div>
  )
}

/* ── stat card ── */
const StatCard = ({ label, value, accent }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 12,
      padding: '12px 18px',
      border: '1px solid #e5e7eb',
      borderLeft: `5px solid ${accent}`,
      minWidth: 220,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.2s ease',
    }}
  >
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: '#555',
      }}
    >
      {label}
    </span>

    <span
      style={{
        fontSize: 24,
        fontWeight: 800,
        color: accent,
      }}
    >
      {value}
    </span>
  </div>
);

export default function Billing() {
  const [bookings, setBookings] = useState([])
  const [allData, setAllData] = useState([])      // all bookings (for stat counts)
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role');
  const { globalBranchId } = useHospital() || {};

  useEffect(() => {
    if (globalBranchId) {
      fetchBookings(globalBranchId);
    }
  }, [globalBranchId]);

  const fetchBookings = async (branchIdOverride = globalBranchId) => {
    try {
      setLoading(true)
      const res = await AppointmentData(branchIdOverride)
      const data = res?.data || []
      setAllData(data)                          // keep full list for counts
      setBookings(data)                         // show all in dropdown
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const EXCLUDED_STATUSES = ['pending', 'confirmed']
  const bookingOptions = bookings
    .filter(b => !EXCLUDED_STATUSES.includes((b.status || '').toLowerCase()))
    .map(b => ({
      value: b,
      label: [b.bookingId, b.name, b.mobileNumber, b.mobile].filter(Boolean).join(' '),
    }))

  /* dynamic counts from ALL backend data */
  const counts = allData.reduce((acc, b) => {
    const k = (b.status || 'unknown').toLowerCase()
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})

  /* color palette for known + unknown statuses */
  const STATUS_COLORS = {
    'active': { accent: '#2e7d32', bg: '#e8f5e9' },
    'in-progress': { accent: '#f57f17', bg: '#fff8e1' },
    'completed': { accent: '#1565c0', bg: '#e3f2fd' },
    'follow-up': { accent: '#6a1b9a', bg: '#f3e5f5' },
    'pending': { accent: '#00838f', bg: '#e0f7fa' },
    'cancelled': { accent: '#c62828', bg: '#ffebee' },
    'scheduled': { accent: '#4527a0', bg: '#ede7f6' },
    'due for investigation': { accent: '#e65100', bg: '#fff3e0' },
    'unknown': { accent: '#546e7a', bg: '#eceff1' },
  }
  const getColor = (status) => STATUS_COLORS[status] || { accent: '#546e7a', bg: '#eceff1' }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h4
            style={{
              color: COLORS.primary,
              fontWeight: 800,
              margin: '0 0 2px',
              fontSize: 22,
            }}
          >
            Billing
          </h4>
          <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
            Select a booking to view and manage payment
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">

          {!loading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {[
                { key: 'in-progress', label: 'In Progress' },
                { key: 'due for investigation', label: 'Due for Investigation' },
              ].map(({ key, label }) => {
                const s = statusStyle(key);

                return (
                  <StatCard
                    key={key}
                    label={label}
                    value={counts[key] || 0}
                    accent={s.color}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          height: 1,
          backgroundColor: COLORS.primary,
          // marginTop: 12,
          marginBottom: 12,
          borderRadius: 2,
        }}
      />
      {/* Booking selector card */}
      {/* <CCard style={{ border: '1px solid #d0dce9', borderRadius: 12, overflow: 'visible', marginBottom: 20, boxShadow: '0 2px 8px rgba(27,79,138,0.07)' }}> */}

      {/* <CCardBody style={{ padding: '20px' }}> */}
      <CRow style={{ alignItems: 'flex-start', marginBottom: 12 }}>
        {loading ? (
          <CCol xs={12}>
            <LoadingIndicator message="Loading bookings..." />
          </CCol>
        ) : (
          <>
            <CCol xs={12} md={8} lg={8} xl={9}>
              <Select
                options={bookingOptions}
                onChange={(opt) => setSelectedBooking(opt ? opt.value : null)}
                placeholder="Search by name, booking ID or phone…"
                isClearable
                components={{ Option: BookingOption, SingleValue: BookingSingleValue }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: 44,
                    borderRadius: 8,
                    borderColor: state.isFocused ? COLORS.primary : '#d1d5db',
                    boxShadow: state.isFocused ? `0 0 0 2px ${COLORS.primary}30` : '0 1px 3px rgba(0,0,0,0.05)',
                    fontSize: 13,
                    '&:hover': { borderColor: COLORS.primary },
                  }),
                  menu: (base) => ({ ...base, borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', border: '1px solid #e8edf3', zIndex: 9999, minWidth: '100%' }),
                  menuList: (base) => ({ ...base, padding: 4, maxHeight: 320 }),
                  placeholder: (base) => ({ ...base, color: '#aaa', fontSize: 13 }),
                  clearIndicator: (base) => ({ ...base, color: '#999', '&:hover': { color: '#e53e3e' } }),
                }}
              />
              <p style={{ fontSize: 11, color: '#999', marginTop: 6, marginBottom: 0 }}>
                {bookings.length} bookings available · search by name, ID, or phone
              </p>
            </CCol>
            {/* TODO: deploymenet next Underworking */}
            {/* <CCol xs={12} md={4} lg={4} xl={3} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => navigate('/manual-billing')}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.sideColor || '#1a3a6b'})`,
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(27,79,138,0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: 44
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(27,79,138,0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(27,79,138,0.2)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Manual Bill
              </button>
            </CCol> */}
          </>
        )}
      </CRow>

      {/* Selected booking summary strip */}
      {selectedBooking && (() => {
        const s = statusStyle(selectedBooking.status)
        return (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8,
            background: '#f8faff', border: `1px solid ${COLORS.primary}22`,
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.primary}55)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16, color: COLORS.primary,
              }}>
                {(selectedBooking.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>{selectedBooking.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>Booking #{selectedBooking.bookingId}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '📅', label: 'Date', val: formatDate(selectedBooking.serviceDate || selectedBooking.appointmentDate || selectedBooking.date || selectedBooking.createdAt) },
                { icon: '📱', label: 'Mobile', val: selectedBooking.mobileNumber || selectedBooking.mobile || 'N/A' },
                { icon: '🏥', label: 'Doctor', val: selectedBooking.doctorName || selectedBooking.doctorId || 'N/A' },
              ].map(({ icon, label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{icon} {val}</div>
                </div>
              ))}
            </div>

            <span style={{
              marginLeft: 'auto', fontSize: 12, fontWeight: 600, padding: '4px 12px',
              borderRadius: 20, background: s.bg, color: s.color, textTransform: 'capitalize',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
              {selectedBooking.status}
            </span>
          </div>
        )
      })()}
      {/* </CCardBody> */}
      {/* </CCard> */}

      {/* Payment component */}
      {selectedBooking && (
        <ProgramPayment
          key={selectedBooking.bookingId}
          paymentProps={{
            bookingId: selectedBooking.bookingId,
            doctorId: selectedBooking.doctorId,
            clinicId: selectedBooking.clinicId,
            branchId: selectedBooking.branchId,
            patientId: selectedBooking.patientId,
          }}
          isBillingTab={true}
          onPaymentSuccess={() => setSelectedBooking(null)}
        />
      )}
    </div>
  )
}
