import React from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CRow,
  CCol,
  CBadge,
} from '@coreui/react'
import {
  User,
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  Activity,
  FileText
} from 'lucide-react'

/**
 * PatientBookingReceipt Component
 * Displays a premium summary of a patient booking.
 * 
 * @param {Object} data - The booking data object provided by the user.
 */

const tokens = {
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#1e293b',
  slateMuted: '#64748b',
  border: '#e2e8f0',
  radius: '16px',
  shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
}

const PatientBookingReceipt = ({ data }) => {
  if (!data) return <div className="p-5 text-center">No data available</div>

  const patient = data
  const normalizedStatus = patient.status || 'in-progress'

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <CRow className="justify-content-center">
        <CCol lg={10} xl={8}>
          {/* Header Section */}
          <div className="mb-4 d-flex justify-content-between align-items-end">
            <div>
              <h2 style={{ fontWeight: 800, color: tokens.slate, marginBottom: '4px', letterSpacing: '-0.02em' }}>Booking Summary</h2>
              <p className="text-muted small mb-0">Reference ID: <span className="fw-bold text-dark">{patient.bookingId}</span></p>
            </div>
            <div className="text-end">
              <CBadge
                style={{
                  backgroundColor: normalizedStatus === 'in-progress' ? '#fef3c7' : '#dcfce7',
                  color: normalizedStatus === 'in-progress' ? '#92400e' : '#15803d',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {normalizedStatus}
              </CBadge>
            </div>
          </div>

          <CRow className="g-4">
            {/* Left Column: Patient & Clinical Info */}
            <CCol md={7}>
              <CCard style={{ borderRadius: tokens.radius, border: 'none', boxShadow: tokens.shadow, marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)', height: '6px' }} />
                <CCardBody className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      border: `1px solid ${tokens.border}`
                    }}>
                      <User size={32} color={tokens.slateMuted} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, color: tokens.slate }}>{patient.name}</h4>
                      <p className="mb-0 small" style={{ color: tokens.slateMuted }}>
                        {patient.gender} • {patient.age} Years • {patient.patientId}
                      </p>
                    </div>
                  </div>

                  <hr style={{ opacity: 0.1, margin: '24px 0' }} />

                  <h6 className="mb-3 d-flex align-items-center" style={{ fontWeight: 700, color: tokens.slate }}>
                    <Activity size={18} className="me-2" style={{ color: tokens.primary }} /> Clinical Assessment
                  </h6>

                  <div className="p-3 mb-3" style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: `1px solid ${tokens.border}` }}>
                    <CRow className="g-3">
                      <CCol xs={6}>
                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Chief Complaint</small>
                        <p className="mb-0 fw-semibold text-dark">{patient.problem || 'Not Specified'}</p>
                      </CCol>
                      <CCol xs={6}>
                        <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Duration</small>
                        <p className="mb-0 fw-semibold text-dark">{patient.symptomsDuration || 'Not Specified'}</p>
                      </CCol>
                    </CRow>
                  </div>

                  {patient.partImage && (
                    <div className="mt-4">
                      <small className="text-muted text-uppercase fw-bold d-block mb-2" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Pain Area Mapping</small>
                      <div className="border rounded-3 p-3 text-center bg-white shadow-sm">
                        <img
                          src={`data:image/png;base64,${patient.partImage}`}
                          alt="Body Assessment"
                          style={{ maxWidth: '100%', height: 'auto', maxHeight: '350px' }}
                        />
                      </div>
                    </div>
                  )}
                </CCardBody>
              </CCard>

              <CCard style={{ borderRadius: tokens.radius, border: 'none', boxShadow: tokens.shadow }}>
                <CCardBody className="p-4">
                  <h6 className="mb-3 d-flex align-items-center" style={{ fontWeight: 700, color: tokens.slate }}>
                    <FileText size={18} className="me-2" style={{ color: tokens.primary }} /> Clinical Attachments
                  </h6>
                  {patient.attachments && patient.attachments.length > 0 ? (
                    <div className="d-flex flex-wrap gap-3">
                      {patient.attachments.map((at, idx) => (
                        <div key={idx} className="text-center" style={{ width: '100px' }}>
                          <div
                            style={{
                              width: '100px',
                              height: '100px',
                              backgroundColor: '#f1f5f9',
                              borderRadius: '12px',
                              border: `1px solid ${tokens.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden'
                            }}
                            onClick={() => {
                              const win = window.open();
                              win.document.write(`<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000"><img src="data:image/png;base64,${at}" style="max-width:100%;max-height:100vh"/></body>`);
                            }}
                          >
                            <img src={`data:image/png;base64,${at}`} alt="Clinical report" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <small className="text-muted mt-2 d-block" style={{ fontSize: '10px' }}>Report {idx + 1}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center border-dashed rounded-3" style={{ border: `2px dashed ${tokens.border}` }}>
                      <p className="text-muted small mb-0">No medical reports attached.</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>

            {/* Right Column: Appointment & Financials */}
            <CCol md={5}>
              <CCard className="mb-4" style={{ borderRadius: tokens.radius, border: 'none', boxShadow: tokens.shadow }}>
                <CCardBody className="p-4">
                  <h6 className="mb-4" style={{ fontWeight: 700, color: tokens.slate }}>Schedule Details</h6>

                  <div className="mb-4">
                    <div className="d-flex align-items-start mb-4">
                      <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#eef2ff' }}>
                        <Calendar size={18} color={tokens.primary} />
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Appointment Date</small>
                        <span className="fw-bold" style={{ color: tokens.slate }}>{patient.serviceDate}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-4">
                      <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#fff7ed' }}>
                        <Clock size={18} color="#f97316" />
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Time Slot</small>
                        <span className="fw-bold" style={{ color: tokens.slate }}>{patient.servicetime}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start mb-4">
                      <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f0fdf4' }}>
                        <Stethoscope size={18} color={tokens.success} />
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Doctor</small>
                        <span className="fw-bold text-primary">{patient.doctorName}</span>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f1f5f9' }}>
                        <MapPin size={18} color={tokens.slateMuted} />
                      </div>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>Facility</small>
                        <span className="fw-bold" style={{ color: tokens.slate }}>{patient.clinicName}</span>
                        <div className="small" style={{ color: tokens.slateMuted }}>{patient.branchname} Branch</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: `1px solid ${tokens.border}` }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">Consultation Fee</span>
                      <span className="fw-bold text-dark">₹{patient.consultationFee.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted small">GST (0%)</span>
                      <span className="fw-bold text-dark">₹0.00</span>
                    </div>
                    <hr style={{ opacity: 0.1, margin: '12px 0' }} />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: tokens.slate }}>Total Payable</span>
                      <span className="h4 mb-0 fw-bold" style={{ color: tokens.primary }}>₹{patient.consultationFee.toFixed(2)}</span>
                    </div>
                  </div>

                  <CButton
                    className="w-100 mt-4 border-0"
                    style={{
                      backgroundColor: tokens.primary,
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                    }}
                    onClick={() => window.print()}
                  >
                    Generate Invoice
                  </CButton>
                </CCardBody>
              </CCard>

              <CCard style={{ borderRadius: tokens.radius, border: 'none', boxShadow: tokens.shadow, backgroundColor: tokens.slate, color: '#fff' }}>
                <CCardBody className="p-4 text-center">
                  <p className="mb-0 small" style={{ opacity: 0.7 }}>Powered by Kinetix Wellness Care</p>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    </div>
  )
}

export default PatientBookingReceipt
