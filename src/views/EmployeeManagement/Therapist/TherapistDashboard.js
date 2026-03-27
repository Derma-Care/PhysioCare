import React from 'react'
import { CCard, CCardBody, CRow, CCol, CContainer, CBadge, CButton } from '@coreui/react'

// import {
//   getStats,
//   getTodaySessions,
// } from "./services/therapistService"
import { therapistInfo } from './commonData'
import { getPatientBySession, getStats, getTodaySessions } from './therapistService'
import { useNavigate } from 'react-router-dom'

export default function TherapyDashboard() {
  const stats = getStats()
  const today = getTodaySessions()
  
const navigate=useNavigate()
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
          <h5>Today Sessions</h5>
           {/* <h5>New Sessions</h5>
            <h5>Active Sessions</h5>
            <h5>Completed Sessions</h5> */}

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

    navigate("/session-list", {
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
