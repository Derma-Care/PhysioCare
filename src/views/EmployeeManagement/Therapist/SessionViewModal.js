/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CCol, CRow } from '@coreui/react'

export default function SessionViewModal({ visible, data, onClose }) {
  const [preview, setPreview] = useState(null)

  if (!data) return null

  const base64ToBlob = (base64, mime) => {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mime })
}
const getVideoUrl = (base64) => {
  if (!base64) return null
  const blob = base64ToBlob(base64, "video/mp4")
  return URL.createObjectURL(blob)
}
  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className='custom-modal'>
        <CModalHeader>Session Details</CModalHeader>

       <CModalBody>

  {/* 🔷 HEADER */}
  <h5 className="section-title">Session Information</h5>

  <CRow className="mb-3">
    {[
      { label: "Patient", value: data.patientName },
      { label: "Therapy", value: data.therapy },
      { label: "Date", value: data.date },
      { label: "Time", value: data.completedTime },
      { label: "Patient ID", value: data.patientId },
      { label: "Booking ID", value: data.bookingId },
      { label: "Therapist ID", value: data.therapistId },
      { label: "Session ID", value: data.sessionId },
    ].map((item, i) => (
      <CCol md={6} key={i}>
        <div className="info-box">
          <span className="label">{item.label}</span>
          <span className="value">{item.value || "-"}</span>
        </div>
      </CCol>
    ))}
  </CRow>

  {/* 🔷 NOTES */}
  <h6 className="section-title">Notes</h6>

  {/* <div className="note-box">
    <b>Doctor Notes</b>
    <p>{data.doctorNotes || "-"}</p>
  </div> */}

  <div className="note-box">
    <b>Therapist Notes</b>
    <p>{data.therapistNotes || "-"}</p>
  </div>

  {/* 🔷 SESSION DETAILS */}
  <h6 className="section-title">Session Details</h6>

  <CRow>
    <CCol md={6}><b>Pain Before:</b> {data.painBefore || "-"}</CCol>
    <CCol md={6}><b>Pain After:</b> {data.painAfter || "-"}</CCol>
    <CCol md={6}><b>Result:</b> {data.result || "-"}</CCol>
    <CCol md={6}><b>Duration:</b> {data.duration || "-"}  </CCol>
    <CCol md={12}>
      <b>Next Plan:</b>
      <div>{data.nextPlan || "-"}</div>
    </CCol>
  </CRow>

  {/* 🔷 MEDIA */}
  <h6 className="section-title">Media</h6>

  <CRow>

    {/* Images */}
    <CCol md={6}>
      <b>Before Image</b>
      <div  >
        {data.beforeImage ? (
         <img
  src={`data:image/jpeg;base64,${data.beforeImage}`}
  className="img-fluid rounded border"
  style={{ cursor: "pointer", maxHeight: 120 }}
  onClick={() => setPreview(`data:image/jpeg;base64,${data.beforeImage}`)}
/>
        ) : <span>No Image</span>}
      </div>
    </CCol>

    <CCol md={6}>
      <b>After Image</b>
      <div  >
        {data.afterImage ? (
          <img
  src={`data:image/jpeg;base64,${data.afterImage}`}
  className="img-fluid rounded border"
  style={{ cursor: "pointer", maxHeight: 120 }}
  onClick={() => setPreview(`data:image/jpeg;base64,${data.afterImage}`)}
/>
        ) : <span>No Image</span>}
      </div>
    </CCol>

    {/* Videos */}
    <CCol md={6} className="mt-3">
      <b>Before Video</b>
      <div className="media-box">
        {data.beforeVideo ? (
        <video
  src={getVideoUrl(data.beforeVideo)}
  controls
  style={{ maxHeight: 150 }}
/>
        ) : <span>No Video</span>}
      </div>
    </CCol>

    <CCol md={6} className="mt-3">
      <b>After Video</b>
      <div className="media-box">
        {data.afterVideo ? (
          <video
  src={`data:video/mp4;base64,${data.afterVideo}`}
  controls
  onClick={() => setPreview(`data:video/mp4;base64,${data.afterVideo}`)}
/>
        ) : <span>No Video</span>}
      </div>
    </CCol>

  </CRow>

</CModalBody>
      </CModal>

      {/* Full screen preview */}

     {/* {preview && (
  <CModal visible size="xl" onClose={() => setPreview(null)}>
    <CModalBody style={{ textAlign: "center" }}>
      {preview.endsWith(".mp4") ||
      preview.startsWith("blob:")
        ? (
          <video
            src={preview}
            controls
            style={{ width: "100%" }}
          />
        )
        : (
          <img
            src={preview}
            style={{ width: "100%" }}
          />
        )}
    </CModalBody>
  </CModal>
)} */}
{preview && (
  <CModal visible size="xl" onClose={() => setPreview(null)}>
    <CModalBody style={{ textAlign: "center" }}>
      {preview.startsWith("data:video") ? (
        <video src={preview} controls style={{ width: "100%" }} />
      ) : (
        <img src={preview} style={{ width: "100%" }} />
      )}
    </CModalBody>
  </CModal>
)}

<style>
  {
    `
    .info-box {
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #6c757d;
}

.value {
  font-weight: 600;
  font-size: 14px;
  color: #212529;
}
    `
  }
</style>
    </>
  )
}
