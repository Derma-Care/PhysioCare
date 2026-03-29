import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CBadge,
} from "@coreui/react"
import { convertToBase64 } from "../../../Utils/Base64Convert"
import { useState } from "react"

export default function PatientViewModal({ visible, data, onClose }) {
  if (!data) return null
const [showImage, setShowImage] = useState(false)
const [selectedImage, setSelectedImage] = useState(null)
const handleImageClick = (img) => {
  setSelectedImage(img)
  setShowImage(true)
}
  return (
    <CModal visible={visible} onClose={onClose} size="xl" backdrop="static" className="custom-modal">
      <CModalHeader>
        <CModalTitle>Patient Details</CModalTitle>
      </CModalHeader>

      <CModalBody>
        {/* 👤 PATIENT INFO */}
        <CCard className="mb-3">
          <CCardBody>
            <h5>{data?.patientInfo?.name}</h5>

            <CRow>
              <CCol md={4}>
                <p><b>Age:</b> {data?.patientInfo?.age}</p>
              </CCol>
              <CCol md={4}>
                <p><b>Gender:</b> {data?.patientInfo?.sex}</p>
              </CCol>
              <CCol md={4}>
                <p><b>Mobile:</b> {data?.patientInfo?.mobileNumber}</p>
              </CCol>
            </CRow>

            <CBadge color="info">{data?.therapy}</CBadge>
          </CCardBody>
        </CCard>

        {/* 📝 COMPLAINTS */}
    {/* ❓ THERAPY QUESTIONS & ANSWERS */}
<CCard className="mb-3">
  <CCardBody>
 <h6>Patient complaints</h6>
   <div>{data?.complaints?.complaintDetails}</div> 
    <h6 className="mt-3">Therapy Questions & Answers</h6>

    {Object.entries(data?.complaints?.theraphyAnswers || {}).map(
      ([part, questions]) => (
        <div key={part} style={{ marginBottom: "15px" }}>
          <h6 style={{ textTransform: "capitalize", color: "#555" }}>
            {part}
          </h6>

          {questions.map((q, index) => (
            <div
              key={index}
              style={{
                background: "#f8f9fa",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              <p style={{ margin: 0 }}>
                <b>Q:</b> {q.question || "Question not available"}
              </p>

              <p style={{ margin: 0 }}>
                <b>A:</b>{" "}
                <span style={{ color: "#0d6efd" }}>
                  {q.answer}
                </span>
              </p>
            </div>
          ))}
        </div>
      )
    )}
  </CCardBody>
</CCard>
<CCard className="mb-3">
  <CCardBody>
    <h6>Pain Assessment</h6>

    {data?.complaints?.painAssessmentImage ? (
  <div style={{ textAlign: "center" }}>
   <img
  src={`data:image/jpeg;base64,${data?.complaints?.painAssessmentImage}`}
  style={{
    width: "250px",
    borderRadius: "10px",
    cursor: "pointer",
  }}
  onClick={() =>
    handleImageClick(data?.complaints?.painAssessmentImage)
  }
/>
    <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
      Click to enlarge
    </p>
  </div>
) : (
  <p>No pain image available</p>
)}

<CModal visible={showImage} onClose={() => setShowImage(false)} size="lg">
  <CModalHeader>
    <CModalTitle>Pain Assessment Image</CModalTitle>
  </CModalHeader>

  <CModalBody style={{ textAlign: "center" }}>
    {selectedImage && (
      <img
        src={`data:image/jpeg;base64,${selectedImage}`}
        style={{
          width: "100%",
          maxHeight: "80vh",
          objectFit: "contain",
          borderRadius: "10px",
        }}
      />
    )}
  </CModalBody>
</CModal>
  </CCardBody>
</CCard>

        {/* 🔍 ASSESSMENT */}
        <CCard className="mb-3">
          <CCardBody>
            <h6>Assessment</h6>

            <CRow>
              <CCol md={4}>
                <p><b>Complaint:</b> {data?.assessment?.chiefComplaint}</p>
              </CCol>
              <CCol md={4}>
                <p><b>Pain:</b> {data?.assessment?.painScale}</p>
              </CCol>
              <CCol md={4}>
                <p><b>Type:</b> {data?.assessment?.painType}</p>
              </CCol>
            </CRow>

            <p><b>Observation:</b> {data?.assessment?.observations}</p>
          </CCardBody>
        </CCard>

        {/* 🧾 DIAGNOSIS */}
        <CCard className="mb-3">
          <CCardBody>
            <h6>Diagnosis</h6>

            <p><b>Condition:</b> {data?.diagnosis?.physioDiagnosis}</p>
            <p><b>Severity:</b> {data?.diagnosis?.severity}</p>
            <p><b>Stage:</b> {data?.diagnosis?.stage}</p>
          </CCardBody>
        </CCard>

        {/* 💊 TREATMENT */}
        <CCard className="mb-3">
          <CCardBody>
            <h6>Treatment Plan</h6>

            <p><b>Doctor:</b> {data?.treatmentPlan?.doctorName}</p>
            <p><b>Duration:</b> {data?.treatmentPlan?.sessionDuration}</p>

            <p>
              <b>Modalities:</b>{" "}
              {data?.treatmentPlan?.modalities?.join(", ")}
            </p>
          </CCardBody>
        </CCard>

        {/* 📅 SESSIONS */}
        <CCard className="mb-3">
          <CCardBody>
            <h6>Sessions</h6>

            {data?.therapySessions?.map((s) => (
              <div key={s.sessionId} style={{ marginBottom: "10px" }}>
                <b>{s.sessionDate}</b> - {s.duration}{" "}
                <CBadge
                  color={
                    s.status === "Completed"
                      ? "success"
                      : s.status === "Pending"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {s.status}
                </CBadge>
              </div>
            ))}
          </CCardBody>
        </CCard>

        {/* 🏋️ EXERCISES */}
        <CCard>
          <CCardBody>
            <h6>Exercise Plan</h6>

            {data?.exercisePlan?.exercises?.map((e, i) => (
              <p key={i}>
                <b>{e.name}</b> ({e.sets} x {e.reps})
              </p>
            ))}
          </CCardBody>
        </CCard>
      </CModalBody>
    </CModal>
  )
}