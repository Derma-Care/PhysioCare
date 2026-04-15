import React from "react";
import { useLocation } from "react-router-dom";

const PatientRegistration = ({booking,vitals}) => {
  {};
console.log("Booking in Patient Registration:", booking); // Debug log
console.log("Vitals in Patient Registration:", vitals); // Debug log
  const data = {
    name: booking?.name || "Prashanth",
    age: booking?.age || "28",
    gender: booking?.gender || "Male",
    address: booking?.patientAddress || "Hyderabad",
    phone: booking?.mobileNumber || "9876543210",
    email: "test@gmail.com",
  };

  return (
    <div className="form-container">

      {/* HEADER */}
      {/* <div className="header">
        <div className="left">
          <p>📞 99948 85456 | 93607 46496</p>
          <p>🌐 kinetixwellnesscare.in</p>
          <p>Kinetix Wellness Care, Saravanampatti - 35</p>
        </div>

        <div className="right">
          <h2>KINETIX</h2>
          <p>PHYSIOTHERAPY | REHAB FITNESS & RECOVERY</p>
        </div>
      </div> */}

      <h2 className="title">Patient Registration Form</h2>

      {/* PATIENT INFO */}
      <div className="section">
        <p className="section-title">Patient Information</p>

        <table className="table">
          <tbody>
            <tr>
              <td>Full Name:</td>
              <td>{data.name}</td>
              <td>Age:</td>
              <td>{data.age}</td>
            </tr>

            <tr>
              <td>Date of Birth:</td>
              <td>________</td>
              <td>
                Gender:
               <span className="gender">
  <input type="checkbox" checked={data.gender==="Male"} readOnly /> Male
  <input type="checkbox" checked={data.gender==="Female"} readOnly /> Female
  <input type="checkbox" /> Other
</span>
              </td>
              <td></td>
            </tr>

            <tr>
              <td>Address:</td>
              <td colSpan="3">{data.address}</td>
            </tr>

            <tr>
              <td>City:</td>
              <td>________</td>
              <td>State:</td>
              <td>________</td>
            </tr>

            <tr>
              <td>ZIP:</td>
              <td>________</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* INLINE FIELDS */}
        <div className="inline">
          <span>Phone Number:</span>
          <span className="line">{data.phone}</span>

          <span>Email:</span>
          <span className="line">{data.email}</span>
        </div>
       
                  
       <table className="table">
  <tbody>
    <tr>
      <td>Height: {vitals?.height || "-"} cm</td>
      <td>Weight: {vitals?.weight || "-"} kg</td>
      <td>Blood Pressure: {vitals?.bloodPressure || "-"}</td>
      <td>Temperature: {vitals?.temperature || "-"} °C</td>
      <td>BMI: {vitals?.bmi || "-"}</td>
   
    </tr>
  </tbody>
</table>
      </div>

      {/* EMERGENCY */}
      <div className="section">
        <p className="section-title">Emergency Contact</p>

        <table className="table">
          <tbody>
            <tr>
              <td>Full Name:</td>
              <td></td>
              <td>Relationship:</td>
              <td></td>
            </tr>

            <tr>
              <td>Phone Number:</td>
              <td></td>
              <td>Address:</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MEDICAL */}
      <div className="section">
        <p className="section-title">Medical Information</p>

        <p>Primary Concern / Reason for Visit:</p>

        <div className="checkbox-group">
          <label><input type="checkbox" /> Chronic Pain Management</label>
          <label><input type="checkbox" /> Sports Rehabilitation</label>
          <label><input type="checkbox" /> Neuro Rehabilitation</label>
          <label><input type="checkbox" /> Other: __________</label>
        </div>

        <p>Referring Doctor (if any): __________________________</p>

        <div className="inline">
          <span>Current Medications:</span>
          <span className="line">{booking.currentMedications}</span>

          <span>Allergies:</span>
          <span className="line">{booking.allergies}</span>
        </div>

        <span>Past Medical Conditions / Surgeries: </span><span className="line">{booking.previousInjuries}</span>
      </div>

      {/* INSURANCE */}
      <div className="section">
        <p className="section-title">Insurance Information (if applicable)</p>

        <div className="inline">
          <span>Insurance Provider:</span>
          <span className="line">{booking.insuranceProvider}</span>

          <span>Policy Number:</span>
          <span className="line">{booking.policyNumber}</span>
        </div>
      </div>

      {/* CONSENT */}
      <div className="consent">
        <h3>Consent & Acknowledgment</h3>

        <p>
          I consent to receive physiotherapy and rehabilitation services at
          Kinetix Wellness Care. I understand that treatment results may vary.
        </p>

        <div className="inline space">
          <span>Date:</span>
          <span className="line small">
  {new Date().toLocaleString()}
</span>

          <span>Signature:</span>
          <span className="line small"></span>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .form-container {
          width: 900px;
          margin: auto;
          font-family: Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .title {
          text-align: center;
          margin: 15px 0;
        }

        .section {
          border: 1px solid black;
          padding: 10px;
          margin-top: 10px;
        }

        .section-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

      .table td {
  padding: 8px 10px;
  vertical-align: middle;
}

        .inline {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
          flex-wrap: wrap;
        }

        .line {
          border-bottom: 1px solid black;
          min-width: 200px;
          display: inline-block;
        }

        .small {
          min-width: 100px;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .consent {
          text-align: center;
          margin-top: 20px;
        }

        .space {
          justify-content: space-between;
        }
          .gender {
  display: flex;
  gap: 10px;
  align-items: center;
}
      `}</style>
    </div>
  );
};

export default PatientRegistration;