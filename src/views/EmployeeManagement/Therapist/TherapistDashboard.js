import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CContainer,
  CBadge,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CFormInput,
} from '@coreui/react'

// import {
//   getStats,
//   getTodaySessions,
// } from "./services/therapistService"
import { therapistInfo } from './commonData'
import { getPatientBySession, getStats, getTodaySessions } from './therapistService'
import { useLocation, useNavigate } from 'react-router-dom'

export default function TherapyDashboard() {
  const stats = getStats()
  const today = getTodaySessions()
  const [tab, setTab] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const location = useLocation()
  const data = location.state || JSON.parse(localStorage.getItem('loginPayload'))

  console.log('Therapist Data', data)

  const navigate = useNavigate()
  return (
    <CContainer fluid>
      {/* Therapist Info */}

      <CCard className="mb-3">
        <CCardBody>
          <h4>{therapistInfo.name}</h4>

          <CBadge color="info">{therapistInfo.specialization}</CBadge>
        </CCardBody>
      </CCard>

      {/* Cards */}

      <CRow>
        <CCol md={4}>
          <CCard color="primary" textColor="white">
            <CCardBody>
              <h5>Today Assigned</h5>

              <h3>{stats.todayCount}</h3>

              <p>{stats.todayTime} min</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4}>
          <CCard color="success" textColor="white">
            <CCardBody>
              <h5>Week Assigned</h5>

              <h3>{stats.weekCount}</h3>

              <p>{stats.weekTime} min</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={4}>
          <CCard color="warning" textColor="white">
            <CCardBody>
              <h5>Month Assigned</h5>

              <h3>{stats.monthCount}</h3>

              <p>{stats.monthTime} min</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Today Sessions */}

      <CCard className="mt-4">
        <CCardBody>
          {/* <h5>New Sessions</h5>
            <h5>Active Sessions</h5>
            <h5>Completed Sessions</h5> */}
          <CNav variant="tabs" className="mb-3" style={{ cursor: 'pointer' }}>
            <CNavItem>
              <CNavLink active={tab === 1} onClick={() => setTab(1)}>
                New Sessions
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink active={tab === 2} onClick={() => setTab(2)}>
                Active Sessions
              </CNavLink>
            </CNavItem>

            <CNavItem>
              <CNavLink active={tab === 3} onClick={() => setTab(3)}>
                Completed Sessions
              </CNavLink>
            </CNavItem>
          </CNav>
          <CRow className="mt-3 mb-3">
            <CCol md={3}>
              <CButton
                color="primary"
                onClick={() => {
                  const todayDate = new Date().toISOString().split('T')[0]
                  setSelectedDate(todayDate)
                }}
              >
                Today
              </CButton>
            </CCol>

            <CCol md={4}>
              <CFormInput
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </CCol>

            <CCol md={3}>
              <CButton color="success">Filter</CButton>
            </CCol>
          </CRow>
          <h5>Today Sessions</h5>

          {today.map((s) => (
            <CCard key={s.sessionId} className="mb-2">
              <CCardBody>
                <b>{s.patientName}</b>
                <br />
                Therapy: {s.therapy}
                <br />
                Duration: {s.duration} min
                <br />
                <CBadge color="secondary" className="me-2">
                  {s.status}
                </CBadge>
                <CButton
                  size="sm"
                  color="primary"
                  onClick={() => {
                    const patient = getPatientBySession(s.sessionId)

                    navigate('/session-list', {
                      state: patient,
                    })
                  }}
                >
                  View
                </CButton>
              </CCardBody>
            </CCard>
          ))}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}
