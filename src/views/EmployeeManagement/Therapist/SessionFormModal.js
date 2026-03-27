/* eslint-disable react/prop-types */

import React, { useState } from "react"
import {
  CModal,
  CModalHeader,
  CModalBody,
  CButton,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CRow,
  CCol,
} from "@coreui/react"

export default function SessionFormModal({
  visible,
  data,
  onClose,
  onSave,
}) {

  const [notes, setNotes] = useState("")
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)

  const [beforeVideo, setBeforeVideo] = useState(null)
  const [afterVideo, setAfterVideo] = useState(null)

  const [painBefore, setPainBefore] = useState("")
  const [painAfter, setPainAfter] = useState("")

  const [result, setResult] = useState("")
  const [nextPlan, setNextPlan] = useState("")

  const [error, setError] = useState({})

  const save = () => {

    let err = {}

    if (!notes) err.notes = true
    if (!before) err.before = true
    if (!after) err.after = true
    if (!painBefore) err.painBefore = true
    if (!painAfter) err.painAfter = true

    setError(err)

    if (Object.keys(err).length > 0) return

    const now = new Date()

    const updated = {

      ...data,

      status: "completed",

      therapistNotes: notes,

      painBefore,
      painAfter,

      result,
      nextPlan,

      duration: data.duration,

      beforeImage: URL.createObjectURL(before),

      afterImage: URL.createObjectURL(after),

      beforeVideo: beforeVideo
        ? URL.createObjectURL(beforeVideo)
        : data.beforeVideo,

      afterVideo: afterVideo
        ? URL.createObjectURL(afterVideo)
        : data.afterVideo,

      completedTime: now.toLocaleTimeString(),

      completedDate: now.toLocaleDateString(),

    }

    onSave(updated)
    onClose()

  }

  return (

    <CModal
      visible={visible}
      onClose={onClose}
      backdrop="static"
      size="lg" className="custom-modal"
    >

      <CModalHeader>
        Complete Session
      </CModalHeader>

      <CModalBody>

        {/* Header info */}

        <CRow>

          <CCol md={6}>
            <b>Patient :</b> {data.patientName}
          </CCol>

          <CCol md={6}>
            <b>Therapy :</b> {data.therapy}
          </CCol>

          <CCol md={6}>
            <b>Date :</b> {new Date().toLocaleDateString()}
          </CCol>

          <CCol md={6}>
            <b>Time :</b> {new Date().toLocaleTimeString()}
          </CCol>

        </CRow>

        <hr />

        {/* Doctor notes */}

        <b>Doctor Notes</b>

        <div className="mb-2">
          {data.doctorNotes}
        </div>

        <hr />

        {/* Therapist notes */}

        <CFormTextarea
          label="Therapist Notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          invalid={error.notes}
        />

        {/* Pain scale */}

        <CRow className="mt-3">

          <CCol md={6}>

            <label>Pain Before</label>

            <CFormSelect
              value={painBefore}
              onChange={(e) =>
                setPainBefore(e.target.value)
              }
            >
              <option value="">Select</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </CFormSelect>

          </CCol>

          <CCol md={6}>

            <label>Pain After</label>

            <CFormSelect
              value={painAfter}
              onChange={(e) =>
                setPainAfter(e.target.value)
              }
            >
              <option value="">Select</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </CFormSelect>

          </CCol>

        </CRow>

        <hr />

        {/* Result */}

        <label>Session Result</label>

        <CFormSelect
          value={result}
          onChange={(e) =>
            setResult(e.target.value)
          }
        >
          <option value="">Select</option>
          <option>Completed</option>
          <option>Partially Completed</option>
          <option>Skipped</option>
          <option>Patient not available</option>
        </CFormSelect>

        <hr />

        {/* Next plan */}

        <CFormTextarea
          label="Next Session Plan"
          value={nextPlan}
          onChange={(e) =>
            setNextPlan(e.target.value)
          }
        />

        <hr />

        {/* Images */}

        <CRow>

          <CCol md={6}>

            <label>Before Image</label>

            <CFormInput
              type="file"
              onChange={(e) =>
                setBefore(e.target.files[0])
              }
            />

          </CCol>

          <CCol md={6}>

            <label>After Image</label>

            <CFormInput
              type="file"
              onChange={(e) =>
                setAfter(e.target.files[0])
              }
            />

          </CCol>

        </CRow>

        <hr />

        {/* Videos */}

        <CRow>

          <CCol md={6}>

            <label>Before Video</label>

            <CFormInput
              type="file"
              onChange={(e) =>
                setBeforeVideo(e.target.files[0])
              }
            />

          </CCol>

          <CCol md={6}>

            <label>After Video</label>

            <CFormInput
              type="file"
              onChange={(e) =>
                setAfterVideo(e.target.files[0])
              }
            />

          </CCol>

        </CRow>

        <hr />

        <CButton
          color="success"
          onClick={save}
        >
          Save Session
        </CButton>

      </CModalBody>

    </CModal>

  )

}