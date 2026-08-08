import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { CFormInput, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react'
import { Calendar } from 'lucide-react'
import { showCustomToast } from '../../Utils/Toaster'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import { COLORS } from '../../Constant/Themes'
import ConfirmModal from '../../components/ConfirmLogoutModal'

/* ─────────────────────────────────────────────
   Inline styles – scoped design tokens
───────────────────────────────────────────── */
const tokens = {
  primary: 'var(--color-bgcolor)',
  white: '#ffffff',
  black: '#1e293b',
  surface: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  success: '#16a34a',
  danger: '#dc2626',
  radius: '10px',
}

const statusConfig = {
  confirmed: { bg: '#dbeafe', color: '#1d4ed8', label: 'Confirmed' },
  active: { bg: '#dcfce7', color: '#15803d', label: 'Active' },
  completed: { bg: '#f3f4f6', color: '#374151', label: 'Completed' },
  pending: { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  rescheduled: { bg: '#fff59d', color: '#a88f07', label: 'Rescheduled' },
  paid: { bg: '#dcfce7', color: '#15803d', label: 'Paid' },
  unpaid: { bg: '#fee2e2', color: '#991b1b', label: 'Unpaid' },
  planned: { bg: '#f3f4f6', color: '#374151', label: 'Planned' },
  booked: { bg: '#dbeafe', color: '#1d4ed8', label: 'Booked' },
  'not booked': { bg: '#f3f4f6', color: '#6b7280', label: 'Not Booked' },
}

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending
  return (
    <span style={{
      backgroundColor: cfg.bg,
      color: cfg.color,
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '4px 12px',
      borderRadius: '20px',
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.label}
    </span>
  )
}

const ActionBtn = ({ onClick, children, color = 'primary', style = {} }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '5px 12px', borderRadius: '6px',
      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
      border: 'none', color: '#fff',
      backgroundColor: color === 'success' ? tokens.success : 'var(--color-bgcolor)',
      transition: 'opacity .15s',
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
  >
    {children}
  </button>
)

const SectionHeading = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
    {Icon && (
      <span style={{
        width: '28px', height: '28px', borderRadius: '6px',
        backgroundColor: COLORS.primary, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} color="#fff" />
      </span>
    )}
    <h6 style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: COLORS.primary }}>
      {title}
    </h6>
  </div>
)

/* Divider */
const Divider = () => (
  <hr style={{ border: 'none', borderTop: `1px solid ${tokens.border}`, margin: '20px 0' }} />
)

/* ─────────────────────────────────────────────
   Therapy Formatting Helpers
───────────────────────────────────────────── */
const normalizeToPrograms = (sourceData) => {
  if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) return []
  const hasContainers = sourceData.some(item => item.programs || item.therapySessions)
  if (hasContainers) {
    return sourceData.flatMap(item => item.programs || item.therapySessions || [])
  }
  if (sourceData[0]?.therapyData) {
    return sourceData
  }
  if (sourceData[0]?.exercises) {
    return [{
      programId: "DEFAULT_PROG", programName: "-",
      therapyData: sourceData.map(t => ({
        therapyId: t.therapyId || "DEFAULT_THERAPY",
        therapyName: t.therapyName || "-",
        totalPrice: t.totalPrice || 0,
        paymentStatus: t.paymentStatus,
        exercises: t.exercises || []
      }))
    }]
  }
  if (sourceData[0]?.exerciseId || sourceData[0]?.sessions) {
    return [{
      programId: "DEFAULT_PROG", programName: "-",
      therapyData: [{
        therapyId: "DEFAULT_THERAPY",
        therapyName: "-",
        exercises: sourceData
      }]
    }]
  }
  return []
}

const formatTherapyTable = (data = []) => {
  const rows = []
  if (!Array.isArray(data)) return rows
  const programs = normalizeToPrograms(data)
  programs.forEach(program => {
    (program.therapyData || []).forEach(therapy => {
      (therapy.exercises || []).forEach(exercise => {
        const count = Number(exercise.noOfSessions || 0) || 1
        if (exercise.sessions && exercise.sessions.length > 0) {
          exercise.sessions.forEach(session => {
            rows.push({
              programName: program.programName,
              therapyName: therapy.therapyName,
              exerciseName: exercise.exerciseName,
              sessionNo: session.sessionNo,
              rowKey: session.sessionId || `${exercise.exerciseName}_${session.sessionNo}`,
              sessionId: session.sessionId,
              date: session.date || "-",
              slot: session.slot || "",
              status: session.status || "Planned",
              bookingStatus: session.bookingStatus || "Planned",
              paymentStatus: session.paymentStatus || "Unpaid",
            })
          })
        } else {
          for (let i = 1; i <= count; i++) {
            rows.push({
              programName: program.programName,
              therapyName: therapy.therapyName,
              exerciseName: exercise.exerciseName,
              sessionNo: i,
              rowKey: `${exercise.exerciseName}_${i}`,
              date: "-",
              slot: "",
              status: "Planned",
              bookingStatus: "Planned",
              paymentStatus: "Unpaid"
            })
          }
        }
      })
    })
  })
  return rows
}

const groupSessionsByExercise = (sessions) => {
  const grouped = {}
  sessions.forEach(session => {
    if (!grouped[session.exerciseName]) {
      grouped[session.exerciseName] = []
    }
    grouped[session.exerciseName].push(session)
  })
  return grouped
}

const GeneratedSessionsTable = ({ generatedSessions, appointment, onRefresh }) => {
  const [sessionOverrides, setSessionOverrides] = useState({})
  const [sessionEdits, setSessionEdits] = useState({})
  const [doctorSlots, setDoctorSlots] = useState([])

  const fetchSlots = async () => {
    if (generatedSessions && (generatedSessions.therapistId || generatedSessions.doctorId)) {
      try {
        const hId = sessionStorage.getItem('HospitalId')
        const bId = appointment?.branchId || sessionStorage.getItem('branchId')
        const docId = generatedSessions.therapistId || generatedSessions.doctorId
        const res = await axios.get(`${BASE_URL}/getDoctorSlots/${hId}/${bId}/${docId}`)
        if (res.data?.success) setDoctorSlots(res.data.data)
      } catch (e) { console.error(e) }
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [generatedSessions, appointment?.branchId])

  const getSlotsForDate = (dateStr) => {
    if (!dateStr || !doctorSlots?.length) return []
    const dayData = doctorSlots.find(d => new Date(d.day || d.date).toDateString() === new Date(dateStr).toDateString())
    return dayData?.availableSlots?.filter(s => !(s.available === false && s.reason === "Time already passed")) || []
  }

  const [confirmModal, setConfirmModal] = useState({ visible: false, payload: null, action: null, rowKey: null, sessionNo: null, title: '', message: '' })

  const executeConfirmedAction = async (payload, action, rowKey, sessionNo) => {
    try {
      const res = await axios.put(`${wifiUrl}/api/physiotherapy-doctor/session/update-booking`, payload)
      if (res.data?.success) {
        showCustomToast(`Session ${sessionNo} ${action === 'cancel' ? 'cancelled' : action === 'book' ? 'booked' : 'rescheduled'} successfully!`, "success")
        setSessionOverrides(prev => ({
          ...prev,
          [rowKey]: {
            ...prev[rowKey],
            status: payload.bookingStatus,
            ...(action !== 'cancel' ? { date: payload.date, slot: payload.slot } : { status: 'Cancelled' }),
            mode: 'read'
          }
        }))
        fetchSlots()
        if (onRefresh) {
          onRefresh()
        }
      } else {
        showCustomToast(res.data?.message || `Failed to ${action} session`, "error")
      }
    } catch (error) {
      console.error(error)
      showCustomToast(`Error trying to ${action} session.`, "error")
    }
  }

  const handleSessionAction = async (row, action) => {
    const sessionNo = row.sessionNo;
    const rowKey = row.rowKey;
    const override = sessionOverrides[rowKey]

    if (action === 'book' || action === 'reschedule_confirm') {
      const edits = sessionEdits[rowKey]
      if (!edits?.date || !edits?.slot) {
        showCustomToast("Please select a date and slot.", "error")
        return
      }

      const payload = {
        clinicId: sessionStorage.getItem('HospitalId'),
        branchId: appointment?.branchId || sessionStorage.getItem('branchId'),
        bookingId: appointment?.bookingId,
        patientId: appointment?.patientId,
        sessionId: row.sessionId,
        date: edits.date,
        slot: edits.slot,
        bookingStatus: action === 'book' ? "Booked" : "Rescheduled"
      }

      if (action === 'reschedule_confirm' || action === 'book') {
        setConfirmModal({
          visible: true,
          payload,
          action,
          rowKey,
          sessionNo,
          title: action === 'book' ? "Confirm Booking" : "Confirm Reschedule",
          message: (
            <div>
              <p style={{ marginBottom: '12px' }}>
                Are you sure you want to {action === 'book' ? 'book' : 'reschedule'} this session?
              </p>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                <div style={{ marginBottom: '6px' }}><strong>Therapist:</strong> {generatedSessions.therapistName || generatedSessions.doctorName || '-'}</div>
                <div style={{ marginBottom: '6px' }}><strong>Date:</strong> {edits.date || '-'}</div>
                <div><strong>Slot:</strong> {edits.slot || '-'}</div>
              </div>
            </div>
          )
        })
        return
      }
    } else if (action === 'reschedule_init') {
      setSessionOverrides(prev => ({
        ...prev,
        [rowKey]: { ...prev[rowKey], mode: 'edit' }
      }))
    } else if (action === 'cancel_edit') {
      setSessionOverrides(prev => ({
        ...prev,
        [rowKey]: { ...prev[rowKey], mode: 'read' }
      }))
    } else if (action === 'cancel') {
      const payload = {
        clinicId: sessionStorage.getItem('HospitalId'),
        branchId: appointment?.branchId || sessionStorage.getItem('branchId'),
        bookingId: appointment?.bookingId,
        patientId: appointment?.patientId,
        sessionId: row.sessionId,
        date: override?.date || row.date || "-",
        slot: override?.slot || row.slot || "-",
        bookingStatus: "Cancelled"
      }

      setConfirmModal({
        visible: true,
        payload,
        action,
        rowKey,
        sessionNo,
        title: "Confirm Cancellation",
        message: "Are you sure you want to cancel this session?"
      })
    }
  }

  if (!generatedSessions || !generatedSessions.therapyWithSessions?.length) return null;

  const flatSessions = formatTherapyTable(generatedSessions.therapyWithSessions);
  const groupedSessions = groupSessionsByExercise(flatSessions);

  return (
    <>
      {/* <Divider /> */}
      <div style={{ padding: '0 24px 24px' }}>
        <SectionHeading icon={Calendar} title="Treatment Sessions" />
        <div style={{ border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, overflow: 'hidden' }}>

          {Object.entries(groupedSessions).map(([exerciseName, sessions], groupIdx) => (
            <div key={groupIdx} style={{ borderBottom: groupIdx !== Object.keys(groupedSessions).length - 1 ? `1px solid ${tokens.border}` : 'none' }}>

              {/* Heading Row for Exercise Name */}
              <div style={{ backgroundColor: tokens.primary, color: '#fff', padding: '10px 16px', fontWeight: '700', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff' }}>Treatment / Exercise: {exerciseName}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', opacity: 0.85, color: '#fff' }}>{sessions.length} Session(s)</span>
              </div>

              <div className="table-responsive">
                <CTable hover responsive align="middle" style={{ fontSize: '13px' }}>
                  <CTableHead style={{ backgroundColor: tokens.surface, color: tokens.muted, borderBottom: `1px solid ${tokens.border}` }}>
                    <CTableRow>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600', width: '80px' }}>Session</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Therapist</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Date</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Slot</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Payment Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Session Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600' }}>Status</CTableHeaderCell>
                      <CTableHeaderCell style={{ padding: '12px 16px', fontWeight: '600', width: '180px' }}>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {sessions.map((row, idx) => {
                      const override = sessionOverrides[row.rowKey]
                      const currentStatus = override?.bookingStatus || row.bookingStatus || 'Planned'

                      const displayDate = override?.date || row.date
                      const displaySlot = override?.slot || row.slot || ''

                      // "if slot is empty that is not booked"
                      const isNotBooked = !displaySlot || displaySlot === 'NA' || currentStatus === 'Planned' || currentStatus === 'Not Booked' || currentStatus === 'NA'
                      const isEditMode = (isNotBooked || override?.mode === 'edit')

                      const currentDate = new Date().toISOString().split('T')[0]
                      const edits = sessionEdits[row.rowKey] || { date: displayDate !== '-' && displayDate ? displayDate : currentDate, slot: displaySlot }
                      const availableSlots = getSlotsForDate(edits.date)

                      return (
                        <CTableRow key={idx} style={{
                          borderBottom: idx !== sessions.length - 1 ? `1px solid ${tokens.border}` : 'none',
                          backgroundColor: isEditMode ? '#fff' : '#f8fafc',
                          color: isEditMode ? '#1e293b' : '#000',
                        }}>
                          {/* Session No: small style */}
                          <CTableDataCell
                            title={`Session ID: ${row.sessionId || 'N/A'}`}
                            style={{ padding: '12px 16px', fontSize: '12px', color: tokens.muted, cursor: 'help' }}
                          >
                            #{row.sessionNo}
                          </CTableDataCell>
                          <CTableDataCell style={{ padding: '12px 16px' }}>{generatedSessions.therapistName || generatedSessions.doctorName || '-'}</CTableDataCell>

                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            {isEditMode ? (
                              <CFormInput
                                type="date"
                                value={edits.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setSessionEdits(p => ({ ...p, [row.rowKey]: { ...edits, date: e.target.value, slot: '' } }))}
                                style={{ padding: '6px 10px', border: `1px solid ${tokens.border}`, borderRadius: '6px', width: '140px', fontSize: '13px' }}
                              />
                            ) : (
                              displayDate
                            )}
                          </CTableDataCell>

                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            {isEditMode ? (
                              <select value={edits.slot}
                                onChange={e => setSessionEdits(p => ({ ...p, [row.rowKey]: { ...edits, slot: e.target.value } }))}
                                style={{ padding: '6px 10px', border: `1px solid ${tokens.border}`, borderRadius: '6px', width: '130px', fontSize: '13px' }}
                              >
                                <option value="">Select Slot</option>
                                {availableSlots.map(s => <option key={s.slot} value={s.slot} disabled={s.slotbooked}>{s.slot} {s.slotbooked ? '(Booked)' : ''}</option>)}
                              </select>
                            ) : (
                              displaySlot || 'NA'
                            )}
                          </CTableDataCell>
                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            <StatusBadge status={row.paymentStatus || 'unpaid'} />
                          </CTableDataCell>
                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            <StatusBadge status={row.status || 'planned'} />
                          </CTableDataCell>

                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            <StatusBadge status={currentStatus} />
                          </CTableDataCell>


                          <CTableDataCell style={{ padding: '12px 16px' }}>
                            {row.status?.toLowerCase() === 'completed' ? null : isEditMode ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <ActionBtn style={{ backgroundColor: COLORS.primary }} onClick={() => handleSessionAction(row, override?.mode === 'edit' ? 'reschedule_confirm' : 'book')}>
                                  {override?.mode === 'edit' ? 'Confirm' : 'Book'}
                                </ActionBtn>
                                {override?.mode === 'edit' && (
                                  <ActionBtn style={{ backgroundColor: '#94a3b8', color: '#fff' }} onClick={() => handleSessionAction(row, 'cancel_edit')}>
                                    Cancel
                                  </ActionBtn>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <ActionBtn style={{ backgroundColor: '#f59e0b' }} onClick={() => handleSessionAction(row, 'reschedule_init')}>Reschedule</ActionBtn>
                                {currentStatus !== 'Cancelled' && (
                                  <ActionBtn style={{ backgroundColor: '#ef4444' }} onClick={() => handleSessionAction(row, 'cancel')}>Cancel</ActionBtn>
                                )}
                              </div>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
                  </CTableBody>
                </CTable>
              </div>
            </div>
          ))}

        </div>
      </div>
      <ConfirmModal
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ ...confirmModal, visible: false })}
        onConfirm={() => {
          setConfirmModal({ ...confirmModal, visible: false })
          executeConfirmedAction(confirmModal.payload, confirmModal.action, confirmModal.rowKey, confirmModal.sessionNo)
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Yes, Confirm"
        cancelText="No, Keep it"
      />
    </>
  )
}

export default GeneratedSessionsTable
