import React, { useState, useEffect } from 'react'
import {
  CSpinner, CModal, CModalBody, CModalHeader, CModalTitle,
  CTable, CTableBody, CTableDataCell, CTableHead, CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'
import {
  User, CalendarDays, FileText, ClipboardList,
  Stethoscope, CreditCard, RefreshCw, AlertCircle, Activity, MapPin, Eye, Clock, ChevronRight
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import LoadingIndicator from '../../Utils/loader'

const TAB_KEYS = { INFO: 1, APPOINTMENTS: 2, REPORTS: 3, HISTORY: 4, PLAN: 5 }


const PatientManagement = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const patientInfo = location.state?.patientInfo

  const [activeKey, setActiveKey] = useState(1)
  const [selectedPatient] = useState(patientInfo || null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointmentInfo, setAppointmentInfo] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedVisit, setSelectedVisit] = useState(null)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [planData, setPlanData] = useState([])
  const [planLoading, setPlanLoading] = useState(false)
  const [selectedPlanBookingId, setSelectedPlanBookingId] = useState('')

  const getValue = (val) => (val !== undefined && val !== null && val !== '' ? val : '—')

  const openBase64File = (base64Data, fileType, fileName) => {
    if (!base64Data) return
    let blob
    if (fileType === 'application/pdf') {
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
      blob = new Blob([new Uint8Array(byteNumbers)], { type: fileType })
    } else {
      blob = new Blob([Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))], { type: fileType })
    }
    window.open(URL.createObjectURL(blob), '_blank')
  }

  /* ── API calls ── */
  const fetchAppointments = async (patientId) => {
    try {
      setLoading(true)
      const response = await http.get(`${BASE_URL}/bookings/byPatientId/${patientId}`)
      const data = response.data?.data || []
      setAppointments(data)
      console.log(data, "data ")
      if (data.length > 0) {
        const first = data[0]
        setSelectedAppointment(first)
        setAppointmentInfo(first)
        if (first.bookingId) fetchReportByBookingId()
        // Fetch history for the first appointment immediately
        // fetchVisitHistory(first)
      } else {
        setSelectedAppointment(null)
        setAppointmentInfo(null)
        setReport([])
        // setHistory([])
      }
    } catch { setAppointments([]); setReport([]) }
    finally { setLoading(false) }
  }

  // NOTE: dont delete this code fetchVisitHistory

  // const fetchVisitHistory = async (appointment) => { 
  //   const appt = appointment || selectedAppointment
  //   const patientId = appt?.patientId
  //   const bookingId = appt?.bookingId
  //   if (!patientId || !bookingId) return
  //   try {
  //     setHistoryLoading(true)
  //     setHistory([])
  //     setSelectedVisit(null)
  //     const res = await axios.get(
  //       `${wifiUrl}/api/physiotherapy-doctor/visitHistoryByUsingPatientIdAndBooking/${patientId}/${bookingId}`
  //     )
  //     const data = res.data?.data || []
  //     setHistory(data)
  //     // Auto-select the first visit
  //     if (data.length > 0) setSelectedVisit(data[0])
  //   } catch { setHistory([]) }
  //   finally { setHistoryLoading(false) }
  // }

  const fetchReportByBookingId = async () => {
    try {
      setReportLoading(true)
      const response = await http.get(`${BASE_URL}/reports/patientId/${patientInfo?.patientId}`)
      setReport(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch { setReport([]) }
    finally { setReportLoading(false) }
  }

  const fetchPatientPlan = async (bookingId) => {
    if (!bookingId) return;
    try {
      setPlanLoading(true)
      setPlanData([])
      const res = await fetch(`${wifiUrl}/api/physiotherapy-doctor/payment/${bookingId}`)
      const data = await res.json()
      if (data.success && data.data) {
        // The user's JSON structure has direct data array or nested in data.data
        // Based on the provided snippet, it looks like data.data is what we want
        // But if it's already normalized in payment API, it's under therapyWithSessions
        const rawData = data.data.therapyWithSessions || data.data || []

        // Ensure it's a flat list of exercises as expected by the new UI
        const normalized = rawData.flatMap(item => {
          if (item.exerciseId) return [item]; // Flat exercise
          if (item.exercises) return item.exercises; // Therapy level
          if (item.therapyData) return item.therapyData.flatMap(t => t.exercises || []); // Program level
          if (item.programs || item.therapySessions) {
            const containers = item.programs || item.therapySessions;
            return containers.flatMap(c => (c.therapyData || []).flatMap(t => t.exercises || []));
          }
          return [];
        });
        setPlanData(normalized)
      }
    } catch (err) {
      console.error("Plan Fetch Error:", err)
      setPlanData([])
    } finally {
      setPlanLoading(false)
    }
  }

  useEffect(() => {
    if (activeKey === TAB_KEYS.APPOINTMENTS && selectedPatient?.patientId)
      fetchAppointments(selectedPatient.patientId)
  }, [activeKey, selectedPatient])

  // useEffect(() => {
  //   // Refetch history whenever selectedAppointment changes (user picks a different booking)
  //   if (activeKey === TAB_KEYS.HISTORY && selectedAppointment?.bookingId)
  //     fetchVisitHistory(selectedAppointment)
  // }, [activeKey, selectedAppointment])

  useEffect(() => {
    if (activeKey === TAB_KEYS.REPORTS && selectedAppointment?.bookingId)
      fetchReportByBookingId()
  }, [activeKey, selectedAppointment])

  useEffect(() => {
    if (activeKey === TAB_KEYS.PLAN && appointments.length > 0) {
      const firstBookingId = selectedPlanBookingId || appointments[0].bookingId;
      if (!selectedPlanBookingId) setSelectedPlanBookingId(firstBookingId);
      fetchPatientPlan(firstBookingId);
    }
  }, [activeKey, appointments])

  useEffect(() => {
    if (selectedPatient?.patientId) {
      fetchAppointments(selectedPatient.patientId)
    }
  }, [selectedPatient])

  /* ── Shared sub-components ── */
  const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="pm2-info-card">
      <div className="pm2-info-card-header">
        <Icon size={14} className="pm2-header-icon" />
        {title}
      </div>
      <div className="pm2-info-card-body">{children}</div>
    </div>
  )

  const InfoRow = ({ label, value }) => (
    <div className="pm2-info-row">
      <span className="pm2-info-label">{label}</span>
      <span className="pm2-info-value">{getValue(value)}</span>
    </div>
  )

  const TABS = [
    { key: TAB_KEYS.INFO, label: 'Patient Info', icon: User },
    { key: TAB_KEYS.APPOINTMENTS, label: 'Appointments', icon: CalendarDays },
    { key: TAB_KEYS.REPORTS, label: 'Reports', icon: FileText },
    { key: TAB_KEYS.PLAN, label: 'Patient Plan', icon: Activity },
    // { key: TAB_KEYS.HISTORY, label: 'History', icon: ClipboardList },
  ]

  return (
    <div style={{ padding: '16px' }}>

      {/* ── Page Header ── */}
      <div className="pm2-page-header">
        <div className="pm2-title-group">
          <div className="pm2-page-icon"><Stethoscope size={20} /></div>
          <div>
            <h4 className="pm2-page-title">Patient Management</h4>
            <p className="pm2-page-sub">{selectedPatient?.fullName || 'No patient selected'}</p>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="pm2-tab-bar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`pm2-tab-btn${activeKey === key ? ' pm2-tab-active' : ''}`}
            onClick={() => setActiveKey(key)}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="pm2-tab-content">

        {/* ── Tab 1: Patient Info ── */}
        {activeKey === TAB_KEYS.INFO && selectedPatient && (
          <div>
            <div className="pm2-profile-header">
              <div className="pm2-profile-avatar-wrap">
                <User size={32} color="#185fa5" />
              </div>
              <div>
                <h4 className="pm2-profile-name">{selectedPatient.fullName}</h4>
                <p className="pm2-profile-meta">{selectedPatient.mobileNumber}</p>
                <p className="pm2-profile-meta">{selectedPatient.email || 'No email'}</p>
                <span className="pm2-badge">ID: {selectedPatient.patientId}</span>
              </div>
            </div>

            <div className="pm2-info-card" style={{ marginBottom: 12 }}>
              <div className="pm2-info-card-header">
                <User size={14} className="pm2-header-icon" /> Personal Details
              </div>
              <div className="pm2-info-card-body pm2-inner-grid">
                <InfoRow label="Customer ID" value={selectedPatient.customerId} />
                <InfoRow label="Patient ID" value={selectedPatient.patientId} />
                <InfoRow label="Full Name" value={selectedPatient.fullName} />
                <InfoRow label="Gender" value={selectedPatient.gender} />
                <InfoRow label="Age" value={selectedPatient.age + ' Yrs'} />
                <InfoRow label="Date of Birth" value={selectedPatient.dateOfBirth} />
                <InfoRow label="Mobile" value={selectedPatient.mobileNumber} />
                <InfoRow label="Email" value={selectedPatient.email} />
              </div>
            </div>

            <div className="pm2-info-card">
              <div className="pm2-info-card-header">
                <MapPin size={14} className="pm2-header-icon" /> Address
              </div>
              <div className="pm2-info-card-body pm2-inner-grid">
                <InfoRow label="House No" value={selectedPatient.address?.houseNo} />
                <InfoRow label="Street" value={selectedPatient.address?.street} />
                <InfoRow label="Landmark" value={selectedPatient.address?.landmark} />
                <InfoRow label="City" value={selectedPatient.address?.city} />
                <InfoRow label="State" value={selectedPatient.address?.state} />
                <InfoRow label="Postal Code" value={selectedPatient.address?.postalCode} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Appointments ── */}
        {activeKey === TAB_KEYS.APPOINTMENTS && (
          loading ? (
            <div className="pm2-center">
              <LoadingIndicator message={'Appointments Loading...'} />
            </div>
          ) : appointments.length > 0 ? (

            <CTable className=" pink-table">
              <CTableHead >
                <CTableRow>
                  <CTableHeaderCell>Booking ID</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Doctor</CTableHeaderCell>
                  <CTableHeaderCell>Visit Type</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {appointments.map((appt, index) => (
                  <CTableRow key={index}>

                    <CTableDataCell className="pm-bold">
                      {appt.bookingId}
                    </CTableDataCell>

                    <CTableDataCell>
                      {appt.serviceDate}
                    </CTableDataCell>

                    <CTableDataCell>
                      {appt.doctorName}
                    </CTableDataCell>

                    <CTableDataCell>
                      <span className="pm-tag">{appt.visitType}</span>
                    </CTableDataCell>
                    <CTableDataCell>
                      <button
                        className="pm-action-btn view"
                        title="View"
                        onClick={() =>
                          navigate(`/appointment-details/${appt.bookingId}`, {
                            state: { appointment: appt }
                          })
                        }
                      >
                        <Eye size={14} />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

          ) : (
            <div className="pm2-empty">
              No appointments found.
            </div>
          )
        )}

        {/* ── Tab 3: Reports ── */}
        {activeKey === TAB_KEYS.REPORTS && (

          reportLoading ? (
            <div className="pm2-center">
              <LoadingIndicator message={'Reports Loading...'} />
            </div>
          ) : Array.isArray(report) && report.length > 0 ? (() => {

            // ✅ GROUP BY BOOKING ID
            const groupedReports = report.reduce((acc, r) => {
              const key = r.bookingId || "Unknown"
              if (!acc[key]) acc[key] = []
              acc[key].push(r)
              return acc
            }, {})

            return (
              <CAccordion className="pm-accordion" alwaysOpen>

                {Object.entries(groupedReports).map(([bookingId, reportsList], idx) => (

                  <CAccordionItem itemKey={idx} key={bookingId}>

                    {/* 🔽 HEADER (Booking ID) */}
                    <CAccordionHeader>
                      Booking ID: {bookingId} ({reportsList.length} Reports)
                    </CAccordionHeader>

                    {/* 🔽 BODY (Reports under that booking) */}
                    <CAccordionBody>

                      {reportsList.map((r, index) => (

                        <div key={index} className="pm2-info-card" style={{ marginBottom: 12 }}>

                          <div className="pm2-info-card-header" style={{ justifyContent: 'space-between' }}>
                            <div className="pm2-header-icon">
                              <FileText size={14} />
                              {" "}Reports ({getValue(r.reportName)})
                            </div>

                            <span
                              className="pm2-status-pill"
                              style={{
                                background:
                                  r.reportStatus === 'Normal' ? '#3b6d11' :
                                    r.reportStatus === 'Abnormal' ? '#a32d2d' : '#5f5e5a',
                              }}
                            >
                              {getValue(r.reportStatus)}
                            </span>
                          </div>

                          <div className="pm2-info-card-body">

                            <div className="pm2-inner-grid" style={{ marginBottom: 12 }}>
                              <InfoRow label="Date" value={r.reportDate} />
                              <InfoRow label="Type" value={r.reportType} />
                              <InfoRow label="Booking ID" value={r.bookingId} />
                            </div>

                            {/* FILES */}
                            <div style={{ borderTop: '0.5px solid #d0dce9', paddingTop: 10 }}>
                              <span className="pm2-info-label">Report File</span>

                              {Array.isArray(r.reportFile) && r.reportFile.length > 0 ? (
                                r.reportFile.map((file, i) => {

                                  const fileType =
                                    (file.startsWith('/9j/') || file.startsWith('iVBOR'))
                                      ? 'image/png'
                                      : 'application/pdf'

                                  return (
                                    <button
                                      key={i}
                                      className="pm2-file-btn"
                                      onClick={() =>
                                        openBase64File(
                                          file,
                                          fileType,
                                          `${r.reportName || 'report'}${fileType === 'application/pdf' ? '.pdf' : '.png'}`
                                        )
                                      }
                                    >
                                      <FileText size={12} /> View File {i + 1}
                                    </button>
                                  )
                                })
                              ) : (
                                <span className="pm2-info-value">N/A</span>
                              )}

                            </div>

                          </div>
                        </div>

                      ))}

                    </CAccordionBody>

                  </CAccordionItem>

                ))}

              </CAccordion>
            )

          })() : (

            <div className="pm2-empty">
              <FileText size={36} className="pm2-empty-icon" />
              <p>No reports available.</p>
            </div>

          )
        )}

        {/* ── Tab 4: History Dont Delete── */}
        {/* {activeKey === TAB_KEYS.HISTORY && (
          <div>

            
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>

             
              {appointments.length > 0 && (
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label className="pm2-select-label">Booking ID</label>
                  <select
                    className="pm2-select"
                    style={{ width: '100%', maxWidth: '100%' }}
                    value={selectedAppointment?.bookingId || ''}
                    onChange={(e) => {
                      const appt = appointments.find(a => a.bookingId === e.target.value)
                      if (appt) {
                        setSelectedAppointment(appt)
                        fetchVisitHistory(appt)
                      }
                    }}
                  >
                    {appointments.map((appt, i) => (
                      <option key={i} value={appt.bookingId}>
                        {appt.bookingId} — {appt.serviceDate || appt.visitDate || 'No date'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

             
              {!historyLoading && history.length > 0 && (
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label className="pm2-select-label">Select Visit</label>
                  <select
                    className="pm2-select"
                    style={{ width: '100%', maxWidth: '100%' }}
                    value={selectedVisit?.visitNumber || ''}
                    onChange={(e) => {
                      const visit = history.find(v => v.visitNumber === e.target.value)
                      if (visit) setSelectedVisit(visit)
                    }}
                  >
                    {history.map((v, i) => (
                      <option key={i} value={v.visitNumber}>
                        {v.visitNumber} — {v.visitDate || 'No date'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            
            {historyLoading ? (
              <div className="pm2-center"> <LoadingIndicator message={'History Loading...'} /></div>
            ) : selectedVisit ? (() => {
              const item = selectedVisit
              const doc = item.physiotherapyDoctorData || {}
              const complaints = doc.complaints || {}
              const pi = doc.patientInfo || {}
              const assessment = doc.assessment || {}
              const subj = assessment.subjectiveAssessment || {}
              const functional = assessment.functionalAssessment || {}
              const physical = assessment.physicalExamination || {}
              const diagnosis = doc.diagnosis || {}
              const investigation = doc.investigation || {}
              const treatmentPlan = doc.treatmentPlan || {}
              const therapySessions = doc.therapySessions || []
              const exercisePlan = doc.exercisePlan || {}
              const followUp = doc.followUp || {}
              const prescriptionPdf = doc.prescriptionPdf || item.prescriptionPdf || null

              return (
                <div className="pm-accordion-wrapper">

                  <CAccordion className="pm-accordion" activeItemKey={1} alwaysOpen>

           
                    <CAccordionItem itemKey={1}>
                      <CAccordionHeader>Visit & Patient Info</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-3">
                          <InfoRow label="Visit No." value={item.visitNumber} />
                          <InfoRow label="Visit Date" value={item.visitDate} />
                          <InfoRow label="Visit Time" value={item.visitTime} />
                          <InfoRow label="Patient Name" value={pi.patientName} />
                          <InfoRow label="Age" value={pi.age} />
                          <InfoRow label="Gender" value={pi.sex} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

                 
                    <CAccordionItem itemKey={2}>
                      <CAccordionHeader>Complaints</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-3">
                          <InfoRow label="Details" value={complaints.complaintDetails} />
                          <InfoRow label="Pain" value={complaints.patientPain} />
                          <InfoRow label="Duration" value={complaints.duration} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

              
                    <CAccordionItem itemKey={3}>
                      <CAccordionHeader>Assessment</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-3">
                          <InfoRow label="Chief Complaint" value={subj.chiefComplaint} />
                          <InfoRow label="Pain Scale" value={subj.painScale} />
                          <InfoRow label="Pain Type" value={subj.painType} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

                   
                    <CAccordionItem itemKey={4}>
                      <CAccordionHeader>Diagnosis</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-3">
                          <InfoRow label="Diagnosis" value={diagnosis.physioDiagnosis} />
                          <InfoRow label="Area" value={diagnosis.affectedArea} />
                          <InfoRow label="Severity" value={diagnosis.severity} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

                   
                    <CAccordionItem itemKey={5}>
                      <CAccordionHeader>Investigation</CAccordionHeader>
                      <CAccordionBody>
                        <InfoRow label="Reason" value={investigation.reason} />
                        {investigation.tests?.length > 0 && (
                          <div className="pm-tag-wrap">
                            {investigation.tests.map((t, i) => (
                              <span key={i} className="pm-tag">{t}</span>
                            ))}
                          </div>
                        )}
                      </CAccordionBody>
                    </CAccordionItem>

                   
                    <CAccordionItem itemKey={6}>
                      <CAccordionHeader>Treatment Plan</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-3">
                          <InfoRow label="Doctor" value={treatmentPlan.doctorName} />
                          <InfoRow label="Therapist" value={treatmentPlan.therapistName} />
                          <InfoRow label="Response" value={treatmentPlan.patientResponse} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

           
                    {therapySessions.length > 0 && (
                      <CAccordionItem itemKey={7}>
                        <CAccordionHeader>
                          Therapy Sessions ({therapySessions.length})
                        </CAccordionHeader>
                        <CAccordionBody>

                          {therapySessions.map((session, i) => (
                            <div key={i} className="pm-session-card">

                              <div className="pm-session-header">
                                <span>{session.therapyName}</span>
                                <span className="pm-price">
                                  ₹ {session.totalTherapyCost || 0}
                                </span>
                              </div>

                            </div>
                          ))}

                        </CAccordionBody>
                      </CAccordionItem>
                    )}

                    
                    <CAccordionItem itemKey={8}>
                      <CAccordionHeader>Follow Up</CAccordionHeader>
                      <CAccordionBody>
                        <div className="pm-grid-2">
                          <InfoRow label="Next Visit" value={followUp.nextVisitDate} />
                          <InfoRow label="Notes" value={followUp.reviewNotes} />
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>

                  </CAccordion>

                </div>
              )
            })() : (
              <div className="pm2-empty">
                <ClipboardList size={36} className="pm2-empty-icon" />
                <p>No visit history available.</p>
              </div>
            )}
          </div>
        )} */}

        {/* ── Tab 5: Patient Plan ── */}
        {activeKey === TAB_KEYS.PLAN && (
          <div>
            {/* Booking Selector */}
            <div style={{ marginBottom: 20 }}>
              <label className="pm2-select-label">Select Booking ID</label>
              <div style={{ position: 'relative', maxWidth: 360 }}>
                <select
                  className="pm2-select"
                  value={selectedPlanBookingId}
                  onChange={(e) => {
                    setSelectedPlanBookingId(e.target.value);
                    fetchPatientPlan(e.target.value);
                  }}
                  style={{ paddingRight: '30px' }}
                >
                  {appointments.length === 0 ? (
                    <option value="">No bookings available</option>
                  ) : (
                    <>
                      <option value="" disabled>Select Booking ID</option>
                      {appointments.map((appt, i) => (
                        <option key={i} value={appt.bookingId}>
                          {appt.bookingId} — {appt.serviceDate} — {appt.doctorName}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <ChevronRight
                  size={14}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%) rotate(90deg)',
                    pointerEvents: 'none', color: '#6b7280'
                  }}
                />
              </div>
            </div>

            {/* Plan Summary */}
            {!planLoading && planData.length > 0 && (
              <div style={{
                display: 'flex', gap: 15, marginBottom: 20,
                background: '#f8fafc', padding: '15px', borderRadius: '10px',
                border: '1px solid #e2e8f0', maxWidth: 360
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Sessions</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#185fa5' }}>
                    {planData.reduce((sum, ex) => sum + (ex.totalSessionCount || ex.sessions?.length || 0), 0)}
                  </div>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>
                    {planData.reduce((sum, ex) => sum + (ex.totalSessionCompleted || ex.sessions?.filter(s => s.status === 'Completed').length || 0), 0)}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Content */}
            {planLoading ? (
              <div className="pm2-center">
                <LoadingIndicator message="Fetching Patient Plan..." />
              </div>
            ) : planData.length > 0 ? (
              <div className="pm-accordion-wrapper" style={{ padding: 0 }}>
                <CAccordion className="pm-accordion" alwaysOpen>
                  {planData.map((exercise, idx) => (
                    <CAccordionItem itemKey={idx} key={idx}>
                      <CAccordionHeader>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: 20, alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{exercise.exerciseName}</span>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <span className="pm-tag" style={{ background: '#e6f1fb', color: '#185fa5' }}>
                              Total: {exercise.totalSessionCount || (exercise.sessions?.length || 0)}
                            </span>
                            <span className="pm-tag" style={{ background: '#eaf3de', color: '#3b6d11' }}>
                              Completed: {exercise.totalSessionCompleted || (exercise.sessions?.filter(s => s.status === 'Completed').length || 0)}
                            </span>
                          </div>
                        </div>
                      </CAccordionHeader>
                      <CAccordionBody style={{ padding: '0 1px' }}>
                        <CTable align="middle" className="mb-0 pm2-table" hover>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell className="pm2-th">Session No</CTableHeaderCell>
                              <CTableHeaderCell className="pm2-th">Date</CTableHeaderCell>
                              <CTableHeaderCell className="pm2-th">Payment</CTableHeaderCell>
                              <CTableHeaderCell className="pm2-th">Status</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {(exercise.sessions || []).map((session, sIdx) => (
                              <CTableRow key={sIdx} className="pm2-tr">
                                <CTableDataCell className="pm2-td" style={{ fontWeight: 600 }}>
                                  #{session.sessionNo || (sIdx + 1)}
                                </CTableDataCell>
                                <CTableDataCell className="pm2-td">
                                  {session.date || "—"}
                                </CTableDataCell>
                                <CTableDataCell className="pm2-td">
                                  <span
                                    className="badge"
                                    style={{
                                      background: session.paymentStatus?.toLowerCase() === 'paid' ? '#eaf3de' : '#fcebeb',
                                      color: session.paymentStatus?.toLowerCase() === 'paid' ? '#3b6d11' : '#a32d2d',
                                      fontSize: '10px'
                                    }}
                                  >
                                    {session.paymentStatus || 'Unpaid'}
                                  </span>
                                </CTableDataCell>
                                <CTableDataCell className="pm2-td">
                                  <span
                                    className="badge"
                                    style={{
                                      background: session.status?.toLowerCase() === 'completed' ? '#e6f1fb' : '#fff3cd',
                                      color: session.status?.toLowerCase() === 'completed' ? '#185fa5' : '#856404',
                                      fontSize: '10px'
                                    }}
                                  >
                                    {session.status || 'Pending'}
                                  </span>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              </div>
            ) : (
              <div className="pm2-empty">
                <Activity size={36} className="pm2-empty-icon" />
                <p>No exercise plan found for this booking.</p>
              </div>
            )}
          </div>
        )}

      </div>


      {/* ── STYLES ── */}
      <style>{`
          /* Page header */
          .pm2-page-header {
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 12px; margin-bottom: 16px;
            padding-bottom: 14px; border-bottom: 0.5px solid #d0dce9;
          }
          .pm2-title-group { display: flex; align-items: center; gap: 12px; }
          .pm2-page-icon {
            width: 42px; height: 42px; border-radius: 10px;
            background: #e6f1fb; display: flex; align-items: center;
            justify-content: center; color: #185fa5; flex-shrink: 0;
          }
          .pm2-page-title { font-size: 17px; font-weight: 600; color: #0c447c; margin: 0; }
          .pm2-page-sub   { font-size: 12px; color: #6b7280; margin: 0; }

          /* Tab bar */
          .pm2-tab-bar {
            display: flex; gap: 4px; border-bottom: 0.5px solid #d0dce9;
            margin-bottom: 18px; overflow-x: auto;
          }
          .pm2-tab-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 9px 16px; font-size: 12px; font-weight: 600;
            color: #6b7280; background: transparent; border: none;
            border-bottom: 2px solid transparent; cursor: pointer;
            transition: color 0.15s, border-color 0.15s; white-space: nowrap;
          }
          .pm2-tab-btn:hover { color: #185fa5; }
          .pm2-tab-active { color: #185fa5 !important; border-bottom-color: #185fa5 !important; }

          /* Profile header */
          .pm2-profile-header {
            display: flex; align-items: center; gap: 16px;
            padding: 16px; background: #f0f5fb; border-radius: 10px; margin-bottom: 16px;
          }
          .pm2-profile-avatar-wrap {
            width: 64px; height: 64px; border-radius: 50%;
            background: #e6f1fb; border: 2px solid #b5d4f4;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .pm2-profile-name { font-size: 16px; font-weight: 700; color: #0c447c; margin: 0 0 4px; }
          .pm2-profile-meta { font-size: 12px; color: #6b7280; margin: 0 0 2px; }
          .pm2-badge {
            display: inline-block; background: #185fa5; color: #fff;
            font-size: 11px; font-weight: 600; padding: 2px 10px;
            border-radius: 20px; margin-top: 4px;
          }

          /* Info cards — same as FrontDeskForm */
          .pm2-info-card { border: 0.5px solid #d0dce9; border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
          .pm2-info-card-header {
            display: flex; align-items: center; gap: 8px;
            background: #185fa5; color: #fff;
            font-size: 12px; font-weight: 600; padding: 9px 14px;
          }
          .pm2-header-icon { color: white; }
          .pm2-info-card-body { padding: 12px 14px; background: #fff; }

          /* Grid layouts */
          .pm2-grid-2      { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .pm2-inner-grid  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 24px; }
          .pm2-inner-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 16px; }

          /* Info rows */
          .pm2-info-row { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
          .pm2-info-row:last-child { margin-bottom: 0; }
          .pm2-info-label {
            font-size: 11px; font-weight: 700; color: #185fa5;
            text-transform: none; letter-spacing: 0; white-space: nowrap;
          }
          .pm2-info-value { font-size: 13px; color: #374151; font-weight: 500; }

          /* Status pill */
          .pm2-status-pill {
            font-size: 11px; font-weight: 600; color: #fff;
            padding: 3px 10px; border-radius: 20px;
          }

          /* Appointment selector */
          .pm2-select-label { font-size: 11px; font-weight: 700; color: #374151; display: block; margin-bottom: 4px; }
          .pm2-select {
            width: 100%; max-width: 360px; padding: 7px 10px;
            font-size: 12.5px; color: #374151; background: #fff;
            border: 0.5px solid #d0dce9; border-radius: 7px; outline: none;
            appearance: none; -webkit-appearance: none;
          }
          .pm2-select:focus { border-color: #185fa5; box-shadow: 0 0 0 2.5px rgba(24,95,165,0.12); }

          /* File button */
          .pm2-file-btn {
            display: inline-flex; align-items: center; gap: 5px;
            background: #e6f1fb; color: #185fa5;
            border: 0.5px solid #b5d4f4; border-radius: 6px;
            padding: 4px 12px; font-size: 12px; font-weight: 600;
            cursor: pointer; margin-right: 6px; margin-bottom: 4px; transition: background 0.15s;
          }
          .pm2-file-btn:hover { background: #d0e6f7; }
          .pm2-table-wrapper {
    width: 100%;
    overflow-x: auto;
    background: #ffffff;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
    .rp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
    .rp-table thead {
    background-color: var(--color-bgcolor);
  }
    .pm-tag {
  background: #e6f1fb;
  color: #185fa5;
  border: 0.5px solid #b5d4f4;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
}
  /* Accordion Container */
.pm-accordion .accordion-item {
  border: 1px solid #b5d4f4;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
  background: #fff;
}
.pm-accordion-wrapper {
  padding: 10px;
}

/* Accordion */
.pm-accordion .accordion-item {
  border: none;
  margin-bottom: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

          /* Header */
          .pm-accordion .accordion-button {
            background: #fff;
            color: #185fa5;
            font-size: 13px;
            font-weight: 600;
            padding: 12px 16px;
            border-bottom: 1px solid #b5d4f4;
          }

          /* Arrow */
          .pm-accordion .accordion-button::after {
            filter: none;
          }

          /* Body */
          .pm-accordion .accordion-body {
            background: #fff;
            padding: 16px;
          }

          /* Grid */
          .pm-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .pm-grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          /* Tags */
          .pm-tag-wrap {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          }

          .pm-tag {
            background: #e6f1fb;
            color: #185fa5;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
          }

          /* Session Card */
          .pm-session-card {
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 10px;
          }

          .pm-session-header {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
          }

          .pm-price {
            color: #185fa5;
          }

          /* Mobile */
          @media (max-width: 768px) {
            .pm-grid-3,
            .pm-grid-2 {
              grid-template-columns: 1fr;
            }
          }
          /* TABLE */
          .pm-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
 
          }
          .pm-action-btn {
            width: 30px;
            height: 30px;
            border-radius: 7px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          /* View (Blue) */
          .pm-action-btn.view {
            background: #e6f1fb;
            color: #185fa5;
          }

          /* Hover */
          .pm-action-btn:hover {
            transform: scale(1.08);
            filter: brightness(0.95);
          }

          /* HEADER */
          .pm-thead th {
            font-size: 12px;
            font-weight: 500;           /* reduce bold */
            padding: 6px 10px;          /* compact */
            background: var(--color-bgcolor);
            color: #fff;
            text-transform: none;       /* IMPORTANT */
            letter-spacing: normal;
          }

          /* ROW */
          .pm-table tr {
            height: 32px;               /* reduce row height */
          }

          /* CELL */
          .pm-table td {
            padding: 6px 10px;
            font-size: 13px;
            font-weight: 400;
            color: #374151;
          }

          /* BOOKING ID */
          .pm-bold {
            font-weight: 600;
            color: var(--color-bgcolor);
          }

          /* TAG */
          .pm-tag {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(0,0,0,0.05);
          }

          /* BUTTON */
          .pm-action-btn {
            padding: 3px 8px;
            font-size: 12px;
            border-radius: 5px;
          }

            .rp-table th {
              text-align: left;
              padding: 12px 14px;
              font-weight: 600;
              color: #ffffff;
              font-size: 13px;
              letter-spacing: 0.5px;
            }
              .rp-table tbody tr {
              border-bottom: 1px solid #eee;
              transition: all 0.2s ease-in-out;
            }

            .rp-table tbody tr:hover {
              background-color: #f9f9f9;
            }
              .rp-table td {
              padding: 12px 14px;
              color: #333;
              font-weight: 500;
            }
              .pm2-view-btn {
              padding: 6px 10px;
              border: none;
              border-radius: 6px;
              font-size: 13px;
              cursor: pointer;
              font-weight: 500;
              background-color: #185fa5;
              color: #fff;
              transition: all 0.2s ease-in-out;
            }

            .pm2-view-btn:hover {
              opacity: 0.9;
              transform: scale(1.05);
            }
              .rp-table td b {
              color: var(--color-bgcolor);
            }
              .pm2-center {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 200px;
            }
              .pm2-empty {
              text-align: center;
              padding: 40px 0;
              color: #777;
              font-size: 14px;
            }
              .rp-table tbody tr:nth-child(even) {
              background-color: #fafafa;
            }

                    /* View details button */
                    .pm2-view-detail-btn {
                      display: inline-flex; align-items: center; gap: 5px;
                      background: #185fa5; color: #fff; border: none;
                      padding: 6px 14px; border-radius: 7px;
                      font-size: 12px; font-weight: 600;
                      cursor: pointer; transition: filter 0.15s;
                    }
                    .pm2-view-detail-btn:hover { filter: brightness(0.9); }

                    /* Mini section title inside card body */
                    .pm2-mini-section-title {
                      display: flex; align-items: center; gap: 6px;
                      font-size: 11px; font-weight: 700; color: #185fa5;
                      margin-bottom: 10px;
                    }

                    /* Table */
                    .pm2-table-wrapper {
                      border: 1px solid #b5d4f4; border-radius: 10px;
                      overflow: hidden; overflow-x: auto; margin-bottom: 12px;
                    }
          .pm2-table { margin-bottom: 0 !important; font-size: 13px; border-collapse: separate; border-spacing: 0; }
          .pm2-th {
            background: #185fa5 !important; color: #fff !important;
            font-size: 12px !important; font-weight: 600 !important;
            padding: 10px 14px !important; white-space: nowrap; border-bottom: 0.5px solid #d0dce9 !important;
          }
          .pm2-tr:hover { background: #f0f5fb !important; }
          .pm2-td {
            padding: 10px 14px !important; vertical-align: middle !important;
            font-size: 13px; color: #374151;
            border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
            border-right: 0.5px solid #eef2f7 !important;
          }
          .pm2-td:last-child { border-right: none !important; }
          .pm2-muted { color: #6b7280; }
          .pm2-bold  { font-weight: 600; color: #0c447c; }

          /* Tag chip */
          .pm2-tag {
            display: inline-block; background: #e6f1fb; color: #0c447c;
            border: 0.5px solid #b5d4f4; border-radius: 20px;
            padding: 3px 10px; font-size: 12px; font-weight: 500;
          }

          /* Modal sections */
          .pm2-modal-section {
            border: 0.5px solid #d0dce9; border-radius: 10px;
            overflow: hidden; margin-bottom: 12px;
          }
          .pm2-modal-section-title {
            display: flex; align-items: center; gap: 8px;
            background: #185fa5; color: #fff;
            font-size: 12px; font-weight: 600; padding: 9px 14px;
          }
          .pm2-modal-grid {
            display: grid; grid-template-columns: repeat(2, 1fr);
            gap: 10px; padding: 12px 14px; background: #fff;
          }
          .pm2-muted-text { font-size: 13px; color: #9ca3af; padding: 8px 14px; }

          /* Empty / center */
          .pm2-empty {
            display: flex; flex-direction: column; align-items: center;
            gap: 10px; padding: 48px 0; color: #9ca3af; font-size: 14px;
          }
          .pm2-empty-icon { color: #d0dce9; }
          .pm2-center { display: flex; align-items: center; justify-content: center; min-height: 180px; }

          /* Scrollbar */
          .modal-body::-webkit-scrollbar { width: 5px; }
          .modal-body::-webkit-scrollbar-track { background: #f0f5fb; }
          .modal-body::-webkit-scrollbar-thumb { background: #b5d4f4; border-radius: 10px; }

          @media (max-width: 640px) {
            .pm2-grid-2, .pm2-inner-grid, .pm2-inner-grid-3, .pm2-modal-grid { grid-template-columns: 1fr; }
            .pm2-tab-btn { padding: 8px 10px; font-size: 11px; }
          }


          /* Card Container */
  .pm2-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  .pm2-card-header {
    padding: 14px 18px;
    border-bottom: 1px solid #eee;
    font-weight: 600;
  }

  /* Table */
  .pm2-table-wrapper {
    overflow-x: auto;
  }

  .pm2-table {
    width: 100%;
    border-collapse: collapse;
  }

  /* Header */
  .pm2-table thead {
    background: #f8fafc;
  }

  .pm2-table th {
    padding: 12px;
    font-size: 13px;
    text-transform: uppercase;
    color: #6c757d;
    border-bottom: 1px solid #eee;
  }

  /* Body */
  .pm2-table td {
    padding: 12px;
    font-size: 14px;
    border-bottom: 1px solid #f1f1f1;
  }

  /* Zebra Rows */
  .pm2-table tbody tr:nth-child(even) {
    background: #fcfcfc;
  }

  /* Hover Effect */
  .pm2-table tbody tr:hover {
    background: #f1f7ff;
    transition: 0.2s;
  }

  /* Badges */
  .badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .badge-info {
    background: #e7f1ff;
    color: #0d6efd;
  }

  .badge-success {
    background: #e6f9f0;
    color: #198754;
  }

  .badge-warning {
    background: #fff3cd;
    color: #856404;
  }

  .badge-danger {
    background: #fdecea;
    color: #dc3545;
  }

  /* Button */
  .pm2-btn-view {
    background: #0d6efd;
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }

  .pm2-btn-view:hover {
    background: #0b5ed7;
  }
        `}</style>
    </div>
  )
}

export default PatientManagement