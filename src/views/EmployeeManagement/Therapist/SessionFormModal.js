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
import { useNavigate } from "react-router-dom"

export default function SessionFormModal({
  visible,
  data,
  onClose,
  onSave,
}) {
const navigate = useNavigate()
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
//     const fetchTheraphyAssignData = async () => {
//     const data = await getDashboard(clinicId, branchId, therapistId)
// console.log("DASHBOARD DATA:", data)
//     setDashboard(data)
//     setRecords(data?.records || [])
//   }
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
if(res.statusCode === 201 || res.statusCode === 200){

  showCustomToast(res?.message || "Saved successfully!")
  navigate("/therapist")
}
    // ✅ Success toast (from backend if available)
// if(res){
//   fetchTheraphyAssignData()
// }
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

 
const [errors, setErrors] = useState({})

const handleBeforeVideo = (file) => {
  let err = { ...errors }

  if (!file) return

  // Type check
  if (!file.type.startsWith("video/")) {
    err.beforeVideo = "Only video files are allowed"
  }
  // Size check (2MB)
  else if (file.size > 2 * 1024 * 1024) {
    err.beforeVideo = "Video must be less than 2MB"
  } else {
    delete err.beforeVideo
    setBeforeVideo(file)
  }

  setErrors(err)
}

const handleAfterVideo = (file) => {
  let err = { ...errors }

  if (!file) return

  if (!file.type.startsWith("video/")) {
    err.afterVideo = "Only video files are allowed"
  } else if (file.size > 2 * 1024 * 1024) {
    err.afterVideo = "Video must be less than 2MB"
  } else {
    delete err.afterVideo
    setAfterVideo(file)
  }

  setErrors(err)
}

const handleBeforeImage = (file) => {
  let err = { ...error }

  if (!file) return

  // Type check
  if (!file.type.startsWith("image/")) {
    err.before = "Only image files are allowed"
  }
  // Size check (1MB)
  else if (file.size > 1 * 1024 * 1024) {
    err.before = "Image must be less than 1MB"
  } else {
    delete err.before
    setBefore(file)
  }

  setError(err)
}

const handleAfterImage = (file) => {
  let err = { ...error }

  if (!file) return

  if (!file.type.startsWith("image/")) {
    err.after = "Only image files are allowed"
  } else if (file.size > 1 * 1024 * 1024) {
    err.after = "Image must be less than 1MB"
  } else {
    delete err.after
    setAfter(file)
  }

  setError(err)
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
      accept="image/*" // 🔥 only image picker
      onChange={(e) => handleBeforeImage(e.target.files[0])}
      invalid={!!error.before}
    />

    {error.before && (
      <small style={{ color: "red" }}>{error.before}</small>
    )}
  </CCol>

  <CCol md={6}>
    <label>After Image</label>

    <CFormInput
      type="file"
      accept="image/*"
      onChange={(e) => handleAfterImage(e.target.files[0])}
      invalid={!!error.after}
    />

    {error.after && (
      <small style={{ color: "red" }}>{error.after}</small>
    )}
  </CCol>
</CRow>

        <hr />

        {/* Videos */}

    <CRow>
  <CCol md={6}>
    <label>Before Video</label>
    <CFormInput
      type="file"
      accept="video/*" // 🔥 restrict file picker to videos
      onChange={(e) => handleBeforeVideo(e.target.files[0])}
    />
    {errors.beforeVideo && (
      <small style={{ color: "red" }}>{errors.beforeVideo}</small>
    )}
  </CCol>

  <CCol md={6}>
    <label>After Video</label>
    <CFormInput
      type="file"
      accept="video/*"
      onChange={(e) => handleAfterVideo(e.target.files[0])}
    />
    {errors.afterVideo && (
      <small style={{ color: "red" }}>{errors.afterVideo}</small>
    )}
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