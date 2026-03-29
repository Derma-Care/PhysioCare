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
import { createTherapyNotes, getDashboard } from "./TheraphyApi"
import { convertToBase64 } from "../../../Utils/Base64Convert"
import { showCustomToast } from "../../../Utils/Toaster"

export default function SessionFormModal({
  visible,
  data,
  onClose,
  onSave,
}) {

  const [notes, setNotes] = useState("")
  const [before, setBefore] = useState(null)
  const [after, setAfter] = useState(null)
  const[loading, setLoading]=useState(false)

  const [beforeVideo, setBeforeVideo] = useState(null)
  const [afterVideo, setAfterVideo] = useState(null)

  const [painBefore, setPainBefore] = useState("")
  const [painAfter, setPainAfter] = useState("")

  const [result, setResult] = useState("")
  const [nextPlan, setNextPlan] = useState("")

  const [error, setError] = useState({})
 
  const storedData = localStorage.getItem('therapistData')
  const theraphydata = location.state || (storedData ? JSON.parse(storedData) : {})
  const [dashboard, setDashboard] = useState(null)
  const clinicId = theraphydata?.clinicId
  const branchId = theraphydata?.branchId
  const therapistId = theraphydata?.therapistId
    const fetchTheraphyAssignData = async () => {
    const data = await getDashboard(clinicId, branchId, therapistId)
console.log("DASHBOARD DATA:", data)
    setDashboard(data)
    setRecords(data?.records || [])
  }
const save = async () => {
  let err = {}

  if (!notes) err.notes = "Notes required"
  if (!before) err.before = "Before image required"
  if (!after) err.after = "After image required"
  if (!painBefore) err.painBefore = "Select pain before"
  if (!painAfter) err.painAfter = "Select pain after"
  if (!result) err.result = "Select result"

  setError(err)
  if (Object.keys(err).length > 0) return

  try {
    setLoading(true) // 🔥 start loader

    const beforeBase64 = await convertToBase64(before)
    const afterBase64 = await convertToBase64(after)

    const beforeVideoBase64 = beforeVideo
      ? await convertToBase64(beforeVideo)
      : ""

    const afterVideoBase64 = afterVideo
      ? await convertToBase64(afterVideo)
      : ""

    const now = new Date()

    const theraphydata = JSON.parse(localStorage.getItem("therapistData"))

    const payload = {
      therapistRecordId:data.therapistRecordId,// "69c7fb9e12a2888ad282076d",
      clinicId: theraphydata?.clinicId,
      branchId: theraphydata?.branchId,
      patientId:data.patientId,// "000201_PT_9BBAE3",
      bookingId:data.bookingId ,//"69c7ae8e0f1d067d87a8b070",
      therapistId: theraphydata?.therapistId,
      sessionId: data.sessionId,

      patientName: data.patientName,
      therapy: data.therapy,

      date: data.sessionDate,
      completedDate: now.toLocaleDateString(),
      completedTime: now.toLocaleTimeString(),

      duration: data.duration,
      // exercises: data.exercises,

      painBefore,
      painAfter,

      therapistNotes: notes,
      // patientResponse: data.patientResponse,

      result,
      mode: "complete",
      nextPlan,

      beforeImage: beforeBase64,
      afterImage: afterBase64,
      beforeVideo: beforeVideoBase64,
      afterVideo: afterVideoBase64,
    }

    console.log("FINAL PAYLOAD", payload)

    const res = await createTherapyNotes(payload)

    console.log("SUCCESS", res)

    // ✅ Success toast (from backend if available)
    showCustomToast(res?.message || "Saved successfully!")
if(res){
  fetchTheraphyAssignData()
}
    // onSave(res)
//     onSave({
// //   ...payload, // original session
//   status: "Completed", // 🔥 force update
// //   // painBefore,
// //   // painAfter,
// //   // therapistNotes: notes,
// //   // result,
// //   //  nextPlan, 
// //   beforeVideo:   beforeVideo,
// //       afterVideo: afterVideo,
// //   // // beforeImage: beforeBase64,
// //   // afterImage: afterBase64,
// //    beforeImage: `data:image/jpeg;base64,${beforeBase64}`, // ✅ FIX
// //   afterImage: `data:image/jpeg;base64,${afterBase64}`,   // ✅ FIX
// })
    onClose()
  } catch (err) {
    console.log("FAILED", err?.response?.data || err.message)

    // ❌ Error toast
    toast.error(
      err?.response?.data?.message || "Something went wrong!"
    )
  } finally {
    setLoading(false) // 🔥 stop loader
  }
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
           <CCol md={6}>
            <b>SessionId :</b> {data.sessionId}
          </CCol>
            <CCol md={6}>
            <b>Therapist RecordId :</b> {data.therapistRecordId}
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
          onChange={(e) => {
    setNotes(e.target.value)
    setError((prev) => ({ ...prev, notes: "" })) // ✅ clear error
  }}
  invalid={!!error.notes}
        />
{error.notes && (
  <small style={{ color: "red" }}>{error.notes}</small>
)}
        {/* Pain scale */}

        <CRow className="mt-3">

          <CCol md={6}>

            <label>Pain Before</label>

            <CFormSelect
              value={painBefore}
            onChange={(e) => {
    setPainBefore(e.target.value)
    setError((prev) => ({ ...prev, painBefore: "" }))
  }}
  invalid={!!error.painBefore}
              
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
          {error.painBefore && (
  <small style={{ color: "red" }}>{error.painBefore}</small>
)}
          </CCol>


          <CCol md={6}>

            <label>Pain After</label>

            <CFormSelect
              value={painAfter}
      onChange={(e) => {
    setPainAfter(e.target.value)
    setError((prev) => ({ ...prev, painAfter: "" }))
  }}
  invalid={!!error.painAfter}
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
{error.painBefore && (
  <small style={{ color: "red" }}>{error.painBefore}</small>
)}
          </CCol>

        </CRow>

        <hr />

        {/* Result */}

        <label>Session Result</label>

        <CFormSelect
          value={result}
        onChange={(e) => {
    setResult(e.target.value)
    setError((prev) => ({ ...prev, result: "" }))
  }}
  invalid={!!error.result}
        >
          <option value="">Select</option>
          <option>Completed</option>
          <option>Partially Completed</option>
          <option>Skipped</option>
          <option>Patient not available</option>
        </CFormSelect>
{error.result && (
  <small style={{ color: "red" }}>{error.result}</small>
)}
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
             onChange={(e) => {
    setBefore(e.target.files[0])
    setError((prev) => ({ ...prev, before: "" }))
  }}
  invalid={!!error.before}
            />
{error.before && (
  <small style={{ color: "red" }}>{error.before}</small>
)}
{/* if (before && !before.type.startsWith("image/")) {
  error.before = "Only image allowed"
} */}
          </CCol>

          <CCol md={6}>

            <label>After Image</label>

            <CFormInput
              type="file"
              onChange={(e) => {
    setAfter(e.target.files[0])
    setError((prev) => ({ ...prev, after: "" }))
  }}
  invalid={!!error.after}
            />
{/* {error.before && (
  <small style={{ color: "red" }}>{error.afterImage}</small>
)} */}
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

            {/* if (beforeVideo && !beforeVideo.type.startsWith("video/")) {
  error.beforeVideo = "Only video allowed"
} */}

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
<div className="d-flex justify-content-end w-100">
        <CButton
          color="success" 
          onClick={save}
          disabled={loading} // 🔥 disable while loading
        >
         {loading ? "Saving...":"Save Session"} 
        </CButton>
</div>
      </CModalBody>

    </CModal>

  )

}