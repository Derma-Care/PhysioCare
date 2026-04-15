import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import PatientRegistration from "./PatientInfoConsent";
import PrintLetterHead from "../../Utils/PrintLetterHead";
import { CButton } from "@coreui/react";
import { cilCheck, cilTrash, cilX } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { right } from "@popperjs/core";
import UploadButton from "../ConsentForms/UploadButton";
import { bookingUpdate } from "./appointmentAPI";
import { showCustomToast } from "../../Utils/Toaster";

const ConsentForm = () => {
  const location = useLocation();
const booking = location.state?.bookingDetails || {};
const vitals = location.state?.vitals || {};
const doctorSign = location.state?.doctorsign || "";
const [pdfPreview, setPdfPreview] = useState("");
const [loadingSubmit, setLoadingSubmit] = useState(false);
console.log("Booking Details in Consent Form:", booking); // Debug log
  const formRef = useRef();
  const patientSignRef = useRef();

  const [patientSign, setPatientSign] = useState("");

  const data = {
    name: booking?.name || "",
    age: booking?.age || "",
    gender: booking?.gender || "",
    contact: booking?.mobileNumber || "",
    doctor: booking?.doctorName || "",
    uhid: booking?.patientId || "",
  };
const [consentForm, setConsentForm] = useState({
  relationType: "Patient", // Patient / Relative
  relationName: ""
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setConsentForm((prev) => ({
    ...prev,
    [name]: value
  }));
};
  // Save signature
const savePatientSign = () => {
  if (patientSignRef.current.isEmpty()) return;

  const img = patientSignRef.current
    .getTrimmedCanvas()
    .toDataURL("image/png");

  setPatientSign(img);
};
 
const upload = async () => {
  try {
    setLoadingSubmit(true);

    const hiddenEls = document.querySelectorAll(".no-print");
    hiddenEls.forEach(el => (el.style.display = "none"));

    const pdf = new jsPDF("p", "mm", "a4");
    const pages = document.querySelectorAll(".a4-page");

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 4,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      if (i > 0) pdf.addPage();

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }

    hiddenEls.forEach(el => (el.style.display = ""));

    // REAL PDF BASE64
    const pdfBase64 = pdf.output("datauristring").split(",")[1];

    const payload = {
      bookingId: booking?.bookingId,
      consentFormPdf: pdfBase64,
    };

    const res = await bookingUpdate(payload);

    if (res) {
      showCustomToast(
        res.message || "Consent form uploaded successfully",
        "success"
      );
    }

    // Preview as PDF
    setPdfPreview(pdfBase64);

  } catch (error) {
    console.error(error);
    alert("Upload Failed ❌");
  } finally {
    setLoadingSubmit(false);
  }
};

  // PDF
const downloadPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pages = document.querySelectorAll(".a4-page");

  const hiddenEls = document.querySelectorAll(".no-print");
  hiddenEls.forEach(el => el.style.display = "none");

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    if (i > 0) pdf.addPage();

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      0,
      210,
      297,
      undefined,
      "FAST"
    );
  }

  hiddenEls.forEach(el => el.style.display = "");

  pdf.save(`${booking?.name}_Consent.pdf`);
};

const consentFile = pdfPreview || booking?.consentFormPdf || "";
 
const hasConsentFile = !!String(consentFile).trim();

  // Upload
  // const upload = async () => {
  //   const canvas = await html2canvas(formRef.current);
  //   const base64 = canvas.toDataURL("image/png").split(",")[1];

  //   await axios.post("/update-booking-consent", {
  //     bookingId: booking?.bookingId,
  //     consentPdf: base64,
  //   });

  //   alert("Updated Successfully ✅");
  // };

 

const base64ToBlob = (base64, mimeType) => {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }

  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};
const fileValue = consentFile || "";
const isPdf =
  fileValue.startsWith("JVBER") ||
  fileValue.startsWith("data:application/pdf") ||
  fileValue.includes("application/pdf");
const handleDownloadPreview = () => {
  const link = document.createElement("a");
  link.href = `data:application/pdf;base64,${consentFile}`;
  link.download = `${booking?.name}_Consent.pdf`;
  link.click();
};

const handlePrintPreview = () => {
  const mime = isPdf ? "application/pdf" : "image/png";
  const blob = base64ToBlob(consentFile, mime);
  const url = URL.createObjectURL(blob);

  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
};




const imageSrc = fileValue.startsWith("data:")
  ? fileValue
  : `data:image/png;base64,${fileValue}`;

const pdfSrc = fileValue.startsWith("data:")
  ? fileValue
  : `data:application/pdf;base64,${fileValue}`;

  const pdfBlob = base64ToBlob(consentFile, "application/pdf");
const pdfUrl = URL.createObjectURL(pdfBlob);

  return (
    <>
    {hasConsentFile ? (
   <div className="preview-box">
    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 className="m-0">Saved Consent File</h5>

      <div className="no-print">
       {/* <CButton className="mx-1" onClick={handlePrintPreview}>
  Print
</CButton>

<CButton className="mx-1" onClick={handleDownloadPreview}>
  Download PDF
</CButton> */}
      </div>
    </div>

   {isPdf ? (
  <iframe
    title="Consent PDF"
    style={{ width: "100%", height: "80vh", border: "1px solid #000" }}
    src={pdfUrl}
  />
) : (
  <img
    src={pdfUrl}
    alt="Consent Preview"
    className="pdf-preview-img"
  />
)}
  </div>
    ) : (
    <>
      <div ref={formRef} >
     {/* PAGE 1 */}
  <div className="a4-page" >
    <PrintLetterHead>
    <PatientRegistration booking={booking} vitals={vitals}/>
    </PrintLetterHead>
  </div>
<hr />
        {/* HEADER */}
       
 
        {/* MAIN BOX */}
        <div className="main-box a4-page">
          <PrintLetterHead>
           <div  >
          <h3 className="title-box">
            CONSENT FOR PHYSIOTHERAPY <br />
            <div className="tamil">
              பிசியோதெரபி சிகிச்சைக்கான ஒப்புதல் படிவம்
            </div>
          </h3>
        </div>

          <table className="table">
            <tbody>
              <tr>
                <td>Hospital / Clinic (மருத்துவமனை)</td>
                <td colSpan="3">{booking.clinicName}, {booking.branchname}</td>
              </tr>

              <tr>
                <td>Name (பெயர்)</td>
                <td>{data.name}</td>
                <td>Age</td>
                <td>{data.age}</td>
              </tr>

              <tr>
                <td>Sex: M / F</td>
                <td>{data.gender}</td>
                <td>Contact No</td>
                <td>{data.contact}</td>
              </tr>

              <tr>
                <td>Physiotherapist</td>
                <td>{data.doctor}</td>
                <td>UHID No</td>
                <td>{data.uhid}</td>
              </tr>
            </tbody>
          </table>

          {/* CONSENT TEXT */}
          <div className="text mb-2">
      I hereby consent to render physiotherapy assessment and management by the treating 
physiotherapist. I am aware of the treatment plan and risks and I understand to expose the 
treating body part and touch the area in need of treatment. Also I am ready to provide all 
informations to treatment and I am having right to decline treatment at any time. 
          </div>

          <div className="tamil mb-3">
    சிகிச்சை அளிக்கும் பிசியோதெரபிஸ்ட் மூலம் பிசியோதெரபி மதிப்பீடும் சிகிச்சை மேலாண்மையும் பெற நான் இத்துடன் ஒப்புதல் அளிக்கிறேன். சிகிச்சை திட்டம் மற்றும் அதனுடன் தொடர்புடைய அபாயங்கள் குறித்து எனக்கு விளக்கமாக தெரிவிக்கப்பட்டுள்ளது. சிகிச்சைக்காக தேவையான உடல் பகுதியை வெளிப்படுத்தவும், அந்த பகுதியில் தொடுதல் அவசியம் என்பதை நான் புரிந்துகொள்கிறேன். மேலும், சிகிச்சைக்குத் தேவையான அனைத்து தகவல்களையும் வழங்க நான் தயாராக இருக்கிறேன். எந்த நேரத்திலும் சிகிச்சையை நிராகரிக்கும் உரிமை எனக்குள்ளது.
          </div>

          {/* SAFETY QUESTIONS */}
          <table className="table mt-2">
            <thead>
              <tr>
                <th>SAFETY SCREENING QUESTIONS</th>
                <th>Yes</th>
                <th>No</th>
                <th className="tamil">பாதுகாப்பு கேள்விகள்</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  Cardiac issues / Medical Conditions
                </td>
                <td><input type="radio" name="q1" /></td>
                <td><input type="radio" name="q1" /></td>
                <td className="tamil">இதய பிரச்சினைகள்</td>
              </tr>

              <tr>
                <td>Pregnancy ? Details</td>
                <td><input type="radio" name="q2" /></td>
                <td><input type="radio" name="q2" /></td>
                <td className="tamil">கர்ப்பம்</td>
              </tr>

              <tr>
                <td>Any Red Flag Conditions ?</td>
                <td><input type="radio" name="q3" /></td>
                <td><input type="radio" name="q3" /></td>
                <td className="tamil">எச்சரிக்கை நிலை</td>
              </tr>

              <tr>
                <td>Previous Surgery Details</td>
                <td><input type="radio" name="q4" /></td>
                <td><input type="radio" name="q4" /></td>
                <td className="tamil">முந்தைய அறுவை சிகிச்சை</td>
              </tr>
            </tbody>
          </table>

          {/* TREATMENT */}
          <div className="mt-2">
            Treatment Plan (சிகிச்சை திட்டம்):
          </div>

          <div>
            I have read the form and agree to physiotherapy evaluation and
            treatment.
          </div>

          <div className="tamil">
            நான் இந்த படிவத்தை வாசித்து சிகிச்சைக்கு ஒப்புக்கொள்கிறேன்.
          </div>

          {/* SIGNATURE */}
        <div className="sign-section">

  {/* Patient / Relative */}
  <div className="sign-card">
   

    <div className="radio-group">
      <label className="me-3">
        <input
          type="radio"
          name="relationType"
          value="Patient"
          checked={consentForm.relationType === "Patient"}
          onChange={handleChange}
        />
        Patient
      </label>

      <label>
        <input
          type="radio"
          name="relationType"
          value="Relative"
          checked={consentForm.relationType === "Relative"}
          onChange={handleChange}
        />
        Relative
      </label>
    </div>

    <input
      type="text"
      name="relationName"
      placeholder="Enter Name"
      value={consentForm.relationName}
      onChange={handleChange}
      className="form-control mt-2"
    />
  </div>

  {/* Patient Signature */}
<div className="sign-card text-center">

  {/* Top Row */}
  <div className="sign-head-row">
    <div className="sign-title">Signature</div>

    <div className="action-right no-print">
   <CButton
  size="sm"
  onClick={savePatientSign}
>
  <CIcon icon={cilCheck} />
</CButton>

      <CButton
        size="sm"
         
        
        onClick={() => patientSignRef.current.clear()}
      >
        <CIcon icon={cilX} />
      </CButton>
    </div>
  </div>

  {/* Signature Box */}
  <SignaturePad
    ref={patientSignRef}
    canvasProps={{
      width: 250,
      height: 60,
      className: "sign-box"
    }}
  />

  {/* Bottom Date */}
  <div className="sign-date">
    <strong>Date:</strong> {new Date().toLocaleString()}
  </div>

</div>

  {/* Doctor Signature */}
  <div className="sign-card">
    <div className="sign-title text-center">Physiotherapist Signature</div>

    <div className="doctor-box">
      <img
        src={doctorSign}
        alt="Doctor Signature"
        className="doctor-sign-img"
      />
    </div>
  </div>

</div>

       </PrintLetterHead>  
        </div>
      
      </div>

      {/* BUTTONS */}
      <div className="actions">
        <CButton style={{backgroundColor:"var(--color-bgcolor)",color:"var(--color-black)"}} className="mx-2" onClick={() => window.print()}>Print</CButton>
        <CButton style={{backgroundColor:"var(--color-bgcolor)",color:"var(--color-black)"}} className="mx-2" onClick={downloadPDF}>Download PDF</CButton>
       <CButton
  style={{backgroundColor:"var(--color-bgcolor)",color:"var(--color-black)"}}
  onClick={upload}
  disabled={!patientSign}
>
  Submit
</CButton>
  {/* <input
    type="file"
    accept=".pdf,.png,.jpg,.jpeg"
    onChange={handleFileUpload}
  /> */}
     <UploadButton bookingId={booking?.bookingId} />
      </div>
 

      {/* CSS */}
    
    </>
       )}
         <style>{
      `body{
  font-size:14px;
}
        .container {
          width: 800px;
          margin: auto;
       
        }

        .title-box {
          border: 2px solid black;
          border-radius: 25px;
          padding: 10px;
          text-align: center;
        }

        .main-box {
          border: 2px solid black;
          padding: 15px;
          margin-top: 10px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table td, .table th {
          border: 1px solid black;
          padding: 8px;
        }

        .text {
          margin-top: 10px;
          text-align: justify;
        }

        .tamil {
          font-family: "Noto Sans Tamil";
        }

        .sign-section {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }

        .sign-box {
          border: 1px solid black;
        }

        .sign-img {
          width: 120px;
          margin-top: 5px;
        }

        .actions {
          text-align: center;
          margin: 20px;
        }
.no-print{
  display:inline-block;
}
        @media print {
          .actions {
            display: none;
          } .no-print{
    display:none !important;
  }
        }.a4-page{
  width:210mm;
  height:297mm;
  padding:8mm;
  margin:0;
  background:#fff;
  box-sizing:border-box;
  overflow:hidden;
  page-break-after:always;
}

/* REMOVE OLD WIDTHS */
.form-container {
  width: 100% !important;
}

/* PERFECT TABLE ALIGNMENT */
.table td, .table th {
  border: 1px solid #000;
  padding: 6px 8px;
  font-size: 13px;
}

/* HEADER FIX */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* INLINE LINES FIX */
.line {
  border-bottom: 1px solid black;
  display: inline-block;
  width: 250px;
}

/* SECTION SPACING */
.section {
  margin-top: 12px;
    padding:10px;
}

/* PRINT FIX */
@media print {
  body {
    margin: 0;
  }

  .actions {
    display: none;
  }

 
}.sign-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.action-right{
  display:flex;
  align-items:center;
}

.sign-box{
  border:1px solid #000;
  background:#fff;
  width:100%;
  max-width:250px;
}

.sign-date{
  margin-top:6px;
  font-size:12px;
  text-align:center;
}
  .sign-head-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:6px;
}


.doctor-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.doctor-sign-img {
  max-width: 60%;
 
  object-fit: cover;
}..preview-box{
  margin:20px auto;
  padding:15px;
  border:1px solid #ccc;
  background:#fff;
  max-width:1000px;
  width:95%;
  box-sizing:border-box;
}

.pdf-preview-img{
  width:100%;
  border:1px solid #000;
}
      `}</style>
     </>
  );
};

export default ConsentForm;