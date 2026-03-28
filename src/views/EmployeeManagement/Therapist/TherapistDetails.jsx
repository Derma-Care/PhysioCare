import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CButton,
} from '@coreui/react'

export default function TherapistDetails() {
  const location = useLocation()
  const data = location.state

  if (!data) return <p>No Data</p>

  const formatDay = (d) =>
    d ? d.charAt(0).toUpperCase() + d.slice(1) : ''

  return (
    <CCard className="shadow border-0 rounded-4">
      <CCardBody>

        {/* 🔥 HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">

           <img
  src={
    data.documents?.profilePhoto
      ? `data:image/jpeg;base64,${data.documents.profilePhoto}`
      : '/assets/images/default-avatar.png'
  }
  alt={data.fullName}
  width="140"
  height="140"
  style={{
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #ddd',
  }}
/>

            <div>
              <h4 className="mb-1">{data.fullName}</h4>
              <small className="text-muted">{data.therapistId}</small>

              <div className="mt-2">
                <CBadge  style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}  className="me-2">
                  {data.role || 'Therapist'}
                </CBadge>
                <CBadge   style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}>
                  {data.yearsOfExperience} yrs exp
                </CBadge>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 PERSONAL */}
        <h6 className="fw-bold mb-3"  style={{  color: 'var(--color-black)' }}>Personal Details</h6>
        <CRow className="mb-3">
          <CCol md={4}><b>Contact:</b> {data.contactNumber}</CCol>
          <CCol md={4}><b>Gender:</b> {data.gender}</CCol>
          <CCol md={4}><b>DOB:</b> {data.dateOfBirth}</CCol>
        </CRow>

        {/* 🔹 PROFESSIONAL */}
        <h6 className="fw-bold  mb-3" style={{  color: 'var(--color-black)' }}>Professional Details</h6>
        <CRow className="mb-3">
          <CCol md={4}><b>Qualification:</b> {data.qualification}</CCol>
          <CCol md={4}><b>Experience:</b> {data.yearsOfExperience} years</CCol>
          <CCol md={4}><b>Services:</b> {data.services?.join(', ') || 'N/A'}</CCol>
        </CRow>

        <CRow className="mb-3" >
          <CCol md={4}><b>Specializations:</b> {data.specializations?.join(', ') || 'N/A'}</CCol>
          <CCol md={4}><b>Expertise:</b> {data.expertiseAreas?.join(', ') || 'N/A'}</CCol>
          <CCol md={4}><b>Treatments:</b> {data.treatmentTypes?.join(', ') || 'N/A'}</CCol>
        </CRow>

        {/* 🔹 AVAILABILITY */}
        <h6 className="fw-bold mb-3" style={{  color: 'var(--color-black)' }}>Availability</h6>
        <CRow className="mb-3">
          <CCol md={6}>
            <b>Days:</b>{' '}
            {data.availability?.days?.map(formatDay).join(', ') || 'N/A'}
          </CCol>

          <CCol md={6}>
            <b>Time:</b> {data.availability?.startTime} - {data.availability?.endTime}
          </CCol>
        </CRow>

        {/* 🔹 LANGUAGES */}
        <h6 className="fw-bold mb-3" style={{  color: 'var(--color-black)' }}>Languages</h6>
        <CRow className="mb-3">
          <CCol md={12}>
            {data.languages?.map((lang, i) => (
              <CBadge key={i} style={{  color: 'var(--color-black)' }} className="me-2">
                {lang}
              </CBadge>
            ))}
          </CCol>
        </CRow>

        {/* 🔹 BIO */}
        <h6 className="fw-bold mb-3"style={{  color: 'var(--color-black)' }}>Profile Description</h6>
        <p className="text-muted">{data.bio || 'N/A'}</p>

        {/* 🔥 DOCUMENTS */}
        <h6 className="fw-bold  mb-3" style={{  color: 'var(--color-black)' }}>Documents</h6>
        <CRow>
          <CCol md={4}>
            <p><b>License Certificate</b></p>
            {data.documents?.licenseCertificate ? (
              <CButton
                style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
                size="sm"
                onClick={() =>
                  window.open(
                    `data:application/pdf;base64,${data.documents.licenseCertificate}`
                  )
                }
              >
                View PDF
              </CButton>
            ) : 'Not Uploaded'}
          </CCol>

          <CCol md={4}>
            <p><b>Degree Certificate</b></p>
            {data.documents?.degreeCertificate ? (
              <CButton
                  style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
                size="sm"
                onClick={() =>
                  window.open(
                    `data:application/pdf;base64,${data.documents.degreeCertificate}`
                  )
                }
              >
                View PDF
              </CButton>
            ) : 'Not Uploaded'}
          </CCol>

          
        </CRow>

      </CCardBody>
    </CCard>
  )
}