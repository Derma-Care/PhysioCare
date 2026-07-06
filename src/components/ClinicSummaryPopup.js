import React, { useState, useEffect } from 'react'
import { CModal, CModalBody, CModalHeader, CModalTitle, CButton } from '@coreui/react'
import axios from 'axios'
import { BASE_URL } from '../baseUrl'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faCircleCheck,
  faMicroscope,
  faClipboardCheck,
  faBell,
  faCalendarDays,
  faHospital,
} from '@fortawesome/free-solid-svg-icons'
import { http } from '../Utils/Interceptors'

// ── Metric config ─────────────────────────────────────────────────────────────
const METRICS = [
  {
    key: 'pending',
    label: 'Pending',
    icon: faClock,
    bg: '#FAEEDA', iconColor: '#854F0B',
    pctBg: '#FAEEDA', pctColor: '#633806',
    bar: '#EF9F27',
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: faCircleCheck,
    bg: '#EAF3DE', iconColor: '#3B6D11',
    pctBg: '#EAF3DE', pctColor: '#27500A',
    bar: '#639922',
  },
  {
    key: 'dueForInvestigation',
    label: 'Due for investigation',
    icon: faMicroscope,
    bg: '#E6F1FB', iconColor: '#185FA5',
    pctBg: '#E6F1FB', pctColor: '#0C447C',
    bar: '#378ADD',
  },
  {
    key: 'investigationDone',
    label: 'Investigation done',
    icon: faClipboardCheck,
    bg: '#E1F5EE', iconColor: '#0F6E56',
    pctBg: '#E1F5EE', pctColor: '#085041',
    bar: '#1D9E75',
  },
  {
    key: 'followupNeeded',
    label: 'Follow-up needed',
    icon: faBell,
    bg: '#EEEDFE', iconColor: '#534AB7',
    pctBg: '#EEEDFE', pctColor: '#3C3489',
    bar: '#7F77DD',
  },
  {
    key: 'followupDue',
    label: 'Follow-up',
    icon: faCalendarDays,
    bg: '#FAECE7', iconColor: '#993C1D',
    pctBg: '#FAECE7', pctColor: '#712B13',
    bar: '#D85A30',
  },
]

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ config, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div
      style={{
        background: '#fff',
        border: '0.5px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: config.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FontAwesomeIcon icon={config.icon} style={{ fontSize: 14, color: config.iconColor }} />
        </div>
        <span
          style={{
            fontSize: 11, fontWeight: 500, padding: '2px 7px', borderRadius: 999,
            background: config.pctBg, color: config.pctColor,
          }}
        >
          {pct}%
        </span>
      </div>

      <span style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, color: '#1a1a1a' }}>
        {count}
      </span>
      <span style={{ fontSize: 12, color: '#888', lineHeight: 1.3 }}>{config.label}</span>

      <div style={{ height: 3, background: '#f0f0f0', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{ height: '100%', width: `${pct}%`, background: config.bar, borderRadius: 999 }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const ClinicSummaryPopup = () => {
  const [visible, setVisible] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  const navigate = useNavigate()

  // ── unchanged: read hospital data ─────────────────────────────────────────
  const data = JSON.parse(localStorage.getItem('selectedHospital') || '{}')
  const hospitalData = data.data || {}
  const clinicId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')
  const role = localStorage.getItem('role')

  // ── fetch logic ───────────────────────────────────────────────────────────
  const checkSummary = async () => {
    if (role?.toUpperCase() !== 'RECEPTIONIST') return;

    try {
      const res = await http.post(`/getReceptionistDashboard/${clinicId}/${branchId}/${role}`)
      if (res.data?.success) {
        setSummaryData({
          name: hospitalData.name,
          ...res.data.data,
        })
        setVisible(true)
      }
    } catch (error) {
      console.error('Error fetching clinic summary:', error)
    }
  }

  // ── mount + interval logic ─────────────────────────────────────────────────
  useEffect(() => {
    checkSummary()

    // Helper: parse both "10:00 PM" (12-hr) and "22:00" (24-hr) into { hour, min }
    const parseTimeStr = (timeStr) => {
      if (!timeStr) return { hour: 0, min: 0 }
      const upperStr = timeStr.trim().toUpperCase()
      const isPM = upperStr.includes('PM')
      const isAM = upperStr.includes('AM')
      // Strip AM/PM and trim
      const clean = upperStr.replace('AM', '').replace('PM', '').trim()
      const [hourRaw, minRaw] = clean.split(':').map(Number)
      let hour = hourRaw
      if (isPM && hour !== 12) hour += 12   // e.g. "10:00 PM" → 22
      if (isAM && hour === 12) hour = 0      // "12:00 AM" → 0 (midnight)
      return { hour, min: minRaw || 0 }
    }

    const interval = setInterval(() => {
      const now = new Date()

      const startTimeStr = hospitalData.openingTime || hospitalData.startTime || '08:00'
      const closeTimeStr = hospitalData.closingTime || hospitalData.closeTime || '20:00'

      const { hour: startHour, min: startMin } = parseTimeStr(startTimeStr)
      const { hour: closeHour, min: closeMin } = parseTimeStr(closeTimeStr)

      const startTime = new Date(now)
      startTime.setHours(startHour, startMin, 0, 0)

      const closeTime = new Date(now)
      closeTime.setHours(closeHour, closeMin, 0, 0)

      const fortyFiveMinsBeforeClose = new Date(closeTime.getTime() - 45 * 60000)

      const isStartTime =
        now.getHours() === startTime.getHours() && now.getMinutes() === startTime.getMinutes()

      const is45MinsBeforeClose =
        now.getHours() === fortyFiveMinsBeforeClose.getHours() &&
        now.getMinutes() === fortyFiveMinsBeforeClose.getMinutes()

      if (isStartTime || is45MinsBeforeClose) {
        if (!window.hasTriggeredClinicSummaryThisMinute) {
          window.hasTriggeredClinicSummaryThisMinute = true
          checkSummary()
          setTimeout(() => {
            window.hasTriggeredClinicSummaryThisMinute = false
          }, 60000)
        }
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // ── ok handler ────────────────────────────────────────────────────────────
  const handleOk = async () => {
    try {
      if (role?.toUpperCase() === 'RECEPTIONIST') {
        await http.put(`/updateReceptionistDashboard/${clinicId}/${branchId}/${role}`, {
          status: true
        })
        console.log('Status updated to true in the backend.')
      }
    } catch (error) {
      console.error('Error updating dashboard status:', error)
    }

    setVisible(false)
    if (window.location.pathname !== '/followupDashboard') {
      navigate('/followupDashboard')
    }
  }

  if (!summaryData) return null

  // ── derived total for % calculation ──────────────────────────────────────
  const total = METRICS.reduce((sum, m) => sum + (summaryData[m.key] ?? 0), 0)

  // ── styles ────────────────────────────────────────────────────────────────
  const s = {
    header: {
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
    },
    headerIcon: {
      width: 38, height: 38, borderRadius: 10,
      background: '#E6F1FB',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    headerText: { flex: 1, minWidth: 0 },
    clinicName: {
      margin: 0, fontSize: 14, fontWeight: 500, color: '#1a1a1a',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    subtitle: { margin: 0, fontSize: 11, color: '#888' },
    badge: {
      marginLeft: 'auto', fontSize: 11, fontWeight: 500,
      padding: '3px 9px', borderRadius: 999,
      background: '#FAEEDA', color: '#633806', whiteSpace: 'nowrap', flexShrink: 0,
    },
    body: { padding: '14px 18px 18px' },
    grid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 8, marginBottom: '14px',
    },
    divider: { height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '0 0 14px' },
    totalRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 12,
    },
    totalLabel: { fontSize: 12, color: '#888' },
    totalVal: { fontSize: 13, fontWeight: 500, color: '#1a1a1a' },
    okBtn: {
      width: '100%', padding: '11px 0',
      background: '#1a1a1a', color: '#fff',
      border: 'none', borderRadius: 8,
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
  }

  return (
    <CModal
      visible={visible}
      onClose={() => { }}     /* unchanged: do nothing on close */
      backdrop="static"      /* unchanged */
      keyboard={false}       /* unchanged */
      alignment="center"
    >
      {/* ── Header ── */}
      <CModalHeader closeButton={false} style={{ padding: 0, border: 'none' }}>
        <div style={s.header}>
          <div style={s.headerIcon}>
            <i className="ti ti-building-hospital" style={{ fontSize: 18, color: '#ffffffff' }} />
          </div>
          <div style={s.headerText}>
            <CModalTitle style={s.clinicName}>
              {summaryData.name || 'Clinic Summary'}
            </CModalTitle>
            <p style={s.subtitle}>Daily summary · Today</p>
          </div>
          {/* <span style={s.badge}>
            <i className="ti ti-clock-pause" style={{ fontSize: 11, verticalAlign: -1, marginRight: 3 }} />
            Pending
          </span> */}
        </div>
      </CModalHeader>

      {/* ── Body ── */}
      <CModalBody style={s.body}>

        <div style={s.grid}>
          {METRICS.map((config) => (
            <StatCard
              key={config.key}
              config={config}
              count={summaryData[config.key] ?? 0}
              total={total}
            />
          ))}
        </div>

        <div style={s.divider} />

        <div style={s.totalRow}>
          <span style={s.totalLabel}>Total appointments today</span>
          <span style={s.totalVal}>{total}</span>
        </div>

        {/* ── OK button — unchanged handler ── */}
        <CButton style={s.okBtn} onClick={handleOk}>
          <i className="ti ti-layout-dashboard" style={{ fontSize: 15 }} />
          Go to follow-up dashboard
          <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
        </CButton>

      </CModalBody>
    </CModal>
  )
}

export default ClinicSummaryPopup