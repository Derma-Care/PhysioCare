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

export default function SessionList() {

  const location = useLocation()

  const patient = location.state || {}

  const [sessions, setSessions] = useState(
    patient.sessions || []
  )

  const [selected, setSelected] = useState(null)


  // update after modal save
  const handleUpdate = (updated) => {

    const newList = sessions.map((s) =>

      s.sessionId === updated.sessionId
        ? updated
        : s

    )

    setSessions(newList)

  }


  return (

    <CCard>

      <CCardBody>

        <h4>{patient.name}</h4>

        <p>Therapy: {patient.therapy}</p>

        <p>Disease: {patient.disease}</p>


        <CTable bordered>

          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {sessions.map((s) => (

              <tr key={s.sessionId}>

                <td>{s.date}</td>

                <td>{s.duration}</td>

                <td>

                  <CBadge color="info">
                    {s.status}
                  </CBadge>

                </td>

                <td>

                 

       {!s.completedTime && (

<CButton
size="sm"
color="success"
onClick={() => {

setSelected({
  ...s,
  mode: "complete",
  patientName: patient.name,
  therapy: patient.therapy,
  disease: patient.disease,
})

}}
>
Complete
</CButton>

)}

{s.completedTime && (

<CButton
size="sm"
color="primary"
onClick={() => {

setSelected({
  ...s,
  mode: "view",
  patientName: patient.name,
  therapy: patient.therapy,
  disease: patient.disease,
})

}}
>
View
</CButton>

)}

                </td>

              </tr>

            ))}

          </tbody>

        </CTable>


        {selected?.mode === "complete" && (

  <SessionFormModal
    visible
    data={selected}
    onClose={() => setSelected(null)}
    onSave={handleUpdate}
  />

)}

{selected?.mode === "view" && (

  <SessionViewModal
    visible
    data={selected}
    onClose={() => setSelected(null)}
  />

)}

      </CCardBody>

    </CCard>

  )

}