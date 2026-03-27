/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */

import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CCol, CRow } from '@coreui/react'

export default function SessionViewModal({ visible, data, onClose }) {
  const [preview, setPreview] = useState(null)

  if (!data) return null

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="lg" backdrop="static" className='custom-modal'>
        <CModalHeader>Session Details</CModalHeader>

        <CModalBody>
          <b>Patient :</b> {data.patientName}
          <br />
          <b>Therapy :</b> {data.therapy}
          <br />
          <b>Date :</b> {data.date}
          <br />
          <b>Time :</b> {data.completedTime}
          <br />
          <hr />
          <b>Doctor Notes</b>
          <div>{data.doctorNotes}</div>
          <hr />
          <b>Therapist Notes</b>
          <div>{data.therapistNotes}</div>
          <hr />
          <CRow>

<CCol md={6}>
<b>Pain Before :</b> {data.painBefore || "-"}
</CCol>

<CCol md={6}>
<b>Pain After :</b> {data.painAfter || "-"}
</CCol>

<CCol md={6}>
<b>Result :</b> {data.result || "-"}
</CCol>

<CCol md={6}>
<b>Duration :</b> {data.duration || "-"} min
</CCol>

<CCol md={12}>
<b>Next Plan :</b>
<div>
{data.nextPlan || "-"}
</div>
</CCol>

<CCol md={6}>
<b>Completed Date :</b> {data.completedDate || "-"}
</CCol>

<CCol md={6}>
<b>Completed Time :</b> {data.completedTime || "-"}
</CCol>

</CRow>
        <hr />

<CRow>

<CCol md={6}>

<b>Before Image</b>

<div className="mt-2">

{data.beforeImage ? (

<img
src={data.beforeImage}
className="img-fluid rounded border"
style={{ cursor: "pointer", maxHeight: 120 }}
onClick={() => setPreview(data.beforeImage)}
/>

) : (

<div className="text-muted">
No Image
</div>

)}

</div>

</CCol>


<CCol md={6}>

<b>After Image</b>

<div className="mt-2">

{data.afterImage ? (

<img
src={data.afterImage}
className="img-fluid rounded border"
style={{ cursor: "pointer", maxHeight: 120 }}
onClick={() => setPreview(data.afterImage)}
/>

) : (

<div className="text-muted">
No Image
</div>

)}

</div>

</CCol>

</CRow>
          <hr />
 

<hr />

<CRow>

<CCol md={6}>

<b>Before Video</b>

<div className="mt-2">

{data.beforeVideo ? (

<video
src={data.beforeVideo}
className="img-fluid border rounded"
style={{ maxHeight: 150, cursor: "pointer" }}
controls
onClick={() => setPreview(data.beforeVideo)}
/>

) : (

<div className="text-muted">
No Video
</div>

)}

</div>

</CCol>


<CCol md={6}>

<b>After Video</b>

<div className="mt-2">

{data.afterVideo ? (

<video
src={data.afterVideo}
className="img-fluid border rounded"
style={{ maxHeight: 150, cursor: "pointer" }}
controls
onClick={() => setPreview(data.afterVideo)}
/>

) : (

<div className="text-muted">
No Video
</div>

)}

</div>

</CCol>

</CRow>
        </CModalBody>
      </CModal>

      {/* Full screen preview */}

     {preview && (
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
)}
    </>
  )
}
