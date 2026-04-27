import { cilX } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CButton } from "@coreui/react";
import React, { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";

const PatientRegistration = ({ booking, vitals }) => {
  const data = {
    name: booking?.name || "NA",
    age: booking?.age || "NA",
    gender: booking?.gender || "NA",
    address: booking?.patientAddress || "NA",
    phone: booking?.mobileNumber || "NA",
    email: "NA",
  };

  const signRef = useRef();
  const [signature, setSignature] = useState("");

  const clearSignature = () => {
    signRef.current.clear();
    setSignature("");
  };

  return (
    <div className="form-container">
      <h2 className="reg-title">Patient Registration Form</h2>

      {/* PATIENT INFO */}
      <div className="section-title">Patient Information</div>
      <div className="section">
        <table className="table">
          <tbody>
            <tr>
              <td><strong>Full Name:</strong></td>
              <td>{data.name}</td>
              <td><strong>Age:</strong></td>
              <td>{data.age}</td>
            </tr>
            <tr>
              <td><strong>Address:</strong></td>
              <td>{data.address}</td>
              <td>
                <strong>Gender:</strong>
                <div className="gender">
                  <input type="checkbox" checked={data.gender === "Male"} readOnly /> Male
                  <input type="checkbox" checked={data.gender === "Female"} readOnly /> Female
                  <input type="checkbox" checked={data.gender === "Other"} readOnly /> Other
                </div>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="contact-row">
          <div><strong>Phone Number:</strong> {data.phone}</div>
          <div><strong>Email:</strong> {data.email}</div>
        </div>

        <table className="table">
          <tbody>
            <tr>
              <td><strong>Height:</strong> {vitals?.height || "-"} cm</td>
              <td><strong>Weight:</strong> {vitals?.weight || "-"} kg</td>
              <td><strong>Blood Pressure:</strong> {vitals?.bloodPressure || "-"}</td>
              <td><strong>Temperature:</strong> {vitals?.temperature || "-"} °C</td>
              <td><strong>BMI:</strong> {vitals?.bmi || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* EMERGENCY */}
      <div className="section-title">Emergency Contact</div>
      <div className="section">
        <table className="table">
          <tbody>
            <tr>
              <td><strong>Full Name:</strong></td>
              <td><input type="text" className="hideboder" /></td>
              <td><strong>Relationship:</strong></td>
              <td><input type="text" className="hideboder" /></td>
            </tr>
            <tr>
              <td><strong>Phone Number:</strong></td>
              <td><input type="text" className="hideboder" /></td>
              <td><strong>Address:</strong></td>
              <td><input type="text" className="hideboder" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MEDICAL */}
      <div className="section-title">Medical Information</div>
      <div className="section-with-border">
        <strong>Primary Concern / Reason for Visit:</strong>
        <div className="checkbox-group">
          <label><input type="checkbox" /> Chronic Pain Management</label>
          <label><input type="checkbox" /> Sports Rehabilitation</label>
          <label><input type="checkbox" /> Neuro Rehabilitation</label>
          <label><input type="checkbox" /> Other</label>
        </div>
      </div>

      <div className="two-col-row">
        <div className="label"><strong>Referring Doctor (if any):</strong> {booking?.doctorName || "-"}</div>
        <div className="label"><strong>Current Medications:</strong> {booking?.currentMedications || "-"}</div>
      </div>

      <div className="two-col-row">
        <div className="label"><strong>Allergies:</strong> {booking?.allergies || "-"}</div>
        <div className="label"><strong>Past Medical Surgeries:</strong> {booking?.previousInjuries || "-"}</div>
      </div>

      {/* INSURANCE */}
      <div className="section-with-border">
        <div className="section-title">Insurance Information (if applicable)</div>
        <div className="two-col-row">
          <div className="label"><strong>Insurance Provider:</strong> {booking?.insuranceProvider || "-"}</div>
          <div className="label"><strong>Policy Number:</strong> {booking?.policyNumber || "-"}</div>
        </div>
      </div>

      {/* CONSENT */}
      <div className="consent">
        <h3 className="consent-title">Consent &amp; Acknowledgment</h3>
        <div className="consent-text">
          I consent to receive physiotherapy and rehabilitation services at Kinetix Wellness Care.
          I understand that treatment results may vary and that I am responsible for providing
          accurate medical history.
        </div>

        <div className="sign-row">
          <div className="date-box">
            <strong>Date:</strong> {new Date().toLocaleString()}
          </div>
          <div className="signature-wrapper">
            <div className="sign-head-row">
              <div className="sign-title">Patient Signature</div>
              <div className="action-right no-print">
                <CButton size="sm" onClick={clearSignature}>
                  <CIcon icon={cilX} />
                </CButton>
              </div>
            </div>
            <SignaturePad
              ref={signRef}
              canvasProps={{ width: 220, height: 45, className: "sign-canvas" }}
            />
          </div>
        </div>
      </div>

      <style>{`
        .form-container {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif;
          font-size: 12px;
        }

        .reg-title {
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          margin: 4px 0 8px;
        }

        .section-title {
          font-weight: 700;
          font-size: 13px;
          margin: 5px 0 2px 0;
          padding: 0;
          line-height: 1.1;
        }

        .section {
          padding: 4px 6px !important;
          margin-top: 2px !important;
          margin-bottom: 0;
        }

        .section-with-border {
          border: 1px solid #000;
          padding: 5px 8px !important;
          margin-top: 4px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2px;
        }

        .table td,
        .table th {
          border: 1px solid #000;
          padding: 3px 6px !important;
          font-size: 12px;
          vertical-align: middle;
        }

        .contact-row {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 24px;
          margin-top: 4px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .two-col-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 16px;
          margin-top: 4px !important;
          padding: 2px 0;
        }

        .label {
          font-size: 12px;
        }

        .checkbox-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 24px;
          margin-top: 5px !important;
          margin-bottom: 4px !important;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }

        .gender {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 2px;
        }

        .hideboder {
          border: none !important;
          outline: none;
          width: 100%;
        }

        .consent {
          margin-top: 6px;
        }

        .consent-title {
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          margin: 4px 0 3px;
        }

        .consent-text {
          text-align: center;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .sign-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12px;
          margin-top: 6px;
          width: 100%;
        }

        .date-box {
          flex: 1;
          font-size: 12px;
        }

        .signature-wrapper {
          width: 230px;
          text-align: center;
        }

        .sign-canvas {
          border: 1px solid #000;
          background: #fff;
        }

        .sign-head-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .sign-title {
          font-size: 12px;
          font-weight: 600;
        }

        .action-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 600px) {
          .two-col-row,
          .checkbox-group { grid-template-columns: 1fr; }
          .sign-row { flex-direction: column; align-items: flex-start; }
          .signature-wrapper { width: 100%; }
        }

        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PatientRegistration;