/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React from 'react'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { Building2, Mail, MapPin, Phone } from 'lucide-react'

const PrintLetterHead = ({ children,printDate  }) => {
  const now = printDate ? new Date(printDate) : new Date()

  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()
const{selectedHospital} = useHospital()
  return (
    <div className="print-letter">
      {/* HEADER */}
      <div className="letter-header">
        <div className="logo">
        <img
  src={
    selectedHospital?.data?.hospitalLogo
      ? `data:image/jpeg;base64,${selectedHospital.data.hospitalLogo}`
      : "/logo.png"
  }
  alt="logo"
  style={{ height: 60 }}
/>
        </div>

        <div className="hospital-info" >
          <h4 className='fw-bold' style={{color:"#000"}}>{selectedHospital?.data?.name}</h4>
         <div
  style={{
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",
    fontSize: "13px",
    flexDirection:"column",
    flexWrap: "wrap",
    color:"gray"
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: 5,color:"gray" }}>
    <MapPin size={14} />
    {selectedHospital?.data?.address}
  </span>

  
</div>
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    alignItems: "center",
    fontSize: "13px",
    marginTop:"5px"
  }}
>
  <span style={{ display: "flex", alignItems: "center", gap: 5,color:"gray" }}>
    <Building2 size={14} />
    {selectedHospital?.data?.branch}
  </span>
  <span style={{ display: "flex", alignItems: "center", gap: 5,color:"gray" }}>
    <Phone size={14} />
    {selectedHospital?.data?.contactNumber}
  </span>

  <span style={{ display: "flex", alignItems: "center", gap: 5 ,color:"gray"}}>
    <Mail size={14} />
    {selectedHospital?.data?.emailAddress}
  </span>
</div>
        </div>

        <div className="print-info">
          <div>Date : {date}</div>
          <div>Time : {time}</div>
        </div>
      </div>

      <hr />

      {/* CONTENT */}
      <div className="letter-body">{children}</div>
      {/* FOOTER */}
<div className="letter-footer">
  <div className="footer-line"></div>

  <div className="footer-content">
    <div className="footer-left">
      Authorized Signature
    </div>

    <div className="footer-right">
      Thank You. Visit Again!
    </div>
  </div>
</div>
<style>
{`

.print-letter {
  width: 100%;
  display: block;
  padding-bottom: 80px; /* space for footer */
}

.letter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hospital-info {
  text-align: center;
}

.print-info {
  text-align: right;
}

.letter-body {
  width: 100%;
}

/* FOOTER */

.letter-footer {
  width: 100%;
}

.footer-line {
  border-top: 1px solid black;
  margin-top: 30px;
  margin-bottom: 5px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.footer-left {
  text-align: left;
}

.footer-right {
  text-align: right;
}


/* ================= PRINT ================= */

@media print {

  body * {
    visibility: hidden;
  }

  .print-letter,
  .print-letter * {
    visibility: visible;
  }

  .print-letter {
    position: relative;
    width: 100%;
    padding-bottom: 100px; /* important for footer space */
  }

  .letter-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
  }

  .no-print {
    display: none !important;
  }

}

`}
</style>
    </div>
  )
}

export default PrintLetterHead
