import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CModalFooter,
  CModalHeader,
  CModal,
  CModalTitle,
  CModalBody,
  CForm,
  CFormInput,
  CAccordionItem,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import axios from 'axios'
import jsPDF from 'jspdf'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { AppointmentData, deleteBookingData, GetBookingByClinicIdData } from './appointmentAPI'
import { GetdoctorsByClinicIdData } from './appointmentAPI'
import { FaEye, FaDownload } from 'react-icons/fa'
import { deleteVitalsData, postVitalsData, updateVitalsData, VitalsDataById } from './VitalsAPI'
import { Download, Eye, ArrowLeft, Activity, FileText, User, Stethoscope, CreditCard, ChevronRight } from 'lucide-react'
import { useHospital } from '../Usecontext/HospitalContext'
import { GetProcedureFormData } from '../ConsentForms/ConsentFormsAPI'
import ConsentFormHandler from '../ConsentForms/ConsentFormHandler'
import { showCustomToast } from '../../Utils/Toaster'
import PaymentAccordion from './PaymentProgram'
import ProgramPayment from './PaymentProgram'
import PhysioConsentForm from './PhysioConsentForm'

/* ─────────────────────────────────────────────
   Inline styles – scoped design tokens
───────────────────────────────────────────── */
const tokens = {
  primary: 'var(--color-bgcolor)',
  white: '#ffffff',
  black: '#1e293b',
  surface: '#f8fafc',
  border: '#e2e8f0',
  muted: '#64748b',
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#dc2626',
  dangerBg: '#fee2e2',
  radius: '10px',
  radiusSm: '6px',
  shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
}

/* Status badge config */
const statusConfig = {
  confirmed:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Confirmed' },
  active:     { bg: '#dcfce7', color: '#15803d', label: 'Active' },
  completed:  { bg: '#f3f4f6', color: '#374151', label: 'Completed' },
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  rejected:   { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
}

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending
  return (
    <span style={{
      backgroundColor: cfg.bg,
      color: cfg.color,
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '4px 12px',
      borderRadius: '20px',
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.label}
    </span>
  )
}

/* Section header */
const SectionHeading = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
    {Icon && (
      <span style={{
        width: '28px', height: '28px', borderRadius: '6px',
        backgroundColor: 'var(--color-bgcolor)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} color="#fff" />
      </span>
    )}
    <h6 style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#1e293b' }}>
      {title}
    </h6>
  </div>
)

/* Info grid item */
const InfoItem = ({ label, value }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </div>
    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>
      {value || '—'}
    </div>
  </div>
)

/* Vitals chip */
const VitalChip = ({ label, value, unit }) => (
  <div style={{
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '10px 14px',
    minWidth: '120px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-bgcolor)' }}>
      {value || '—'}
    </div>
    {unit && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{unit}</div>}
  </div>
)

/* Divider */
const Divider = () => (
  <hr style={{ border: 'none', borderTop: `1px solid ${tokens.border}`, margin: '20px 0' }} />
)

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const AppointmentDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const calculateBMI = (height, weight) => {
    const h = Number(height) / 100
    const w = Number(weight)
    if (!h || !w) return ''
    return (w / (h * h)).toFixed(2)
  }

  const [formData, setFormData] = useState({
    height: '', weight: '', bloodPressure: '', temperature: '', bmi: '',
  })

  useEffect(() => {
    if (formData.height && formData.weight) {
      const bmi = calculateBMI(formData.height, formData.weight)
      setFormData(prev => ({ ...prev, bmi }))
    }
  }, [formData.height, formData.weight])

  const appointment = location.state?.appointment
  const { hospitalId, selectedHospital } = useHospital()

  if (!appointment) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <h3 style={{ marginBottom: '12px', color: tokens.black }}>No Appointment Data Found</h3>
        <CButton color="primary" onClick={() => navigate(-1)}>Go Back</CButton>
      </div>
    )
  }

  const normalizedStatus = (() => {
    const s = appointment?.status?.trim()?.toLowerCase()
    return s === 'in-progress' ? 'active' : s
  })()

  const showConfirmed           = normalizedStatus === 'confirmed'
  const showCompletedOrActive   = ['completed', 'active'].includes(normalizedStatus)
  const showVitalsCard          = ['completed', 'active', 'confirmed'].includes(normalizedStatus) && vitals
  const showPayment             = ['active'].includes(normalizedStatus)
  const showConfirmedOrCompleted = ['confirmed', 'completed', 'active'].includes(normalizedStatus)
  const showPrescription        = ['active', 'completed'].includes(normalizedStatus) && appointment?.prescriptionPdf
  const showAccordion           = ['confirmed', 'active', 'completed'].includes(normalizedStatus)

  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (['confirmed', 'completed', 'active'].includes(normalizedStatus) && appointment?.doctorId) {
        try {
          const res = await GetdoctorsByClinicIdData(appointment.doctorId)
          setDoctor(res.data || {})
        } catch (error) {
          console.error('Failed to fetch doctor details:', error)
        }
      }
    }
    fetchDoctorDetails()
  }, [normalizedStatus, appointment?.doctorId])

  useEffect(() => {
    if (['confirmed', 'active', 'completed'].includes(normalizedStatus)) fetchVitals()
  }, [appointment?.bookingId, appointment?.patientId, normalizedStatus])

  const getDoctorImage = (picture) => {
    if (!picture) return '/default-doctor.png'
    return picture.startsWith('data:image') ? picture : `data:image/jpeg;base64,${picture}`
  }

  const fetchVitals = async () => {
    try {
      const data = await VitalsDataById(appointment.bookingId, appointment.patientId)
      setVitals(Array.isArray(data) && data.length === 0 ? null : data[0])
    } catch (error) {
      console.error('Error fetching vitals:', error)
    }
  }

  const regexRules = {
    height: /^(?:[1-9][0-9]{1,2})$/,
    weight: /^(?:[1-9][0-9]{0,2})$/,
    bloodPressure: /^\d{2,3}\/\d{2,3}$/,
    temperature: /^(?:\d{2,3})(?:\.\d{1,2})?$/,
    bmi: /^\d{1,2}(?:\.\d{1,2})?$/,
  }

  const errorMap = {
    height: 'Height must be a number between 10 and 999 cm',
    weight: 'Weight must be a number between 1 and 999 kg',
    bloodPressure: 'Blood Pressure must be in format: 120/80',
    temperature: 'Temperature must be a valid number (e.g., 98.6)',
    bmi: 'BMI must be a valid number (e.g., 24.5)',
  }

  // ── FIX: onChange only updates state, no validation ──
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ── FIX: validation only fires when user leaves the field ──
  const handleBlur = (e) => {
    const { name, value } = e.target
    if (!value) {
      // Clear error if field is empty (let submit handle required check)
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
      return
    }
    setValidationErrors(prev => ({
      ...prev,
      [name]: !regexRules[name]?.test(value) ? errorMap[name] : '',
    }))
  }

  const validateVitals = () => {
    const errors = {}
    Object.keys(formData).forEach(field => {
      if (!regexRules[field]?.test(formData[field])) errors[field] = errorMap[field]
    })
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmitVitals = async () => {
    if (!validateVitals()) { showCustomToast('Please fix validation errors before submitting.', 'error'); return }
    try {
      setLoading(true)
      const payload = {
        patientId: appointment.patientId, bookingId: appointment.bookingId,
        height: formData.height, weight: Number(formData.weight) || 0,
        bloodPressure: formData.bloodPressure, temperature: formData.temperature,
        bmi: formData.bmi, date: new Date().toISOString(),
      }
      await postVitalsData(payload, payload.bookingId)
      showCustomToast('Vitals added successfully!', 'success')
      setShowModal(false)
      setFormData({ height: '', weight: '', bloodPressure: '', temperature: '', bmi: '' })
      setValidationErrors({})
      fetchVitals()
    } catch (error) {
      showCustomToast('Failed to add vitals', 'error')
    } finally { setLoading(false) }
  }

  const handleUpdateVitals = async () => {
    try {
      await updateVitalsData(formData, appointment.bookingId, appointment.patientId)
      showCustomToast('Vitals updated successfully!', 'success')
      setShowModal(false); fetchVitals()
    } catch (error) {}
  }

  const handleDeleteVitals = async () => {
    try {
      await deleteVitalsData(appointment.bookingId, appointment.patientId)
      showCustomToast('Vitals deleted successfully!', 'success')
      setVitals(null)
    } catch (error) {}
  }

  const getMimeTypeFromBase64 = (b64) => {
    if (b64.startsWith('JVBERi0')) return 'application/pdf'
    if (b64.startsWith('/9j/')) return 'image/jpeg'
    if (b64.startsWith('iVBORw0')) return 'image/png'
    return 'application/octet-stream'
  }

  const base64toBlob = (base64, mimeType) => {
    try {
      const bytes = atob(base64)
      const arr = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
      return new Blob([arr], { type: mimeType })
    } catch (e) { alert('Failed to decode file data.'); return null }
  }

  const handlePreview = (base64String) => {
    if (!base64String || typeof base64String !== 'string') { alert('No valid file data.'); return }
    const blob = base64toBlob(base64String, getMimeTypeFromBase64(base64String))
    window.open(URL.createObjectURL(blob), '_blank')
  }

  const handleDownload = (base64String, fileName) => {
    if (!base64String || typeof base64String !== 'string') { alert('No valid file data.'); return }
    const blob = base64toBlob(base64String, getMimeTypeFromBase64(base64String))
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = fileName || 'file.pdf'
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); URL.revokeObjectURL(url)
  }

  const handlePaymentClick = () => {
    if (showPayment && normalizedStatus === 'active' || appointment?.status === 'in-progress') {
      navigate('/program-payment' + `/${id}`, {
        state: {
          bookingId: appointment.bookingId, doctorId: appointment.doctorId,
          clinicId: appointment.clinicId, branchId: appointment.branchId,
          patientId: appointment.patientId,
        }
      })
    } else { alert('Payment allowed only for active status') }
  }

  /* ── shared action button ── */
  const ActionBtn = ({ onClick, children, color = 'primary', style = {} }) => (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '5px 12px', borderRadius: tokens.radiusSm,
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        border: 'none', color: '#fff',
        backgroundColor: color === 'success' ? tokens.success : 'var(--color-bgcolor)',
        boxShadow: tokens.shadow, transition: 'opacity .15s',
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </button>
  )

  /* ── form field ── FIX: added onBlur prop ── */
  const Field = ({ label, name, placeholder }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.muted, display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      <CFormInput
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        invalid={!!validationErrors[name]}
        style={{ fontSize: '13px', borderRadius: tokens.radiusSm }}
      />
      {validationErrors[name] && (
        <small style={{ color: tokens.danger, fontSize: '11px' }}>{validationErrors[name]}</small>
      )}
    </div>
  )

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '20px', color: '#1e293b' }}>

      {/* ── TOP HEADER BAR ─────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--color-bgcolor)',
        borderRadius: tokens.radius,
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        boxShadow: tokens.shadowMd,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff',
            }}
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>PATIENT FILE ID</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{appointment.patientId}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusBadge status={normalizedStatus} />

          {showConfirmed && !vitals && (
            <ActionBtn onClick={() => {
              setFormData({ height: '', weight: '', bloodPressure: '', temperature: '', bmi: '' })
              setValidationErrors({})
              setShowModal(true)
            }}>
              <Activity size={13} /> Add Vitals
            </ActionBtn>
          )}
          {showPayment && (
            <ActionBtn color="success" onClick={handlePaymentClick}>
              <CreditCard size={13} /> Payment
            </ActionBtn>
          )}
          {vitals && (
            <ActionBtn onClick={() => navigate('/physio-consent-form', { state: { bookingDetails: appointment, vitals, doctorsign: doctor?.doctorSignature } })}>
              <FileText size={13} /> Consent Form
            </ActionBtn>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT CARD ─────────────────────────── */}
      <div style={{
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderRadius: tokens.radius,
        boxShadow: tokens.shadow,
        border: `1px solid ${tokens.border}`,
        overflow: 'hidden',
      }}>

        {/* ── PATIENT DETAILS ── */}
        <div style={{ padding: '20px 24px' }}>
          <SectionHeading icon={User} title="Patient Details" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0 24px' }}>
            <InfoItem label="Patient Name"      value={appointment?.name} />
            <InfoItem label="Mobile Number"     value={appointment?.patientMobileNumber} />
            <InfoItem label="Booking For"       value={appointment?.bookingFor} />
            <InfoItem label="Age"               value={appointment?.age ? `${appointment.age} Yrs` : null} />
            <InfoItem label="Gender"            value={appointment?.gender} />
            <InfoItem label="Visit Type"        value={appointment?.visitType} />
          </div>

          {appointment?.problem && (
            <div style={{
              backgroundColor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radiusSm,
              padding: '10px 14px',
              marginTop: '4px',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chief Complaint / Problem</div>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>{appointment.problem}</div>
            </div>
          )}
        </div>

        <Divider />

        {/* ── SLOT & PAYMENT ── */}
        <div style={{ padding: '0 24px 20px' }}>
          <SectionHeading icon={CreditCard} title="Slot & Payment Details" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0 24px' }}>
            <InfoItem label="Date"             value={appointment?.serviceDate} />
            <InfoItem label="Time"             value={appointment?.servicetime} />
            <InfoItem label="Paid Amount"      value={appointment?.totalFee ? `₹${appointment.totalFee}` : null} />
            <InfoItem label="Consultation Fee" value={appointment?.listOfConsultationFee?.[0]?.consulationFee ? `₹${appointment.listOfConsultationFee[0].consulationFee}` : 'N/A'} />
          </div>
        </div>

        {/* ── VITALS CARD ── */}
        {showVitalsCard && (
          <>
            <Divider />
            <div style={{ padding: '0 24px 20px' }}>
              <SectionHeading icon={Activity} title="Vitals" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <VitalChip label="Height"         value={vitals?.height}        unit="cm" />
                <VitalChip label="Weight"         value={vitals?.weight}        unit="kg" />
                <VitalChip label="Blood Pressure" value={vitals?.bloodPressure} unit="mmHg" />
                <VitalChip label="Temperature"    value={vitals?.temperature}   unit="°C" />
                <VitalChip label="BMI"            value={vitals?.bmi}           unit="kg/m²" />
              </div>
            </div>
          </>
        )}

        {/* ── ACCORDION: Reports / Prescription ── */}
        {showConfirmedOrCompleted && doctor && (
          <>
            <Divider />
            <div style={{ padding: '0 24px 20px' }}>
              <SectionHeading icon={FileText} title="Documents" />

              <CAccordion flush style={{ border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, overflow: 'hidden' }}>

                {/* Past Reports */}
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>Past Reports</CAccordionHeader>
                  <CAccordionBody>
                    {appointment?.attachments?.length > 0 ? (
                      appointment.attachments.map((attachment, index) => (
                        <div key={index} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: index < appointment.attachments.length - 1 ? `1px solid ${tokens.border}` : 'none',
                        }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Attachment_{index + 1}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{appointment?.serviceDate}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <ActionBtn onClick={() => handlePreview(attachment)}><Eye size={13} /></ActionBtn>
                            <ActionBtn onClick={() => handleDownload(attachment, `attachment_${index + 1}.pdf`)}><Download size={13} /></ActionBtn>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: tokens.muted, margin: 0 }}>No past reports available.</p>
                    )}
                  </CAccordionBody>
                </CAccordionItem>

                {/* Prescription */}
                {showPrescription && (
                  <CAccordionItem itemKey={3}>
                    <CAccordionHeader>Prescription</CAccordionHeader>
                    <CAccordionBody>
                      {appointment.prescriptionPdf.map((pdf, index) => (
                        <div key={index} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: index < appointment.prescriptionPdf.length - 1 ? `1px solid ${tokens.border}` : 'none',
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>Prescription {index + 1}</div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <ActionBtn onClick={() => handlePreview(pdf)}><Eye size={13} /></ActionBtn>
                            <ActionBtn onClick={() => handleDownload(pdf, `prescription_${index + 1}.pdf`)}><Download size={13} /></ActionBtn>
                          </div>
                        </div>
                      ))}
                    </CAccordionBody>
                  </CAccordionItem>
                )}
              </CAccordion>
            </div>

            {/* ── DOCTOR CARD ── */}
            <Divider />
            <div style={{ padding: '0 24px 24px' }}>
              <SectionHeading icon={Stethoscope} title="Doctor Details" />

              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                border: `1px solid ${tokens.border}`, borderRadius: tokens.radius,
                padding: '16px', backgroundColor: tokens.surface,
              }}>
                <img
                  src={getDoctorImage(doctor.doctorPicture)}
                  alt={doctor.doctorName}
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2px solid var(--color-bgcolor)` }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{doctor.doctorName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-bgcolor)', fontWeight: '600', marginBottom: '6px' }}>{doctor.specialization}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Qualification:</strong> {doctor.qualification}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Experience:</strong> {doctor.experience} yrs</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}><strong style={{ color: '#1e293b' }}>Languages:</strong> {doctor.languages?.join(', ')}</span>
                  </div>
                </div>
                <ActionBtn onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })} style={{ alignSelf: 'center', flexShrink: 0 }}>
                  View <ChevronRight size={13} />
                </ActionBtn>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── ADD VITALS MODAL ──────────────────────────── */}
      <CModal
        visible={showModal}
        onClose={() => {
          setShowModal(false)
          setValidationErrors({})
        }}
        backdrop="static"
      >
        <CModalHeader style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
            <Activity size={16} style={{ marginRight: '8px', color: 'var(--color-bgcolor)', verticalAlign: 'middle' }} />
            Add Patient Vitals
          </CModalTitle>
        </CModalHeader>

        <CModalBody style={{ padding: '20px' }}>
          <CForm>
            <Field label="Height (cm)"           name="height"        placeholder="e.g. 170" />
            <Field label="Weight (kg)"           name="weight"        placeholder="e.g. 65" />
            <Field label="Blood Pressure"        name="bloodPressure" placeholder="e.g. 120/80" />
            <Field label="Temperature (°F / °C)" name="temperature"   placeholder="e.g. 98.6" />
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: tokens.muted, display: 'block', marginBottom: '4px' }}>
                BMI (auto-calculated)
              </label>
              <CFormInput
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 22.5"
                invalid={!!validationErrors.bmi}
                style={{ fontSize: '13px', borderRadius: tokens.radiusSm, backgroundColor: '#f8fafc' }}
                readOnly={!!(formData.height && formData.weight)}
              />
              {validationErrors.bmi && (
                <small style={{ color: tokens.danger, fontSize: '11px' }}>{validationErrors.bmi}</small>
              )}
            </div>
          </CForm>
        </CModalBody>

        <CModalFooter style={{ borderTop: `1px solid ${tokens.border}`, padding: '12px 20px', gap: '8px' }}>
          <button
            onClick={() => {
              setShowModal(false)
              setValidationErrors({})
            }}
            style={{
              padding: '6px 16px', borderRadius: tokens.radiusSm, fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', border: `1px solid ${tokens.border}`,
              backgroundColor: '#fff', color: '#1e293b',
            }}
          >
            Cancel
          </button>
          <ActionBtn onClick={handleSubmitVitals} style={{ padding: '6px 20px' }}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }} /> Saving...</>
            ) : 'Save Vitals'}
          </ActionBtn>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default AppointmentDetails