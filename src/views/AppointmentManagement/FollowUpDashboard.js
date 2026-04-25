import React, { useEffect, useMemo, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../Utils/Pagination'
import {
  getBookingsTodayFollowUps,
  getUpcomingFollowUps,
  getDateRangeFollowUps,
} from '../../APIs/GetFollowUpApi'
import { bookingUpdate } from './appointmentAPI'
import LoadingIndicator from '../../Utils/loader'
import capitalizeWords from '../../Utils/capitalizeWords'
import BookAppointmentModal from './BookAppointmentModal '
import axios from 'axios'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { BASE_URL } from '../../baseUrl'

/* ─── Status list ─────────────────────────────────────────────────────── */
const followUpStatus = [
  'All', 'Pending', 'Confirmed', 'Due for Investigation',
  'Investigation Done', 'Follow-up Needed', 'Cancelled',
  'Rescheduled', 'Drop', 'No Reply', 'Completed',
]

/* ─── Status colour map (pm-* pill style) ────────────────────────────── */
const statusColorMap = {
  pending:               { bg: '#fff8e1', color: '#92680a', border: '#f0d080' },
  confirmed:             { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
  completed:             { bg: '#eaf3de', color: '#3b6d11', border: '#c0dd97' },
  'due for investigation':{ bg: '#fcebeb', color: '#a32d2d', border: '#f4b5b5' },
  'investigation done':  { bg: '#e6f1fb', color: '#185fa5', border: '#b5d4f4' },
  'in-progress':         { bg: '#e6f1fb', color: '#185fa5', border: '#b5d4f4' },
  'in progress':         { bg: '#e6f1fb', color: '#185fa5', border: '#b5d4f4' },
  'follow-up needed':    { bg: '#f3f0ff', color: '#5b21b6', border: '#c4b5fd' },
  cancelled:             { bg: '#fcebeb', color: '#a32d2d', border: '#f4b5b5' },
  rescheduled:           { bg: '#fff8e1', color: '#92680a', border: '#f0d080' },
  drop:                  { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  'no reply':            { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
}

const getStatusStyle = (status) =>
  statusColorMap[(status || '').trim().toLowerCase()] ||
  { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }

/* ─── Stat card ──────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, active, onClick }) => (
  <CCard
    onClick={onClick}
    className="wd-stat-card"
    style={{ border: active ? '2px solid #185fa5' : '0.5px solid #d0dce9' }}
  >
    <CCardBody className="d-flex align-items-center justify-content-between py-3 px-3">
      <div className="d-flex align-items-center gap-3">
        <div className="wd-stat-icon" style={{ background: active ? '#185fa5' : '#e6f1fb', color: active ? '#fff' : '#185fa5' }}>
          {icon}
        </div>
        <div>
          <div className="wd-stat-label">{label}</div>
          <div className="wd-stat-value">{value}</div>
        </div>
      </div>
      <CIcon icon={cilArrowRight} style={{ width: '14px', height: '14px', color: '#b5d4f4' }} />
    </CCardBody>
  </CCard>
)

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════ */
export default function FollowupDashboard() {
  const navigate = useNavigate()

  const [activeCard, setActiveCard] = useState('today')
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [todayCount, setTodayCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const role = localStorage.getItem('role')
  const [visible, setVisible] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reason, setReason] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const { searchQuery } = useGlobalSearch()
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [showAllSlots, setShowAllSlots] = useState(false)

  /* ── API calls ────────────────────────────────────────────────────── */
  const updatePaymentStatus = async (bookingId, status, row, reason, newDate, newTime) => {
    const payload = { bookingId, followupStatus: status.toLowerCase(), reason }
    if (status === 'Rescheduled') { payload.serviceDate = newDate; payload.servicetime = newTime }
    await bookingUpdate(payload)
  }

  const fetchSlots = async (doctorId, branchId) => {
    try {
      setLoadingSlots(true)
      const hospitalId = localStorage.getItem('HospitalId')
      const response = await axios.get(`${BASE_URL}/getDoctorSlots/${hospitalId}/${branchId}/${doctorId}`)
      setSlotsForSelectedDate(response.data.success ? response.data.data || [] : [])
    } catch { setSlotsForSelectedDate([]) }
    finally { setLoadingSlots(false) }
  }

  const now = new Date()
  const slotsToShow = (slotsForSelectedDate || [])
    .filter(s => new Date(s.day || s.date).toDateString() === new Date(newDate).toDateString())
    .flatMap(s => s.availableSlots || [])
    .filter(slotObj => {
      const slotDate = new Date(newDate)
      const [time, meridian] = slotObj.slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      slotDate.setHours(hours, minutes, 0, 0)
      return new Date(newDate).toDateString() !== now.toDateString() || slotDate > now
    })
  const sortedSlots = slotsToShow.sort((a, b) => {
    const parseTime = s => {
      const [t, m] = s.slot.split(' '); let [h, min] = t.split(':').map(Number)
      if (m === 'PM' && h !== 12) h += 12; if (m === 'AM' && h === 12) h = 0
      return h * 60 + min
    }
    return parseTime(a) - parseTime(b)
  })
  const visibleSlots = showAllSlots ? sortedSlots : sortedSlots.slice(0, 12)

  const submitReasonUpdate = async () => {
    try {
      const payload = { bookingId: selectedRow?.bookingId, followupStatus: selectedStatus.toLowerCase(), reason }
      if (selectedStatus === 'Rescheduled') { payload.serviceDate = newDate; payload.servicetime = newTime }
      await bookingUpdate(payload)
      setShowReasonModal(false)
      getTodayFollowUps()
    } catch (err) { console.error(err) }
  }

  useEffect(() => { getTodayFollowUps() }, [])

  const getTodayFollowUps = async () => {
    setLoading(true)
    try {
      const res = await getBookingsTodayFollowUps()
      if (res.status === 200) {
        const d = Array.isArray(res?.data?.data) ? res.data.data : []
        setRows(d); setTodayCount(d.length)
        setConfirmedCount(d.filter(x => (x.status || '').toLowerCase() === 'confirmed').length)
        setInProgressCount(d.filter(x => (x.status || '').toLowerCase() === 'in progress').length)
      } else setRows([])
    } catch { setRows([]) }
    finally { setLoading(false) }
  }

  const getUpcomingAppointments = async () => {
    setLoading(true)
    try {
      const res = await getUpcomingFollowUps()
      if (res.status === 200) {
        const d = Array.isArray(res?.data?.data) ? res.data.data : []
        setRows(d); setWeekCount(d.length)
        setConfirmedCount(d.filter(x => (x.status || '').toLowerCase() === 'confirmed').length)
        setInProgressCount(d.filter(x => (x.status || '').toLowerCase() === 'in progress').length)
      } else setRows([])
    } catch { setRows([]) }
    finally { setLoading(false) }
  }

  const getDateRangeAppointments = async () => {
    if (!fromDate || !toDate) return
    setLoading(true)
    try {
      const res = await getDateRangeFollowUps(fromDate, toDate)
      const d = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : []
      setRows(d); setCurrentPage(1)
    } catch { setRows([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (fromDate && toDate) getDateRangeAppointments() }, [fromDate, toDate])

  const list = useMemo(() => rows.filter(row => {
    const matchStatus = filter === 'All' ||
      (row.followUpStatus || '').toLowerCase() === filter.toLowerCase() ||
      (row.status || '').toLowerCase() === filter.toLowerCase()
    const search = searchQuery.toLowerCase()
    const matchSearch = !search ||
      (row.bookingId || '').toLowerCase().includes(search) ||
      (row.name || '').toLowerCase().includes(search) ||
      (row.patientMobileNumber || '').toLowerCase().includes(search) ||
      (row.doctorName || '').toLowerCase().includes(search) ||
      (row.paymentType || '').toLowerCase().includes(search) ||
      (row.visitType || '').toLowerCase().includes(search) ||
      (row.status || '').toLowerCase().includes(search)
    return matchStatus && matchSearch
  }), [rows, filter, searchQuery])

  const startIndex = (currentPage - 1) * pageSize
  const paginatedRows = list.slice(startIndex, startIndex + pageSize)

  const filterBtnBase = {
    fontSize: '12px', fontWeight: '500', padding: '5px 13px',
    borderRadius: '6px', cursor: 'pointer', lineHeight: '1.5',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    whiteSpace: 'nowrap', transition: 'background 0.15s, color 0.15s',
    border: '0.5px solid #d0dce9',
  }
  const filterBtnActive = {
    ...filterBtnBase, backgroundColor: '#185fa5', color: '#fff',
    border: '0.5px solid #185fa5', boxShadow: '0 2px 8px rgba(24,95,165,0.18)',
  }
  const filterBtnInactive = { ...filterBtnBase, backgroundColor: '#f0f5fb', color: '#374151' }

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <>
      <CContainer fluid className="px-3 py-3">

        {/* ── STAT CARDS ────────────────────────────────────────────────── */}
        <CRow className="mb-4 g-3">
          <CCol md={3} xs={6}>
            <StatCard icon="📅" label="Today" value={todayCount} active={activeCard === 'today'}
              onClick={() => { setActiveCard('today'); getTodayFollowUps(); setCurrentPage(1) }} />
          </CCol>
          <CCol md={3} xs={6}>
            <StatCard icon="🗓️" label="1 Week" value={weekCount} active={activeCard === 'upcoming'}
              onClick={() => { setActiveCard('upcoming'); getUpcomingAppointments(); setCurrentPage(1) }} />
          </CCol>
          <CCol md={3} xs={6}>
            <StatCard icon="✅" label="Confirmed" value={confirmedCount} active={activeCard === 'confirmed'}
              onClick={() => { setActiveCard('confirmed'); setFilter('Confirmed'); setCurrentPage(1) }} />
          </CCol>
          <CCol md={3} xs={6}>
            <StatCard icon="⏳" label="In Progress" value={inProgressCount} active={activeCard === 'inprogress'}
              onClick={() => { setActiveCard('inprogress'); setFilter('In Progress'); setCurrentPage(1) }} />
          </CCol>
        </CRow>

        {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
        <div className="wd-page-header">
          <div className="wd-page-title-group">
            <div className="wd-page-icon">
              {/* Follow-up icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>
            <div>
              <h4 className="wd-page-title">Follow-up Appointments</h4>
              <p className="wd-page-sub">{list.length} appointment{list.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="wd-header-right">
            {/* Quick status pills */}
            {['All', 'Pending', 'Confirmed', 'Completed'].map(s => (
              <button
                key={s}
                style={filter === s ? filterBtnActive : filterBtnInactive}
                onClick={() => { setFilter(s); setCurrentPage(1) }}
              >
                {s}
              </button>
            ))}

            <div className="wd-divider" />

            {/* From date */}
            <div className="wd-date-group">
              <label className="wd-date-label">From</label>
              <input type="date" value={fromDate} className="wd-date-input"
                onChange={e => { setFromDate(e.target.value); setCurrentPage(1) }} />
            </div>

            {/* To date */}
            <div className="wd-date-group">
              <label className="wd-date-label">To</label>
              <input type="date" value={toDate} className="wd-date-input"
                onChange={e => { setToDate(e.target.value); setCurrentPage(1) }} />
            </div>

            {/* Full status dropdown */}
            <div className="wd-date-group">
              <label className="wd-date-label">Status</label>
              <select value={filter} className="wd-select"
                onChange={e => { setFilter(e.target.value); setCurrentPage(1) }}>
                {followUpStatus.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Book button */}
            {(role === 'admin' || role === 'receptionist') && (
              <button style={{ ...filterBtnActive, alignSelf: 'flex-end' }} onClick={() => setVisible(true)}>
                + Book Appointment
              </button>
            )}
          </div>
        </div>

        <BookAppointmentModal visible={visible} onClose={() => setVisible(false)} />

        {/* ── TABLE ─────────────────────────────────────────────────────── */}
        <div className="wd-table-wrapper">
          <CTable className="wd-table">
            <CTableHead>
              <CTableRow>
                {['S.No', 'Booking Id', 'Date', 'Time', 'Patient Name', 'Mobile', 'Doctor', 'Payment', 'Visit Type', 'Status', 'Update', 'Action'].map(h => (
                  <CTableHeaderCell key={h} className="wd-th">{h}</CTableHeaderCell>
                ))}
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {loading ? (
                <CTableRow>
                  <CTableDataCell colSpan={12} className="wd-td" style={{ padding: '32px 0' }}>
                    <LoadingIndicator message="Loading appointments..." />
                  </CTableDataCell>
                </CTableRow>
              ) : paginatedRows.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={12} className="wd-td">
                    <div className="wd-empty">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="wd-empty-icon">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      <p>No appointments found</p>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                paginatedRows.map((row, index) => {
                  const st = getStatusStyle(row.status)
                  const fu = getStatusStyle(row.followUpStatus || row.followupStatus)
                  return (
                    <CTableRow key={row.bookingId} className="wd-tr">
                      <CTableDataCell className="wd-td wd-td-num">
                        {(currentPage - 1) * pageSize + index + 1}
                      </CTableDataCell>

                      <CTableDataCell className="wd-td">
                        <span className="wd-booking-id">{row.bookingId}</span>
                      </CTableDataCell>

                      <CTableDataCell className="wd-td">{row.serviceDate}</CTableDataCell>
                      <CTableDataCell className="wd-td">{row.servicetime}</CTableDataCell>

                      <CTableDataCell className="wd-td">
                        <span className="wd-name">{row.name}</span>
                      </CTableDataCell>

                      <CTableDataCell className="wd-td">{row.patientMobileNumber}</CTableDataCell>
                      <CTableDataCell className="wd-td">{row.doctorName}</CTableDataCell>
                      <CTableDataCell className="wd-td">{row.paymentType}</CTableDataCell>
                      <CTableDataCell className="wd-td">{capitalizeWords(row.visitType)}</CTableDataCell>

                      {/* Appointment status pill */}
                      <CTableDataCell className="wd-td">
                        <span className="wd-status-badge" style={{ background: st.bg, color: st.color, border: `0.5px solid ${st.border}` }}>
                          {row.status}
                        </span>
                      </CTableDataCell>

                      {/* Follow-up status dropdown */}
                      <CTableDataCell className="wd-td">
                        <select
                          className="wd-fu-select"
                          value={capitalizeWords(row.followUpStatus || row.followupStatus || '')}
                          onChange={e => {
                            const value = e.target.value
                            if (value === 'Rescheduled' || value === 'Cancelled') {
                              setSelectedRow(row); setSelectedStatus(value)
                              if (value === 'Rescheduled') fetchSlots(row.doctorId, row.branchId)
                              setShowReasonModal(true)
                            } else {
                              updatePaymentStatus(row.bookingId, value, row)
                            }
                          }}
                        >
                          {followUpStatus.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </CTableDataCell>

                      {/* View action */}
                      <CTableDataCell className="wd-td">
                        <button
                          className="wd-action-btn view"
                          onClick={() => navigate(`/appointment-details/${row.bookingId}`, { state: { appointment: row } })}
                          title="View"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })
              )}
            </CTableBody>
          </CTable>
        </div>

        {/* ── PAGINATION ─────────────────────────────────────────────────── */}
        {!loading && list.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(list.length / pageSize)}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={size => { setPageSize(size); setCurrentPage(1) }}
          />
        )}
      </CContainer>

      {/* ── REASON / RESCHEDULE MODAL ──────────────────────────────────── */}
      <CModal visible={showReasonModal} onClose={() => { setShowReasonModal(false); setReason('') }} alignment="center" className="wd-custom-modal">
        <CModalHeader className="wd-modal-header">
          <CModalTitle className="wd-modal-title">
            {selectedStatus === 'Rescheduled' ? 'Reschedule Appointment' : 'Cancel Appointment'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="wd-modal-body">
          {/* Reason */}
          <div className="wd-field">
            <label className="wd-label">Reason <span className="wd-req">*</span></label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              className="wd-textarea"
            />
          </div>

          {/* Reschedule extras */}
          {selectedStatus === 'Rescheduled' && (
            <>
              <label className="wd-label" style={{ marginBottom: '8px', display: 'block' }}>Select Date</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {loadingSlots ? (
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Loading slots…</span>
                ) : (
                  (slotsForSelectedDate || [])
                    .filter(s => {
                      const d = new Date(s.day || s.date).toISOString().split('T')[0]
                      return d >= new Date().toISOString().split('T')[0]
                    })
                    .map((s, idx) => {
                      const d = new Date(s.day || s.date).toISOString().split('T')[0]
                      const isActive = newDate === d
                      return (
                        <button
                          key={idx}
                          onClick={() => { setNewDate(d); setNewTime('') }}
                          style={{
                            fontSize: '11px', fontWeight: '600', padding: '5px 10px',
                            borderRadius: '6px', cursor: 'pointer', transition: 'all .15s',
                            border: `0.5px solid ${isActive ? '#185fa5' : '#d0dce9'}`,
                            backgroundColor: isActive ? '#185fa5' : '#f0f5fb',
                            color: isActive ? '#fff' : '#374151',
                          }}
                        >
                          {d}
                        </button>
                      )
                    })
                )}
              </div>

              {newDate && (
                <>
                  <label className="wd-label" style={{ marginBottom: '8px', display: 'block' }}>Select Time</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {visibleSlots.map((slotObj, i) => {
                      const isSelected = newTime === slotObj.slot
                      const isBooked = slotObj.slotbooked
                      return (
                        <div
                          key={i}
                          onClick={() => !isBooked && setNewTime(slotObj.slot)}
                          style={{
                            padding: '7px 4px', textAlign: 'center', fontSize: '11px', fontWeight: '600',
                            borderRadius: '6px', cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all .15s',
                            border: `0.5px solid ${isSelected ? '#185fa5' : isBooked ? '#f4b5b5' : '#d0dce9'}`,
                            backgroundColor: isSelected ? '#185fa5' : isBooked ? '#fcebeb' : '#fff',
                            color: isSelected ? '#fff' : isBooked ? '#a32d2d' : '#374151',
                          }}
                        >
                          {slotObj.slot}
                        </div>
                      )
                    })}
                  </div>
                  {sortedSlots.length > 12 && (
                    <div className="text-center mt-2">
                      <button
                        onClick={() => setShowAllSlots(!showAllSlots)}
                        style={{
                          fontSize: '11px', fontWeight: '500', padding: '4px 12px',
                          borderRadius: '6px', cursor: 'pointer', border: '0.5px solid #d0dce9',
                          backgroundColor: '#f0f5fb', color: '#374151',
                        }}
                      >
                        {showAllSlots ? 'Show Less' : `Show More (${sortedSlots.length - 12} more)`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CModalBody>

        <CModalFooter className="wd-modal-footer">
          <button
            className="wd-btn-secondary"
            onClick={() => { setShowReasonModal(false); setReason('') }}
          >
            Cancel
          </button>
          <button
            className="wd-btn-primary"
            onClick={() => {
              if (!reason.trim()) { alert('Reason is required'); return }
              updatePaymentStatus(selectedRow.bookingId, selectedStatus, selectedRow, reason, newDate, newTime)
              setShowReasonModal(false); setReason('')
              getTodayFollowUps()
            }}
          >
            Save
          </button>
        </CModalFooter>
      </CModal>

      {/* ── STYLES ───────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Stat cards ──────────────────────────────── */
        .wd-stat-card {
          cursor: pointer;
          border-radius: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
          transition: transform 0.15s, box-shadow 0.15s !important;
          min-height: 80px;
        }
        .wd-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.08) !important;
        }
        .wd-stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0; transition: background 0.2s;
        }
        .wd-stat-label {
          font-size: 11px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;
        }
        .wd-stat-value { font-size: 22px; font-weight: 700; color: #0c447c; line-height: 1.1; }

        /* ── Page header ─────────────────────────────── */
        .wd-page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; margin-bottom: 18px;
          padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
        }
        .wd-page-title-group { display: flex; align-items: center; gap: 12px; }
        .wd-page-icon {
          width: 42px; height: 42px; border-radius: 10px; background: #e6f1fb;
          display: flex; align-items: center; justify-content: center;
          color: #185fa5; flex-shrink: 0;
        }
        .wd-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
        .wd-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

        /* ── Header right cluster ────────────────────── */
        .wd-header-right {
          display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap;
        }
        .wd-divider { width: 1px; height: 22px; background: #d0dce9; margin: 0 4px; align-self: center; }

        /* ── Date inputs / select in header ──────────── */
        .wd-date-group { display: flex; flex-direction: column; gap: 3px; }
        .wd-date-label {
          font-size: 10px; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .wd-date-input, .wd-select {
          font-size: 12px; padding: 5px 10px; border-radius: 6px;
          border: 0.5px solid #d0dce9; color: #374151;
          background: #fff; outline: none; cursor: pointer;
          transition: border-color 0.15s;
        }
        .wd-date-input:focus, .wd-select:focus { border-color: #185fa5; }
        .wd-select { color: #185fa5; min-width: 130px; }

        /* ── Table wrapper ───────────────────────────── */
        .wd-table-wrapper {
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; margin-bottom: 12px;
        }
        .wd-table { margin-bottom: 0 !important; font-size: 13px; }

        /* ── Table header ────────────────────────────── */
        .wd-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 11px 14px !important; white-space: nowrap;
          border: none !important; vertical-align: middle !important;
        }

        /* ── Table rows ──────────────────────────────── */
        .wd-tr { transition: background 0.12s; }
        .wd-tr:hover { background: #f0f5fb !important; }
        .wd-td {
          padding: 11px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
        .wd-td-num { color: #9ca3af; font-size: 12px; }

        /* ── Booking ID chip ─────────────────────────── */
        .wd-booking-id {
          background: #e6f1fb; color: #185fa5; border: 0.5px solid #b5d4f4;
          border-radius: 20px; font-size: 11px; font-weight: 600;
          padding: 2px 9px; white-space: nowrap;
        }

        /* ── Patient name ────────────────────────────── */
        .wd-name { font-weight: 600; color: #0c447c; font-size: 13px; }

        /* ── Status pill ─────────────────────────────── */
        .wd-status-badge {
          border-radius: 20px; font-size: 11px; font-weight: 600;
          padding: 3px 10px; white-space: nowrap; display: inline-block;
        }

        /* ── Follow-up status dropdown ───────────────── */
        .wd-fu-select {
          font-size: 11px; padding: 4px 8px; border-radius: 6px;
          border: 0.5px solid #d0dce9; color: #185fa5;
          background: #f0f5fb; cursor: pointer; outline: none;
          min-width: 130px; font-weight: 500;
          transition: border-color 0.15s;
        }
        .wd-fu-select:focus { border-color: #185fa5; }

        /* ── Action button ───────────────────────────── */
        .wd-actions { display: flex; gap: 6px; align-items: center; }
        .wd-action-btn {
          width: 30px; height: 30px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: filter 0.12s, transform 0.1s; flex-shrink: 0;
        }
        .wd-action-btn.view  { background: #e6f1fb; color: #185fa5; }
        .wd-action-btn.edit  { background: #eaf3de; color: #3b6d11; }
        .wd-action-btn:hover  { filter: brightness(0.9); transform: scale(1.07); }
        .wd-action-btn:active { transform: scale(0.94); }

        /* ── Empty state ─────────────────────────────── */
        .wd-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 40px 0; color: #9ca3af; font-size: 14px;
        }
        .wd-empty-icon { color: #d0dce9; }

        /* ── Modal ───────────────────────────────────── */
        .wd-custom-modal .modal-content {
          border: 0.5px solid #d0dce9 !important;
          border-radius: 12px !important; overflow: hidden;
        }
        .wd-modal-header {
          background: #185fa5 !important; border-bottom: none !important;
          padding: 16px 20px !important;
        }
        .wd-modal-title { font-size: 15px !important; font-weight: 700 !important; color: #fff !important; }
        .wd-custom-modal .btn-close { filter: brightness(0) invert(1); opacity: 0.8; }
        .wd-modal-body { background: #f7fafd !important; padding: 20px !important; }
        .wd-modal-footer {
          border-top: 0.5px solid #d0dce9 !important; padding: 12px 20px !important;
          gap: 8px; display: flex; justify-content: flex-end;
          background: #f7fafd !important;
        }

        /* ── Modal form fields ───────────────────────── */
        .wd-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
        .wd-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 2px; }
        .wd-req { color: #e24b4a; }
        .wd-textarea {
          width: 100%; font-size: 13px; padding: 8px 10px;
          border-radius: 7px; border: 0.5px solid #ced4da;
          resize: vertical; outline: none; background: #fff; color: #374151;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .wd-textarea:focus {
          border-color: #185fa5 !important;
          box-shadow: 0 0 0 2px rgba(24,95,165,0.15) !important;
        }

        /* ── Modal buttons ───────────────────────────── */
        .wd-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #185fa5; color: #fff; border: none; border-radius: 8px;
          padding: 9px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(24,95,165,0.2);
        }
        .wd-btn-primary:hover  { background: #0c447c; }
        .wd-btn-primary:active { transform: scale(0.97); }
        .wd-btn-secondary {
          background: #fff; color: #374151; border: 0.5px solid #d0dce9;
          border-radius: 8px; padding: 9px 18px; font-size: 13px;
          font-weight: 500; cursor: pointer; transition: background 0.15s;
        }
        .wd-btn-secondary:hover { background: #f0f5fb; }
      `}</style>
    </>
  )
}