// import React, { useEffect, useState, useRef } from 'react'
// import { useLocation } from 'react-router-dom'
// import { ConsentFormData, updateConsentFormData } from './ConsentFormAPI'
// import { useReactToPrint } from 'react-to-print'

// const ConsentFormComponent = () => {
//   const [form, setForm] = useState({})
//   const [isEditing, setIsEditing] = useState(false)
//   const location = useLocation()
//   const appointment = location.state?.appointment

//   // 🆕 Ref for printing
//   const printRef = useRef()
//   const handleDownloadPDF = useReactToPrint({
//     contentRef: printRef, // ✅ new API
//     documentTitle: `Consent_Form_${form.fullName || 'Patient'}`,
//     pageStyle: `
//       @page { size: auto; margin: 20mm; }
//       body { -webkit-print-color-adjust: exact; }
//     `
//   })

//   useEffect(() => {
//     if (appointment) {
//       const fetchData = async () => {
//         try {
//           const bookingId = appointment.bookingId
//           const patientId = appointment.patientId
//           const contactNumber = appointment.contactNumber || appointment.mobileNumber
//           const consentData = await ConsentFormData(bookingId, patientId, contactNumber)

//           if (consentData?.data) {
//             setForm({
//               ...consentData.data,
//               consentFormId: consentData.data.id,
//               fullName: appointment.patientName || consentData.data.fullName,
//               contactNumber: contactNumber || consentData.data.contactNumber,
//               patientAddress: consentData.data.patientAddress || '',
//             })
//           }
//         } catch (error) {
//           console.error('Error fetching consent form:', error)
//         }
//       }
//       fetchData()
//     }
//   }, [appointment])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setForm((prev) => ({ ...prev, [name]: value }))
//   }
//   const handleCheckboxChange = (field) => {
//     setForm((prev) => ({ ...prev, [field]: !prev[field] }))
//   }

//   const handleEdit = () => setIsEditing(true)
//   const handleUpdate = async () => {
//     try {
//       if (!form.consentFormId) {
//         console.error('Consent Form ID missing — cannot update')
//         return
//       }
//       await updateConsentFormData(form.consentFormId, form)
//       setIsEditing(false)
//     } catch (error) {
//       console.error('Failed to update consent form:', error)
//     }
//   }

//   const consentQuestions = [
//     { field: 'informedAboutProcedure', label: 'I have been informed about the procedure.' },
//     { field: 'understandRisks', label: 'I understand the risks involved.' },
//     { field: 'informedAlternatives', label: 'I have been informed of alternatives.' },
//     {
//       field: 'hadOpportunityQuestions',
//       label: 'I have had the opportunity to ask questions and all were answered.',
//     },
//     {
//       field: 'noGuaranteesGiven',
//       label: 'I understand that no guarantees have been given about the results.',
//     },
//     { field: 'consentAnesthesia', label: 'I consent to anesthesia if required.' },
//     { field: 'understandAnesthesiaRisks', label: 'I understand the risks of anesthesia.' },
//     { field: 'consentRecording', label: 'I consent to the recording of the procedure.' },
//     { field: 'noConsentRecording', label: 'I do not consent to the recording of the procedure.' },
//     { field: 'rightWithdraw', label: 'I understand my right to withdraw consent at any time.' },
//     { field: 'giveConsentProceed', label: 'I give my consent to proceed with the procedure.' },
//   ]

//   return (
//     <div
//       ref={printRef}
//       id="consent-form-container"
//       className="container mt-4 p-4 border rounded bg-white"
//     >
//       {' '}
//       {/* Header */}
//       <div className="text-center mb-4">
//         <h2>🏥 DermaCare Clinic</h2>
//         <h4>Patient Consent Form</h4>
//       </div>
//       {/* Patient Information */}
//       <h5>Patient Information</h5>
//       <div className="row mb-3">
//         <div className="col-md-6">
//           <label>Name</label>
//           <input
//             name="fullName"
//             value={form.fullName || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6">
//           <label>Age</label>
//           <input
//             name="dateOfBirth"
//             value={form.dateOfBirth || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6 mt-2">
//           <label>Contact</label>
//           <input
//             name="contactNumber"
//             value={form.contactNumber || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6 mt-2">
//           <label>Address</label>
//           <input
//             name="patientAddress"
//             value={form.patientAddress || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6 mt-2">
//           <label>Procedure</label>
//           <input
//             name="procedureName"
//             value={form.procedureName || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6 mt-2">
//           <label>Procedure Date</label>
//           <input
//             type="date"
//             name="procedureDate"
//             value={form.procedureDate || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//         <div className="col-md-6 mt-2">
//           <label>Physician</label>
//           <input
//             name="physicianName"
//             value={form.physicianName || ''}
//             onChange={handleChange}
//             className="form-control"
//             disabled={!isEditing}
//           />
//         </div>
//       </div>
//       {/* Consent Statements */}
//       <h5 className="mt-4">Consent Statements</h5>
//       <div>
//         {consentQuestions.map((q, index) => (
//           <div key={index} className="form-check">
//             <input
//               type="checkbox"
//               className="form-check-input"
//               id={q.field}
//               checked={!!form[q.field]}
//               disabled={!isEditing}
//               onChange={() => handleCheckboxChange(q.field)}
//             />
//             <label className="form-check-label" htmlFor={q.field}>
//               {q.label}
//             </label>
//           </div>
//         ))}
//       </div>
//       {/* Signatures */}
//       <h5 className="mt-4">Signatures</h5>
//       <div className="row mt-3">
//         {/* Patient Side */}
//         <div className="col-md-6">
//           <p>
//             <strong>Name:</strong> ___________________
//           </p>
//           <p>
//             <strong>Signature:</strong> ______________
//           </p>
//           <p>
//             <em>(Hospital Name: DermaCare Clinic)</em>
//           </p>
//           <p>
//             <em>(Address:{form.patientAddress || '________________'})</em>
//           </p>
//         </div>

//         {/* Doctor Side */}
//         <div className="col-md-6">
//           <p>
//             <strong>Name:</strong> Dr. ___________________
//           </p>
//           <p>
//             <strong>Designation:</strong> ________________
//           </p>
//           <p>
//             <strong>License No:</strong> _______________
//           </p>
//           <p>
//             <strong>Signature:</strong>
//           </p>
//           {form.physicianSignature && (
//             <img
//               src={`data:image/png;base64,${form.physicianSignature}`}
//               alt="Physician Signature"
//               style={{ display: 'block', marginTop: '5px', maxWidth: '200px' }}
//             />
//           )}
//         </div>
//       </div>
//       {/* Action Buttons */}
//        <div className="d-flex gap-2 mt-4">
//         {!isEditing ? (
//           <>
//             <button className="btn btn-primary" onClick={handleEdit}>
//               Edit
//             </button>
//             <button className="btn btn-info" onClick={handleDownloadPDF}>
//               Print
//             </button>
//           </>
//         ) : (
//           <>
//             <button className="btn btn-success" onClick={handleUpdate}>
//               Update
//             </button>
//             <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
//               Cancel
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ConsentFormComponent
