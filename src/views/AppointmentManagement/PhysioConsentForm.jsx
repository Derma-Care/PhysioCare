import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import PatientRegistration from "./PatientInfoConsent";

const ConsentForm = () => {
  const location = useLocation();
  const booking = location.state?.bookingDetails || {};

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

  // Save signature
  const savePatientSign = () => {
    const img = patientSignRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    setPatientSign(img);
  };

  // PDF
  const downloadPDF = async () => {
    const canvas = await html2canvas(formRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(img, "PNG", 0, 0, 210, 295);
    pdf.save("Consent.pdf");
  };

  // Upload
  const upload = async () => {
    const canvas = await html2canvas(formRef.current);
    const base64 = canvas.toDataURL("image/png").split(",")[1];

    await axios.post("/update-booking-consent", {
      bookingId: booking?.bookingId,
      consentPdf: base64,
    });

    alert("Updated Successfully ✅");
  };

  return (
    <>
      <div ref={formRef} >
     {/* PAGE 1 */}
  <div className="a4-page" >
    <PatientRegistration booking={booking} />
  </div>
<hr />
        {/* HEADER */}
        <div className="mt-3" >
          <h3 className="title-box">
            CONSENT FOR PHYSIOTHERAPY <br />
            <span className="tamil">
              பிசியோதெரபி சிகிச்சைக்கான ஒப்புதல் படிவம்
            </span>
          </h3>
        </div>

        {/* MAIN BOX */}
        <div className="main-box a4-page">

          <table className="table">
            <tbody>
              <tr>
                <td>Hospital / Clinic</td>
                <td colSpan="3">(மருத்துவமனை)</td>
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
          <p className="text">
            I hereby consent to render physiotherapy assessment and management
            by the treating physiotherapist. I understand the risks involved.
          </p>

          <p className="tamil">
            நான் பிசியோதெரபி சிகிச்சைக்கு ஒப்புக்கொள்கிறேன் மற்றும்
            சிகிச்சை பற்றிய அபாயங்களை புரிந்துகொள்கிறேன்.
          </p>

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
          <p className="mt-2">
            Treatment Plan (சிகிச்சை திட்டம்):
          </p>

          <p>
            I have read the form and agree to physiotherapy evaluation and
            treatment.
          </p>

          <p className="tamil">
            நான் இந்த படிவத்தை வாசித்து சிகிச்சைக்கு ஒப்புக்கொள்கிறேன்.
          </p>

          {/* SIGNATURE */}
          <div className="sign-section">

            <div>
              <p>Patient Signature</p>
              <SignaturePad
                ref={patientSignRef}
                canvasProps={{ width: 250, height: 80, className: "sign-box" }}
              />
              <button onClick={savePatientSign}>Save</button>
              {patientSign && <img src={patientSign} className="sign-img" />}
            </div>

            <div>
              <p>Physiotherapist</p>
              <div className="sign-box"></div>
            </div>

          </div>

        </div>
      </div>

      {/* BUTTONS */}
      <div className="actions">
        <button onClick={() => window.print()}>Print</button>
        <button onClick={downloadPDF}>Download PDF</button>
        <button onClick={upload}>Submit</button>
      </div>

      {/* CSS */}
      <style>{
      `
        .container {
          width: 800px;
          margin: auto;
          font-family: Arial;
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

        @media print {
          .actions {
            display: none;
          }
        }.a4-page {
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  margin: auto;
  background: white;
  box-sizing: border-box;
  page-break-after: always;
  border: 1px solid #000;
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
}

/* PRINT FIX */
@media print {
  body {
    margin: 0;
  }

  .actions {
    display: none;
  }

  .a4-page {
    border: none;
    margin: 0;
    page-break-after: always;
  }
}
      `}</style>
    </>
  );
};

export default ConsentForm;