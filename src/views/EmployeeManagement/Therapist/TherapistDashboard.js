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
import { getClinicData, getDashboard } from './TheraphyApi'
import PatientViewModal from './PatientViewModal'
import capitalizeWords from '../../../Utils/capitalizeWords'

export default function TherapyDashboard() {

  // const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState(1)
  const [therapyData, setTherapyData] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()

  const [records, setRecords] = useState([])
  const storedData = localStorage.getItem('therapistData')
  const data = location.state || (storedData ? JSON.parse(storedData) : {})
  const [dashboard, setDashboard] = useState(null)
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
    const fetchTheraphyAssignData = async () => {
    const data = await getDashboard(clinicId, branchId, therapistId)
console.log("DASHBOARD DATA:", data)
    setDashboard(data)
    setRecords(data?.records || [])
  }

  useEffect(() => {
    if (clinicId && branchId && therapistId) {
      fetchData()
       fetchTheraphyAssignData()
    }
  }, [clinicId, branchId, therapistId])


 

  const list = therapyData || []
const patientList = getAllPatients(records)
console.log(patientList)
  const stats = getStats(dashboard)
  const today = getTodaySessions(records)
const filteredPatients = patientList.filter((p) => {
  if (tab === 1) return p.overallStatus === "Pending"
  if (tab === 2) return p.overallStatus === "Active"
  if (tab === 3) return p.overallStatus === "Completed"
  return true
})
console.log(selected)
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
                    {capitalizeWords(item?.fullName)}
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
        <h6>Today's Appointments</h6>
        {/* <h2>{stats.todayPatientCount || 0 }</h2> */}
        <h2>{records.length || 0 }</h2>
        <small>{stats.todayWorkingMinutes || 0} min</small>
      </CCardBody>
    </CCard>
  </CCol>

  <CCol md={3} className="d-flex">
    <CCard color="success" textColor="white" className="w-100 h-100">
      <CCardBody className="d-flex flex-column justify-content-center text-center">
        <h6>Weekly Appointments</h6>
        <h2>{stats.weeklyPatientCount || 0}</h2>
        <small>{stats.weeklyWorkingMinutes || 0} min</small>
      </CCardBody>
    </CCard>
  </CCol>

  <CCol md={3} className="d-flex">
    <CCard color="warning" textColor="white" className="w-100 h-100">
      <CCardBody className="d-flex flex-column justify-content-center text-center">
        <h6>Monthly Appointments</h6>
        <h2>{stats.monthlyPatientCount || 0}</h2>
        <small>{stats.monthlyWorkingMinutes || 0} min</small>
      </CCardBody>
    </CCard>
  </CCol>

</CRow>

 
        

          {/* Sessions */}
          <CCard className="mt-4" style={{cursor:"pointer"}}>
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

{filteredPatients.length === 0 ? (
  <p>No Data Found</p>
) : (
  filteredPatients.map((p) => (
<CCard key={p.patientId} className="mb-3">
  <CCardBody>

    {/* 🔷 Top Row (Patient + View Button) */}
    <div className="d-flex justify-content-between align-items-center ">

      <div>
        <b>Patient: {p.name}</b>
        <br />
        Therapy: {p.therapy}
        <br />
        No of Sessions: {p.therapySessions.length}
        <br />

    <CBadge
  color={
    p.overallStatus?.toLowerCase() === "completed"
      ? "success"
      : p.overallStatus?.toLowerCase() === "active"
      ? "warning"
      : "secondary"
  }
>
  {p.overallStatus}
</CBadge>
      </div>
<div className="d-flex flex-column justify-content-center align-items-center ">
      {/* 🔥 View Button (Top Right) */}
      <CButton
        size="sm"
        color="info"
        style={{ color: "white" }}
        className='mb-2'
        onClick={() => setSelected(p)}
      >
        View Details
      </CButton>
       {/* 🔷 Bottom Row (Sessions Button Right) */}
            <CButton
        size="sm"
        color="primary"
        onClick={() => {
          navigate("/session-list", {
            state: {
              name: p.name,
              therapy: p.therapy,
              doctorName: p.doctorName,
              sessions: p.therapySessions,
              therapistRecordId: p.therapistRecordId,
              patientId: p.patientId,
              bookingId: p.bookingId,
            },
          })
        }}
      >
        Sessions
      </CButton>
</div>
    </div>

   
 

  </CCardBody>
</CCard>
  ))
)}
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