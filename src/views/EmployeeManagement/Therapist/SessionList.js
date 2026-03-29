import React, { useState } from "react"
import {
  CCard,
  CCardBody,
  CTable,
  CButton,
  CBadge,
} from "@coreui/react"

import { useLocation } from "react-router-dom"
import SessionModal from "./SessionModal"
import SessionViewModal from "./SessionViewModal"
import SessionFormModal from "./SessionFormModal"
import { getSessionDetails } from "./TheraphyApi"

export default function SessionList() {

  const location = useLocation()

  const patient = location.state || {}
const [loadingId, setLoadingId] = useState(null)
  const [sessions, setSessions] = useState(
    patient.sessions || []
  )

  const [selected, setSelected] = useState(null)

console.log(patient)
  // update after modal save
const handleUpdate = (updated) => {
  const newList = sessions.map((s) =>
    s.sessionId === updated.sessionId
      ? { ...s, ...updated } // ✅ merge
      : s
  )

  setSessions(newList)
}

const [selectedSession, setSelectedSession] = useState(null)
 

// const handleView = async (item,therapistRecordId) => {
//   const storedData = localStorage.getItem('therapistData')
//   const raw = JSON.parse(storedData) || {}

//   console.log("RAW DATA:", raw)

//   const clinicId = raw?.clinicId || raw?.data?.clinicId
//   const branchId = raw?.branchId || raw?.data?.branchId
  
//   console.log("IDs:", clinicId, branchId, therapistRecordId)

//   if (!clinicId || !branchId || !therapistRecordId) {
//     console.error("Missing required IDs")
//     return
//   }

//   const res = await getSessionDetails(
//     clinicId,
//     branchId,
//     therapistRecordId,
//     item.sessionId
//   )

//   if (res) {
//     setSelectedSession(res.data || res)
  
//   }
// }
const handleView = async (item, therapistRecordId) => {
  setLoadingId(item.sessionId) // ✅ start loading

  try {
    const storedData = localStorage.getItem('therapistData')
    const raw = JSON.parse(storedData) || {}

    const clinicId = raw?.clinicId || raw?.data?.clinicId
    const branchId = raw?.branchId || raw?.data?.branchId

    if (!clinicId || !branchId || !therapistRecordId) {
      console.error("Missing required IDs")
      return
    }

    const res = await getSessionDetails(
      clinicId,
      branchId,
      therapistRecordId,
      item.sessionId
    )

    if (res) {
      setSelectedSession(res.data || res)
    }
  } catch (err) {
    console.error(err)
  } finally {
    setLoadingId(null) // ✅ stop loading
  }
}

  return (

    <CCard>

      <CCardBody>

        <h4 className="fw-bold">{patient.name}</h4>
        <div> <strong>Therapy Name:</strong> {patient.therapy}</div>
        <div> <strong>Assigned By: </strong> {patient.doctorName}</div>
        {/* {sessions.map((s)=>(
          <div>
            <p>modalitiesUsed: {s.modalities}</p>
            <p>exercisesDone: {s.exercises}</p>
            
          </div>
        )

        )} */}

        <CTable bordered className="pink-table mt-3">

          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Modalities Used</th>
              <th>Exercises</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {sessions.map((s) => (

              <tr key={s.sessionId}>

                <td>{s.sessionDate}</td> 

                <td>{s.duration}</td>
                <td>{s.modalitiesUsed}</td>
                <td>{s.exercisesDone}</td>
 

                <td>

                  <CBadge color="info">
                    {s.status}
                  </CBadge>

                </td>

                <td>

                 

{s.status?.toLowerCase() !== "completed" ? (
  <CButton
    size="sm"
    color="success"
    onClick={() => {
      setSelected({
        ...s,
        mode: "complete",
        patientName: patient.name,
        bookingId: patient.bookingId,
        patientId: patient.patientId,
        therapy: patient.therapy,
        disease: patient.disease,
        therapistRecordId:patient.therapistRecordId
      })
    }}
  >
    Complete
  </CButton>
) : (
<CButton
  size="sm"
  color="primary"
  disabled={loadingId === s.sessionId} // ✅ disable
  onClick={async () => {
    await handleView(s, patient.therapistRecordId)

    setSelected({
      ...s,
      mode: "view",
      patientName: patient.name,
      bookingId: patient.bookingId,
      patientId: patient.patientId,
      therapy: patient.therapy,
      disease: patient.disease,
      therapistRecordId: patient.therapistRecordId
    })
  }}
>
  {loadingId === s.sessionId ? (
    <>
      <span className="spinner-border spinner-border-sm me-1" />
      Opening...
    </>
  ) : (
    "View"
  )}
</CButton>
)}

                </td>

              </tr>

            ))}

          </tbody>

        </CTable>


{selected && selected.mode === "complete" && (
  <SessionFormModal
    visible={true}
    data={selected}
    onClose={() => setSelected(null)}
    onSave={handleUpdate}
  />
)}

{selected && selected.mode === "view" && (
  <SessionViewModal
    visible={true}
    data={selectedSession}
    onClose={() => {
      setSelected(null)
 
    }}
  />
)}

      </CCardBody>

    </CCard>

  )

}