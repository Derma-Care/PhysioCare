import React, { useState } from "react"
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CButton,
  CFormTextarea,
} from "@coreui/react"

export default function SessionModal({
  data,
  onClose,
}) {

  const [notes, setNotes] = useState("")

  return (

    <CModal visible onClose={onClose}>

      <CModalHeader>
        <CModalTitle>
          {data.patientName}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>

        Disease: {data.disease}
        <br />

        Therapy: {data.therapy}
        <br />

        Time: {data.time}

        <CFormTextarea
          className="mt-3"
          placeholder="Notes"
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <input
          type="file"
          className="mt-2"
        />

        <input
          type="file"
          className="mt-2"
        />

        <CButton className="mt-3">
          Save
        </CButton>

      </CModalBody>

    </CModal>
  )
}