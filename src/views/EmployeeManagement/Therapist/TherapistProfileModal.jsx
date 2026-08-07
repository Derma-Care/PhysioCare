import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CRow,
  CCol,
  CBadge,
  CButton,
  CModalFooter
} from '@coreui/react'
import { format } from 'date-fns'
import { http } from '../../../Utils/Interceptors'
import { showCustomToast } from '../../../Utils/Toaster'
import { fetchDoctorSlots } from '../../../APIs/GenerateSlots'

const t = {
  primary: 'var(--color-bgcolor)',
  white: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  surface: '#f8fafc',
  border: '#e2e8f0',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  radius: '10px',
  radiusSm: '6px',
}

const Btn = ({ onClick, children, variant = 'primary', disabled = false, style = {} }) => {
  const bg = variant === 'danger' ? t.danger : variant === 'secondary' ? '#e2e8f0' : variant === 'outline' ? 'transparent' : 'var(--color-bgcolor)'
  const color = variant === 'secondary' ? t.text : variant === 'outline' ? 'var(--color-bgcolor)' : '#fff'
  const border = variant === 'outline' ? '1px solid var(--color-bgcolor)' : 'none'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 18px', borderRadius: t.radiusSm, fontSize: '12px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer', border, color, backgroundColor: bg, opacity: disabled ? 0.55 : 1, transition: 'opacity .15s', ...style }}
    >
      {children}
    </button>
  )
}

export default function TherapistProfileModal({ visible, data, onClose }) {
  const [activeKey, setActiveKey] = useState(1) // 1: Slots, 2: Profile
  const [selectedDate, setSelectedDate] = useState('')
  const [days, setDays] = useState([])
  const [allSlots, setAllSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState([])
  
  const [visibleSlot, setVisibleSlot] = useState(false)
  const [interval, setInterval] = useState(30)
  const [slots, setSlots] = useState([])
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [deleteMode, setDeleteMode] = useState(null)

  useEffect(() => {
    if (visible) {
      setActiveKey(1) // Default to slots
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
      
      const localToday = new Date()
      localToday.setHours(0, 0, 0, 0)
      const fullDayList = []
      for (let i = 0; i < 15; i++) {
        const date = new Date(localToday)
        date.setDate(localToday.getDate() + i)
        fullDayList.push({ date, dayLabel: format(date, 'EEE'), dateLabel: format(date, 'dd MMM') })
      }
      setDays(fullDayList)
    }
  }, [visible])

  useEffect(() => {
    if (visible && data?.therapistId) {
      fetchSlots()
    }
  }, [visible, data])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const hospitalId = sessionStorage.getItem('HospitalId')
      const branchId = sessionStorage.getItem('branchId')
      const response = await http.get(`/getDoctorSlots/${hospitalId}/${branchId}/${data.therapistId}`)
      if (response.data.success) {
        setAllSlots(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (dayObj) => {
    setSelectedDate(format(dayObj.date, 'yyyy-MM-dd'))
    setSelectedSlots([])
  }

  const slotsForSelectedDate = (Array.isArray(allSlots) ? allSlots.find(sd => sd.date === selectedDate) : null)?.availableSlots || []

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])
  }

  const openModal = () => setVisibleSlot(true)

  const handleGenerate = async () => {
    const doctorId = data?.therapistId
    const branchId = sessionStorage.getItem('branchId')
    const date = selectedDate
    const intervaltime = interval
    const start = data?.availability?.startTime || "09:00"
    const end = data?.availability?.endTime || "18:00"
    
    const generatedSlots = await fetchDoctorSlots(doctorId, branchId, date, intervaltime, start, end)
    if (!generatedSlots || generatedSlots.length === 0) {
      setSlots([])
      showCustomToast('Timing not available for this therapist', 'error')
      return
    }
    setSlots(generatedSlots)
    setSelectedSlots([])
    showCustomToast(`Generated ${generatedSlots.length} slots`, 'success')
  }

  const handleAddSlot = async () => {
    if (selectedSlots.length === 0) { alert('No new slots to add!'); return }
    const payload = {
      doctorId: data?.therapistId,
      date: selectedDate,
      availableSlots: selectedSlots.map(slot => ({ slot, slotbooked: false })),
    }
    try {
      const hospitalId = sessionStorage.getItem('HospitalId')
      const branchId = sessionStorage.getItem('branchId')
      const res = await http.post(`/addDoctorSlots/${hospitalId}/${branchId}/${data.therapistId}`, payload)
      if (res.data.success) {
        showCustomToast('Slots added successfully', 'success')
        setVisibleSlot(false)
        setSelectedSlots([])
        fetchSlots()
      }
    } catch (err) {
      console.error(err)
      alert('Error adding slots')
    }
  }

  const handleDeleteConfirm = async () => {
    const branchid = sessionStorage.getItem('branchId')
    try {
      if (deleteMode === 'selected') {
        for (const slot of selectedSlots) {
          await http.delete(`/doctorId/${data?.therapistId}/branchId/${branchid}/date/${selectedDate}/slot/${slot}`)
        }
        showCustomToast('Selected slots deleted successfully.', 'success')
        setSelectedSlots([])
      } else if (deleteMode === 'all') {
        await http.delete(`/delete-by-date/${data?.therapistId}/${branchid}/${selectedDate}`)
        showCustomToast(`All slots for ${selectedDate} deleted.`, 'success')
        setSelectedSlots([])
      }
      fetchSlots()
    } catch (err) {
      showCustomToast('Failed to delete slots.', 'error')
    } finally {
      setShowDeleteConfirmModal(false)
    }
  }

  const formatDay = (d) => d ? d.charAt(0).toUpperCase() + d.slice(1) : ''

  if (!data) return null

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg">
        <CModalHeader>
          <CModalTitle>Therapist Details: {data.fullName}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CNav variant="tabs" className="mb-3">
            <CNavItem>
              <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)} style={{ cursor: 'pointer' }}>
                Slots
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)} style={{ cursor: 'pointer' }}>
                Profile
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            <CTabPane visible={activeKey === 1}>
              <div style={{ marginBottom: '16px' }}>
                <h6 style={{ fontWeight: '600' }}>Select Date</h6>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {days.map((dayObj, idx) => {
                    const isSelected = selectedDate === format(dayObj.date, 'yyyy-MM-dd')
                    return (
                      <button key={idx} onClick={() => handleDateClick(dayObj)} style={{ padding: '6px 10px', borderRadius: t.radiusSm, border: `1px solid ${isSelected ? 'var(--color-bgcolor)' : t.border}`, backgroundColor: isSelected ? '#1e3a8a' : '#fff', color: isSelected ? '#ffffff' : t.text, cursor: 'pointer', fontSize: '11px', fontWeight: isSelected ? '700' : '500', minWidth: '52px', textAlign: 'center', transition: 'all .15s' }}>
                        <div style={{ color: isSelected ? '#ffffff' : t.text }}>{dayObj.dayLabel}</div>
                        <div style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.85)' : t.textMuted }}>{dayObj.dateLabel}</div>
                      </button>
                    )
                  })}
                </div>

                <h6 style={{ fontWeight: '600' }}>Available Slots — {selectedDate}</h6>
                <div style={{ border: `1px solid ${t.border}`, borderRadius: t.radius, padding: '16px', backgroundColor: t.surface, marginBottom: '16px' }}>
                  {loading ? (
                    <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>Loading slots...</p>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <p style={{ color: t.textMuted, fontSize: '13px', margin: 0 }}>No available slots for this date.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
                      {slotsForSelectedDate.map((slotObj, i) => {
                        const isSelected = selectedSlots.includes(slotObj.slot)
                        const isBooked = slotObj?.slotbooked
                        const now = new Date()
                        const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
                        const todayCheck = format(now, 'yyyy-MM-dd') === selectedDate
                        const isPastTime = !todayCheck || slotTime > now
                        return isPastTime && (
                          <div key={i} onClick={() => { if (isBooked) return; toggleSlot(slotObj.slot) }} title={isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                            style={{ padding: '8px 4px', borderRadius: t.radiusSm, textAlign: 'center', fontSize: '11px', fontWeight: '600', cursor: isBooked ? 'not-allowed' : 'pointer', border: `1px solid ${isSelected ? '#1e3a8a' : isBooked ? '#fca5a5' : t.border}`, backgroundColor: isSelected ? '#1e3a8a' : isBooked ? '#fee2e2' : '#fff', color: isSelected ? '#ffffff' : isBooked ? t.danger : t.text, opacity: isBooked ? 0.8 : 1, transition: 'all .15s', userSelect: 'none' }}>
                            {slotObj?.slot}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {[{ color: '#fff', border: t.border, label: 'Available' }, { color: '#1e3a8a', border: '#1e3a8a', text: '#fff', label: 'Selected' }, { color: '#fee2e2', border: '#fca5a5', label: 'Booked' }].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: t.textMuted }}>
                      <span style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: item.color, border: `1px solid ${item.border}`, display: 'inline-block' }} />
                      {item.label}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Btn variant="outline" onClick={openModal}>+ Add Slot</Btn>
                  <Btn variant="outline" disabled={selectedSlots.length === 0} onClick={() => { if (selectedSlots.length === 0) { showCustomToast('Please select slot(s) to delete.', 'error'); return }; setDeleteMode('selected'); setShowDeleteConfirmModal(true) }}>
                    Delete Selected ({selectedSlots.length})
                  </Btn>
                  <Btn onClick={() => { setDeleteMode('all'); setShowDeleteConfirmModal(true) }}>Delete All for Date</Btn>
                </div>
              </div>
            </CTabPane>

            <CTabPane visible={activeKey === 2}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <img
                  src={
                    data.documents?.profilePhoto
                      ? `data:image/jpeg;base64,${data.documents.profilePhoto}`
                      : '/assets/images/default-avatar.png'
                  }
                  alt={data.fullName}
                  width="100"
                  height="100"
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #ddd',
                  }}
                />
                <div>
                  <h4 className="mb-1">{data.fullName}</h4>
                  <small className="text-muted">{data.therapistId}</small>
                  <div className="mt-2">
                    <CBadge style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }} className="me-2">
                      {data.role || 'Therapist'}
                    </CBadge>
                    <CBadge style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}>
                      {data.yearsOfExperience} yrs exp
                    </CBadge>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Personal Details</h6>
              <CRow className="mb-3">
                <CCol md={4}><b>Contact:</b> {data.contactNumber}</CCol>
                <CCol md={4}><b>Gender:</b> {data.gender}</CCol>
                <CCol md={4}><b>DOB:</b> {data.dateOfBirth}</CCol>
              </CRow>

              <h6 className="fw-bold mb-3">Professional Details</h6>
              <CRow className="mb-3">
                <CCol md={4}><b>Qualification:</b> {data.qualification}</CCol>
                <CCol md={4}><b>Experience:</b> {data.yearsOfExperience} years</CCol>
                <CCol md={4}><b>Services:</b> {data.services?.join(', ') || 'N/A'}</CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}><b>Specializations:</b> {data.specializations?.join(', ') || 'N/A'}</CCol>
                <CCol md={4}><b>Expertise:</b> {data.expertiseAreas?.join(', ') || 'N/A'}</CCol>
                <CCol md={4}><b>Treatments:</b> {data.treatmentTypes?.join(', ') || 'N/A'}</CCol>
              </CRow>

              <h6 className="fw-bold mb-3">Availability</h6>
              <CRow className="mb-3">
                <CCol md={6}>
                  <b>Days:</b> {data.availability?.days?.map(formatDay).join(', ') || 'N/A'}
                </CCol>
                <CCol md={6}>
                  <b>Time:</b> {data.availability?.startTime} - {data.availability?.endTime}
                </CCol>
              </CRow>

              <h6 className="fw-bold mb-3">Languages</h6>
              <CRow className="mb-3">
                <CCol md={12}>
                  {data.languages?.map((lang, i) => (
                    <CBadge key={i} style={{ color: 'var(--color-black)', border: '1px solid #ccc' }} className="me-2">
                      {lang}
                    </CBadge>
                  ))}
                </CCol>
              </CRow>

              <h6 className="fw-bold mb-3">Profile Description</h6>
              <p className="text-muted">{data.bio || 'N/A'}</p>

            </CTabPane>
          </CTabContent>
        </CModalBody>
      </CModal>

      {/* ══ MODAL — Add Slots ══ */}
      <CModal visible={visibleSlot} onClose={() => { setVisibleSlot(false); setSlots([]); setSelectedSlots([]) }} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle style={{ fontSize: '14px', fontWeight: '700' }}>Generate Slots — {selectedDate}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[10, 20, 30].map(min => (
              <label key={min} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                <input type="radio" value={min} checked={interval === min} onChange={() => { setInterval(min); setSlots([]); setSelectedSlots([]) }} style={{ accentColor: 'var(--color-bgcolor)' }} />
                {min} min
              </label>
            ))}
            <Btn onClick={handleGenerate}>Generate Slots</Btn>
          </div>

          {slots.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-bgcolor)', marginBottom: '12px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: 'var(--color-bgcolor)' }}
                checked={selectedSlots.length === slots.filter(s => s.available).length && slots.filter(s => s.available).length > 0}
                onChange={e => { if (e.target.checked) setSelectedSlots(slots.filter(s => s.available).map(s => s.slot)); else setSelectedSlots([]) }} />
              Select All Available Slots
            </label>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {slots.map((slotObj, i) => {
              const isSelected = selectedSlots.includes(slotObj.slot)
              return (
                <button key={i}
                  onClick={() => { if (!slotObj.available) { showCustomToast(slotObj.reason ? `Cannot book: ${slotObj.reason}` : 'This slot is unavailable', 'warning'); return }; toggleSlot(slotObj.slot) }}
                  style={{ width: '76px', height: '34px', fontSize: '11px', fontWeight: '600', borderRadius: t.radiusSm, border: 'none', cursor: slotObj.available ? 'pointer' : 'not-allowed', backgroundColor: isSelected ? '#1e3a8a' : !slotObj.available ? '#e2e8f0' : '#64748b', color: isSelected ? '#ffffff' : !slotObj.available ? t.textMuted : '#fff', opacity: !slotObj.available ? 0.6 : 1 }}>
                  {slotObj.slot}
                </button>
              )
            })}
          </div>
        </CModalBody>
        <CModalFooter>
          <Btn variant="secondary" onClick={() => setVisibleSlot(false)}>Cancel</Btn>
          <Btn disabled={selectedSlots.length === 0} onClick={handleAddSlot}>Save Slots ({selectedSlots.length})</Btn>
        </CModalFooter>
      </CModal>

      {/* ══ MODAL — Confirm Delete Slots ══ */}
      <CModal visible={showDeleteConfirmModal} onClose={() => setShowDeleteConfirmModal(false)} alignment="center">
        <CModalHeader closeButton>
          <CModalTitle style={{ fontSize: '14px', fontWeight: '700' }}>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ fontSize: '13px' }}>
          {deleteMode === 'selected'
            ? <p>Are you sure you want to delete <strong>{selectedSlots.length}</strong> selected slot(s) for <strong>{selectedDate}</strong>?</p>
            : <p>Are you sure you want to delete <strong>ALL</strong> slots for <strong>{selectedDate}</strong>?</p>}
        </CModalBody>
        <CModalFooter>
          <Btn variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDeleteConfirm}>Confirm Delete</Btn>
        </CModalFooter>
      </CModal>
    </>
  )
}
