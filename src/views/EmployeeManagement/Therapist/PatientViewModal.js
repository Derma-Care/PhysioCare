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
import { useState } from "react"

export default function PatientViewModal({ visible, data, onClose }) {
  const [showImage, setShowImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const record = data
  if (!record) return null

  const handleImageClick = (img) => {
    setSelectedImage(img)
    setShowImage(true)
  }

  return (
    <>
      <CModal visible={visible} onClose={onClose} size="xl" backdrop="static">
        <CModalHeader>
          <CModalTitle>Patient Details</CModalTitle>
        </CModalHeader>

        <CModalBody>

          {/* 🔑 BASIC META INFO */}
          <CCard className="mb-3">
            <CCardBody>
              <h6>Record Info</h6>
              <p><b>Therapist ID:</b> {record?.therapistRecordId || "N/A"}</p>
              <p><b>Booking ID:</b> {record?.bookingId || "N/A"}</p>
              
              <p><b>Therapy:</b> <CBadge color="info">{record?.therapy || "N/A"}</CBadge></p>
            </CCardBody>
          </CCard>

          {/* 👤 PATIENT INFO */}
          <CCard className="mb-3">
            <CCardBody>
              <h5>{record?.patientInfo?.name || "N/A"}</h5>

              <CRow>
                <CCol md={4}>
                  <p><b>Patient ID:</b> {record?.patientInfo?.patientId || "N/A"}</p>
                </CCol>
                <CCol md={4}>
                  <p><b>Age:</b> {record?.patientInfo?.age || "N/A"}</p>
                </CCol>
                <CCol md={4}>
                  <p><b>Gender:</b> {record?.patientInfo?.sex || "N/A"}</p>
                </CCol>
                <CCol md={4}>
                  <p><b>Mobile:</b> {record?.patientInfo?.mobileNumber || "N/A"}</p>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* 📝 COMPLAINTS */}
          <CCard className="mb-3">
            <CCardBody>
              <h6>Complaint Details</h6>
              <p>{record?.complaints?.complaintDetails || "N/A"}</p>

              <h6 className="mt-3">Therapy Q&A</h6>

              {Object.entries(record?.complaints?.theraphyAnswers || {}).length > 0 ? (
                Object.entries(record.complaints.theraphyAnswers).map(([part, questions]) => (
                  <div key={part}>
                    <h6 style={{ textTransform: "capitalize" }}>{part}</h6>

                    {questions?.map((q, i) => (
                      <div key={i} style={{ background: "#f8f9fa", padding: "10px", marginBottom: "6px" }}>
                        <p><b>Q:</b> {q?.question || "N/A"}</p>
                        <p><b>A:</b> {q?.answer || "N/A"}</p>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p>No Q&A available</p>
              )}
            </CCardBody>
          </CCard>

          {/* 🖼️ IMAGE (UNCHANGED) */}
          <CCard className="mb-3">
            <CCardBody>
              <h6>Pain Assessment Image</h6>

              {record?.complaints?.painAssessmentImage ? (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={`data:image/jpeg;base64,${record?.complaints?.painAssessmentImage}`}
                    style={{ width: "250px", borderRadius: "10px", cursor: "pointer" }}
                    onClick={() => handleImageClick(record?.complaints?.painAssessmentImage)}
                  />
                </div>
              ) : (
                <p>No image available</p>
              )}
            </CCardBody>
          </CCard>
          {/* 🖼️ REPORT IMAGE */}
<CCard className="mb-3">
  <CCardBody>
    <h6>Report Image</h6>

    {record?.reports?.reportImage ? (
      <div style={{ textAlign: "center" }}>
        <img
          src={`data:image/jpeg;base64,${record.reports.reportImage}`}
          style={{
            width: "250px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() => handleImageClick(record.reports.reportImage)}
        />
      </div>
    ) : (
      <p>No report image available</p>
    )}
  </CCardBody>
</CCard>

          {/* 🔍 ASSESSMENT (FULL DATA) */}
<CCard className="mb-3">
  <CCardBody>
    <h6>Assessment</h6>

    <CRow>
      <CCol md={4}>
        <p><b>Chief Complaint:</b> {record?.assessment?.chiefComplaint || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Pain Scale:</b> {record?.assessment?.painScale || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Pain Type:</b> {record?.assessment?.painType || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Duration:</b> {record?.assessment?.duration || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Onset:</b> {record?.assessment?.onset || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Aggravating Factors:</b> {record?.assessment?.aggravatingFactors || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Relieving Factors:</b> {record?.assessment?.relievingFactors || "N/A"}</p>
      </CCol>
    </CRow>

    <hr />

    <p><b>Posture:</b> {record?.assessment?.posture || "N/A"}</p>
    <p><b>Range of Motion:</b> {record?.assessment?.rangeOfMotion || "N/A"}</p>
    <p><b>Special Tests:</b> {record?.assessment?.specialTests || "N/A"}</p>
    <p><b>Observations:</b> {record?.assessment?.observations || "N/A"}</p>

  </CCardBody>
</CCard>

          {/* 🧾 DIAGNOSIS */}
          <CCard className="mb-3">
  <CCardBody>
    <h6>Diagnosis</h6>

    <p><b>Diagnosis:</b> {record?.diagnosis?.physioDiagnosis || "N/A"}</p>

    <p>
      <b>Affected Area:</b>{" "}
      {record?.diagnosis?.affectedArea || "N/A"}
    </p>

    <p><b>Severity:</b> {record?.diagnosis?.severity || "N/A"}</p>

    <p><b>Stage:</b> {record?.diagnosis?.stage || "N/A"}</p>

    <p>
      <b>Notes:</b>{" "}
      {record?.diagnosis?.notes || "No additional notes"}
    </p>
  </CCardBody>
</CCard>

          {/* 💊 TREATMENT */}
       <CCard className="mb-3">
  <CCardBody>
    <h6>Treatment Plan</h6>

    <CRow>
      <CCol md={4}>
        <p><b>Doctor ID:</b> {record?.treatmentPlan?.doctorId || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Doctor Name:</b> {record?.treatmentPlan?.doctorName || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Therapist ID:</b> {record?.treatmentPlan?.therapistId || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Therapist Name:</b> {record?.treatmentPlan?.therapistName || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Session Duration:</b> {record?.treatmentPlan?.sessionDuration || "N/A"} mins</p>
      </CCol>

      <CCol md={4}>
        <p><b>Frequency:</b> {record?.treatmentPlan?.frequency || "N/A"}</p>
      </CCol>

      <CCol md={4}>
        <p><b>Total Sessions:</b> {record?.treatmentPlan?.totalSessions || "N/A"}</p>
      </CCol>
    </CRow>

    <p>
      <b>Modalities:</b>{" "}
      {record?.treatmentPlan?.modalities?.length > 0
        ? record.treatmentPlan.modalities.join(", ")
        : "N/A"}
    </p>

    <p>
      <b>Manual Therapy:</b>{" "}
      {record?.treatmentPlan?.manualTherapy || "N/A"}
    </p>

    <p>
      <b>Precautions:</b>{" "}
      {record?.treatmentPlan?.precautions || "N/A"}
    </p>
  </CCardBody>
</CCard>

          {/* 📅 SESSIONS */}
       {/* 📅 THERAPY SESSIONS (FULL DATA) */}
<CCard className="mb-3">
  <CCardBody>
    <h6>Therapy Sessions</h6>

    {record?.therapySessions?.length > 0 ? (
      record.therapySessions.map((s) => (
        <div
          key={s.sessionId}
          style={{
            background: "#f8f9fa",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "10px",
          }}
        >
          <CRow>
            <CCol md={4}>
              <p><b>Session ID:</b> {s?.sessionId || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Date:</b> {s?.sessionDate || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p>
                <b>Status:</b>{" "}
                <CBadge
                  color={
                    s?.status === "Completed"
                      ? "success"
                      : s?.status === "Pending"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {s?.status || "N/A"}
                </CBadge>
              </p>
            </CCol>

            <CCol md={4}>
              <p>
                <b>Modalities Used:</b>{" "}
                {s?.modalitiesUsed?.length > 0
                  ? s.modalitiesUsed.join(", ")
                  : "N/A"}
              </p>
            </CCol>

            <CCol md={4}>
              <p><b>Exercises Done:</b> {s?.exercisesDone || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Patient Response:</b> {s?.patientResponse || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Duration:</b> {s?.duration || "N/A"}</p>
            </CCol>
          </CRow>
        </div>
      ))
    ) : (
      <p>No sessions available</p>
    )}
  </CCardBody>
</CCard>

          {/* 🏋️ EXERCISES */}
        {/* 🏋️ EXERCISE PLAN (FULL DATA) */}
<CCard>
  <CCardBody>
    <h6>Exercise Plan</h6>

    {record?.exercisePlan?.exercises?.length > 0 ? (
      record.exercisePlan.exercises.map((e, i) => (
        <div
          key={i}
          style={{
            background: "#f8f9fa",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "12px",
          }}
        >
          <CRow>
            <CCol md={4}>
              <p><b>Name:</b> {e?.name || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Sets:</b> {e?.sets || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Reps:</b> {e?.reps || "N/A"}</p>
            </CCol>

            <CCol md={4}>
              <p><b>Duration:</b> {e?.duration || "N/A"} mins</p>
            </CCol>
          </CRow>

          <p><b>Instructions:</b> {e?.instructions || "N/A"}</p>

          {/* 🎥 VIDEO */}
          {e?.videoUrl && (
            <p>
              <b>Video:</b>{" "}
              <a href={e.videoUrl} target="_blank" rel="noreferrer">
                Watch Exercise
              </a>
            </p>
          )}

          {/* 🖼️ THUMBNAIL (BASE64 IMAGE) */}
          {e?.thumbnail && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={e.thumbnail}
                alt="Exercise"
                style={{
                  width: "150px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}
        </div>
      ))
    ) : (
      <p>No exercises available</p>
    )}
  </CCardBody>
</CCard>
 <CCard className="mb-3">
            <CCardBody>
              <h6>Home Advice</h6>
              <p>{record?.homeAdvice || "N/A"}</p>
            </CCardBody>
          </CCard>

          {/* 📅 FOLLOW UP */}
          <CCard className="mb-3">
            <CCardBody>
              <h6>Follow Up</h6>
              <p><b>Date:</b> {record?.followUp?.nextVisitDate || "N/A"}</p>
              <p><b>Review:</b> {record?.followUp?.reviewNotes || "N/A"}</p>
              <p><b>Continue:</b> {record?.followUp?.continueTreatment || "N/A"}</p>
              <p><b>Modifications:</b> {record?.followUp?.modifications || "N/A"}</p>
            </CCardBody>
          </CCard>

          {/* 📌 STATUS */}
         

        </CModalBody>
      </CModal>


{/* 
      
      
      
      
      

      {/* 🔍 IMAGE MODAL (UNCHANGED) */}
      <CModal visible={showImage} onClose={() => setShowImage(false)} size="lg" className="custom-modal">
        <CModalHeader>
          <CModalTitle>Pain Image</CModalTitle>
        </CModalHeader>

        <CModalBody style={{ textAlign: "center" }}>
          {selectedImage && (
            <img
              src={`data:image/jpeg;base64,${selectedImage}`}
              style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}