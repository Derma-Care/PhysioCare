import { cilCheck, cilX } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CButton } from "@coreui/react";
import React,{useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
const PatientRegistration = ({booking,vitals}) => {
  {};
console.log("Booking in Patient Registration:", booking); // Debug log
console.log("Vitals in Patient Registration:", vitals); // Debug log
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
const saveSignature = () => {
  if (signRef.current.isEmpty()) return;

  const sign = signRef.current
    .getTrimmedCanvas()
    .toDataURL("image/png");

  setSignature(sign);
};

const clearSignature = () => {
  signRef.current.clear();
  setSignature("");
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
        <div className="section-title" style={{color:"#000"}}>Patient Information</div>
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
              <td  >{data.address}</td>
              <td>
               <strong>Gender:</strong>
               <div className="gender">
  <input type="checkbox" checked={data.gender==="Male"} readOnly   /> Male
  <input type="checkbox" checked={data.gender==="Female"} readOnly  /> Female
  <input type="checkbox" checked={data.gender==="Other"} readOnly   /> Other
</div>
              </td>
              <td></td>
         
              
             
            </tr>

            {/* <tr>
              <td>City:</td>
              <td>________</td>
              <td>State:</td>
              <td>________</td>
            </tr> */}

            {/* <tr>
              <td>ZIP:</td>
              <td>________</td>
              <td></td>
              <td></td>
            </tr> */}
          </tbody>
        </table>

        {/* INLINE FIELDS */}
       <div className="contact-row mb-2">
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
        <div className="section-title" style={{color:"#000"}}>Emergency Contact</div>
      <div className="section">

        <table className="table">
          <tbody>
            <tr>
              <td><strong>Full Name:</strong></td>
              <td><input type="text" className="hideboder"/></td>
              <td><strong>Relationship:</strong></td>
              <td><input type="text" className="hideboder"/></td>
            </tr>

            <tr>
              <td><strong>Phone Number:</strong></td>
              <td><input type="text" className="hideboder"/></td>
              <td><strong>Address:</strong></td>
              <td><input type="text" className="hideboder"/></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MEDICAL */}
  <div className="section-title" style={{color:"#000"}}>Medical Information</div>
     <div className="section-with-border">

  <strong>Primary Concern / Reason for Visit:</strong>

  <div className="checkbox-group">
    <label><input type="checkbox" /> Chronic Pain Management</label>
    <label><input type="checkbox" /> Sports Rehabilitation</label>
    <label><input type="checkbox" /> Neuro Rehabilitation</label>
    <label><input type="checkbox" /> Other </label>
  </div>



  {/* Past History */}

</div>
  {/* Referring Doctor */}
    <div className="two-col-row">
  <div  >
    <div className="label"><strong>Referring Doctor (if any):</strong> { booking?.doctorName || "-"}</div>
    
  </div>
  <div>
      <div className="label"><strong>Current Medications:</strong> {booking?.currentMedications || "-"}</div>
      
    </div>
</div>
  {/* Medicines + Allergy */}
  <div className="two-col-row">
    

    <div>
      <div className="label"><strong>Allergies:</strong> {booking?.allergies || "-"}</div>
       
    </div>
      <div className=" ">
    <div className="label"><strong>Past Medical Surgeries:</strong> {booking?.previousInjuries || "-"}</div>
   
  </div>
  </div>
      {/* INSURANCE */}
<div className="section-with-border">
  <div className="section-title" style={{color:"#000"}}>Insurance Information (if applicable)</div>

  <div className="two-col-row">
    <div>
      <div className="label"><strong>Insurance Provider:</strong> {booking?.insuranceProvider || "-"}</div>
  
    </div>

    <div>
      <div className="label"><strong>Policy Number:</strong> {booking?.policyNumber || "-"}</div>
  
    </div>
  </div>
</div>

      {/* CONSENT */}
      <div className="consent mt-3">
        <h3 className="text-center">Consent & Acknowledgment</h3>

        <div className="text-center mb-4">
          I consent to receive physiotherapy and rehabilitation services at Kinetix Wellness Care. 
I understand that treatment results may vary and that I am responsible for providing accurate medical history
        </div>
<div className="  d-flex jsutify-content-between align-items-center align-content-center">
  {/* Left Side */}
  <div className="date-box">
    <strong>Date:</strong> {new Date().toLocaleString()}
  </div>

  {/* Right Side */}
  <div className=" d-flex jsutify-content-between align-items-center align-content-center"  >
   
   

   
    <div className="sign-card text-center">

  {/* Name Side */}
  <div className="sign-head-row">
 
     <div className="sign-title">Patient Signature</div>
  

  {/* Icons Column */}
  <div className="action-right no-print">
    {/* <CButton size="sm"   onClick={saveSignature}>
      <CIcon icon={cilCheck} />
    </CButton> */}

    <CButton size="sm"  onClick={clearSignature}>
      <CIcon icon={cilX} />
    </CButton>
  </div>
  </div>
  {/* Signature Box */}
 
    <SignaturePad
      ref={signRef}
      canvasProps={{
        width: 220,
        height: 50,
        className: "sign-canvas"
      }}
    />


</div>
     
 
</div>
      </div>
      </div>

      {/* CSS */}
<style>{`
.form-container{
  width:100% !important;
  margin:0 !important;
  padding:0 !important;
  font-family:Arial, sans-serif;
}
  .inline{
  display:flex;
  justify-content:space-between;
  gap:20px;
}.sign-card{
  flex:1;
  min-width:220px;
}

.title{
  text-align:center;
  font-size:22px;
  font-weight:700;
  margin:12px 0 20px 0;  margin:8px 0 14px;
}
  .action-right{
  display:flex;
  align-items:center;
}

/* MAIN BOX GAP */
.section{
  
  padding:14px !important;
  margin-top:10px !important;
  margin-bottom:0;
}
.section,
.section-with-border{

  margin-top:6px;
  padding:10px !important;
}
  .section-with-border{

border:1px solid #000;
  
}

  .sign-row{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  margin-top:12px;
  gap:20px;
}

.digital-sign-box{
  width:180px;
  height:60px;
  border:1px solid #000;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  color:#555;
}

.sign-label{
  font-style:italic;
}

.hideboder{
  border:none !important;
  outline:none;
  width:100%;
}
    .sign-head-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:6px;
}

/* HEADING GAP */
.section-title{
  font-weight:700;
  color:#000;
  font-size:14px;
  margin:0 0 4px 0;
  padding:0;
  line-height:1.1;
}

/* TABLE GAP */
.table{
  width:100%;
  border-collapse:collapse;
  margin-top:2px;
}

.table td,
.table th{
  border:1px solid #000;
  padding:10px !important;
  font-size:13px;
  vertical-align:middle;
}

/* FIELD GAP */
.inline,
.row-line{
  display:flex;
  align-items:center;
  gap:14px;
  margin-top:14px !important;
  flex-wrap:wrap;
}
  .contact-row{
  display:flex;
  justify-content:flex-start;
  align-items:center;
  gap:40px;          /* space between phone and email */
  margin-top:10px;
  flex-wrap:wrap;
}

.contact-row span{
  font-size:13px;
}

.two-col-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:30px;
  margin-top:14px !important;
}

/* CHECKBOX GAP */
.checkbox-group{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px 40px;
  margin-top:14px !important;
  margin-bottom:14px !important;
}

.checkbox-group label{
  display:flex;
  align-items:center;
  gap:8px;
}

/* LINE WIDTH */
.line,
.value-line{
  border-bottom:1px solid #000;
  width:120px;
  display:inline-block;
  padding-bottom:2px;
}

.gender{
  display:flex;
  gap:10px;
  align-items:center;
}

@media(max-width:600px){
  .two-col-row,
  .checkbox-group{
    grid-template-columns:1fr;
  }
}.hideboder{
  border:none !important;}
.sign-row{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  gap:30px;
  margin-top:15px;
  width:100%;
}

.date-box{
  flex:1;
  font-size:13px;
}

.signature-wrapper{
  width:240px;
  text-align:center;
}

.sign-canvas{
  border:1px solid #000;
  background:#fff;
}

.saved-sign{
  width:220px;
  height:80px;
  object-fit:contain;
  border:1px solid #000;
}

.btn-row{
  margin-top:6px;
  display:flex;
  justify-content:center;
  gap:8px;
}

.btn-row button{
  padding:4px 10px;
  font-size:12px;
}

@media(max-width:600px){
  .sign-row{
    flex-direction:column;
    align-items:flex-start;
  }

  .signature-wrapper{
    width:100%;
  }
}

@media print{
  .no-print{
    display:none !important;
  }
}
  .patient-sign-row{
  display:flex;
  align-items:center;
  gap:12px;
  margin-top:10px;
 
}

.sign-label-side{
  min-width:130px;
  font-size:13px;
}

.icon-column{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.canvas-side{
  flex:1;
}

.sign-canvas{
  border:1px solid #000;
  background:#fff;
}

 
`}</style>
    </div>
  );
};

export default PatientRegistration;