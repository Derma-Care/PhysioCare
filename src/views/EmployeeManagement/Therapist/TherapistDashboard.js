import React, { useEffect, useState } from 'react'
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
  CSpinner,  
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'

import { getAllPatients, getPatientBySession, getStats, getTodaySessions } from './therapistService'
import { useLocation, useNavigate } from 'react-router-dom'
import { getClinicData } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'

export default function TherapyDashboard() {
  const stats = getStats()
  const today = getTodaySessions()
  // const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState(1)
  const [therapyData, setTherapyData] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()

  const storedData = localStorage.getItem('loginPayload')
  const data = location.state || (storedData ? JSON.parse(storedData) : {})

  const clinicId = data?.clinicId
  const branchId = data?.branchId
  const therapistId = data?.therapistId
 const [selected, setSelected] = useState(null)
  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await getClinicData(clinicId, branchId, therapistId)

      console.log('API Response:', res)

      const finalData = res?.data || []

      setTherapyData(finalData)
    } catch (err) {
      console.error('Fetch Error:', err)
      setTherapyData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchData()
    }
  }, [clinicId, branchId, therapistId])

  const list = therapyData || []
const patientList = getAllPatients()
console.log(patientList)
  return (

    <>
    <CContainer fluid>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <CSpinner color="primary" />
          <p>Loading therapy data...</p>
        </div>
      ) : (
        <>
          {/* ✅ THERAPIST LIST */}
        

     

          {/* Stats Cards */}
<CRow className="g-3">

  {/* ✅ DOCTOR CARDS */}
  {list.length === 0 ? (
    <CCol md={3}>
      <CCard className="p-3 text-center h-100">
        <h5>No Data Found</h5>
      </CCard>
    </CCol>
  ) : (
    list.map((item, index) => (
      <CCol md={3} key={index} className="d-flex">
        <CCard
          className="w-100 h-100 shadow-sm"
          style={{ borderRadius: "12px" }}
        >
          <CCardBody className="d-flex flex-column justify-content-between">

            {/* TOP */}
            <div>
              <CRow className="align-items-center">
                <CCol xs={4} className="text-center">
                  <img
                    src={
                      item?.documents?.profilePhoto
                        ? `data:image/jpeg;base64,${item.documents.profilePhoto}`
                        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="profile"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </CCol>

                <CCol xs={8}>
                  <h6 style={{ margin: 0 }}>
                    {item?.fullName}
                  </h6>

                  <small>{item?.qualification}</small>

                  <p style={{ fontSize: "12px" }}>
                    {item?.specializations?.join(", ")}
                  </p>
                </CCol>
              </CRow>
            </div>

            {/* BOTTOM */}
            <div className="text-end">
              <CButton
                size="sm"
                color="primary"
                onClick={() =>
                  navigate("/therapist-details", {
                    state: item,
                  })
                }
              >
                View
              </CButton>
            </div>

          </CCardBody>
        </CCard>
      </CCol>
    ))
  )}

  {/* ✅ STATS CARDS */}
  <CCol md={3} className="d-flex">
    <CCard color="primary" textColor="white" className="w-100 h-100">
      <CCardBody className="d-flex flex-column justify-content-center text-center">
        <h6>Today Assigned</h6>
        <h2>{stats.todayCount}</h2>
        <small>{stats.todayTime} min</small>
      </CCardBody>
    </CCard>
  </CCol>

  <CCol md={3} className="d-flex">
    <CCard color="success" textColor="white" className="w-100 h-100">
      <CCardBody className="d-flex flex-column justify-content-center text-center">
        <h6>Week Assigned</h6>
        <h2>{stats.weekCount}</h2>
        <small>{stats.weekTime} min</small>
      </CCardBody>
    </CCard>
  </CCol>

  <CCol md={3} className="d-flex">
    <CCard color="warning" textColor="white" className="w-100 h-100">
      <CCardBody className="d-flex flex-column justify-content-center text-center">
        <h6>Month Assigned</h6>
        <h2>{stats.monthCount}</h2>
        <small>{stats.monthTime} min</small>
      </CCardBody>
    </CCard>
  </CCol>

</CRow>

 
        

          {/* Sessions */}
          <CCard className="mt-4">
            <CCardBody>
              <CNav variant="tabs" className="mb-3">
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

              {/* Filter */}
              {/* <CRow className="mb-3">
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
              </CRow> */}

              {/* <h5>Today Sessions</h5> */}

<h5>Patients</h5>

{patientList.map((p) => (
  <CCard key={p.patientId} className="mb-3">
    <CCardBody>
      <b>Patient: {p.name}</b>
      <br />

      Therapy: {p.therapy}
      <br />

      Duration: {p.duration}
      <br />

      <CBadge
        color={
          p.status === "Completed"
            ? "success"
            : p.status === "In Progress"
            ? "warning"
            : "secondary"
        }
      >
        {p.status}
      </CBadge>

      <br /><br />

   <CButton
  size="sm"
  color="primary"
  className="me-2"
  onClick={() => {
    navigate("/session-list", {
      state: {
        name: p.name,
        therapy: p.therapy,
        doctorName: p.doctorName,
        sessions: p.sessions,
      },
    })
  }}
>
  Sessions
</CButton>

<CButton
  size="sm"
  color="info"
  onClick={() => setSelected(p)} // ✅ now full data
>
  View
</CButton>
    </CCardBody>
  </CCard>
))}
            </CCardBody>
          </CCard>
        </>
      )}
    </CContainer>

      {/* <CModal visible={!!selected} onClose={() => setSelected(null)} size="lg">
        <CModalHeader>
          <CModalTitle>Patient Full Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          {selected && (
            <div>
              <h5>{selected.name}</h5>

              <p><b>Age:</b> {selected.age}</p>
              <p><b>Sex:</b> {selected.sex}</p>
              <p><b>Mobile:</b> {selected.mobileNumber}</p>

              <p><b>Therapy:</b> {selected.therapy}</p>
              <p><b>Disease:</b> {selected.disease}</p>
              <p><b>Doctor:</b> {selected.doctorName}</p>

              <hr />

              <h6>Complaints</h6>
              <p>{selected.complaints.complaintDetails}</p>

              <h6>Assessment</h6>
              <p>{selected.assessment.chiefComplaint}</p>
              <p>Pain: {selected.assessment.painScale}</p>

              <h6>Diagnosis</h6>
              <p>{selected.diagnosis.physioDiagnosis}</p>

              <h6>Treatment Plan</h6>
              <p>Modalities: {selected.treatmentPlan.modalities.join(", ")}</p>
              <p>Duration: {selected.treatmentPlan.sessionDuration}</p>

              <h6>Exercise Plan</h6>
              {selected.exercisePlan.exercises.map((e, i) => (
                <p key={i}>
                  {e.name} ({e.sets} x {e.reps})
                </p>
              ))}
            </div>
          )}
        </CModalBody>
      </CModal> */}
      <PatientViewModal
  visible={!!selected}
  data={selected}
  onClose={() => setSelected(null)}
/>
      </>
  )
}