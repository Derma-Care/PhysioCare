import React, { useState, useEffect } from 'react'
import {
  CSpinner, CModal, CModalBody, CModalHeader, CModalTitle,
  CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'
import {
  User, CalendarDays, FileText, ClipboardList,
  Stethoscope, CreditCard, RefreshCw, AlertCircle, Activity, MapPin, Eye, Clock,
} from 'lucide-react'

const TAB_KEYS = { INFO: 1, APPOINTMENTS: 2, REPORTS: 3, HISTORY: 4 }

const PatientManagement = () => {
  const location = useLocation()
  const patientInfo = location.state?.patientInfo

  const [activeKey, setActiveKey] = useState(1)
  const [selectedPatient] = useState(patientInfo || null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [appointmentInfo, setAppointmentInfo] = useState(null)
  const [history, setHistory] = useState([])
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState(null)

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
      if (data.length > 0) {
        const first = data[0]
        setSelectedAppointment(first)
        setAppointmentInfo(first)
        const bookingId = first.bookingId || first.bookingID || first.id
        if (bookingId) fetchReportByBookingId()
      } else {
        setSelectedAppointment(null)
        setAppointmentInfo(null)
        setReport([])
      }
    } catch { setAppointments([]); setReport([]) }
    finally { setLoading(false) }
  }

  const fetchVisitHistory = async () => {
    const patientId = selectedAppointment?.patientId
    const bookingId = selectedAppointment?.bookingId
    if (!patientId || !bookingId) return
    try {
      const res = await axios.get(
        `${wifiUrl}/api/physiotherapy-doctor/visitHistoryByUsingPatientIdAndBooking/${patientId}/${bookingId}`
      )
      setHistory(res.data?.data || [])
    } catch { setHistory([]) }
  }

  const fetchReportByBookingId = async () => {
    try {
      setReportLoading(true)
      const response = await http.get(`${BASE_URL}/reports/patientId/${patientInfo?.patientId}`)
      setReport(Array.isArray(response.data?.data) ? response.data.data : [])
    } catch { setReport([]) }
    finally { setReportLoading(false) }
  }

  useEffect(() => {
    if (activeKey === TAB_KEYS.APPOINTMENTS && selectedPatient?.patientId)
      fetchAppointments(selectedPatient.patientId)
  }, [activeKey, selectedPatient])

  useEffect(() => {
    if (activeKey === TAB_KEYS.HISTORY && selectedPatient?.patientId)
      fetchVisitHistory()
  }, [activeKey, selectedPatient])

  useEffect(() => {
    if (activeKey === TAB_KEYS.REPORTS && selectedAppointment?.bookingId)
      fetchReportByBookingId()
  }, [activeKey, selectedAppointment])

  useEffect(() => {
    if (selectedPatient?.patientId) {
      fetchAppointments(selectedPatient.patientId)
      fetchVisitHistory()
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
    { key: TAB_KEYS.HISTORY, label: 'History', icon: ClipboardList },
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
                <InfoRow label="Age" value={selectedPatient.age} />
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
            <div className="pm2-center"><CSpinner color="primary" /></div>
          ) : selectedAppointment ? (
            <div>
              {appointments.length > 1 && (
                <div style={{ marginBottom: 14 }}>
                  <label className="pm2-select-label">Select Appointment</label>
                  <select
                    className="pm2-select"
                    value={selectedAppointment.bookingId}
                    onChange={(e) => {
                      const found = appointments.find((a) => a.bookingId === e.target.value)
                      if (found) setSelectedAppointment(found)
                    }}
                  >
                    {appointments.map((a, i) => (
                      <option key={i} value={a.bookingId}>
                        {a.bookingId} — {a.serviceDate}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="pm2-grid-2">
                <InfoCard icon={CalendarDays} title="Booking Info">
                  <InfoRow label="Booking ID" value={selectedAppointment.bookingId} />
                  <InfoRow label="Date" value={selectedAppointment.serviceDate} />
                  <InfoRow label="Time" value={selectedAppointment.servicetime} />
                  <InfoRow label="Doctor" value={selectedAppointment.doctorName} />
                  <InfoRow label="Visit Type" value={selectedAppointment.visitType} />
                </InfoCard>

                <InfoCard icon={Activity} title="Medical Info">
                  <InfoRow label="Problem" value={selectedAppointment.problem} />
                  <InfoRow label="Symptoms Duration" value={selectedAppointment.symptomsDuration} />
                  <InfoRow label="Consultation Type" value={selectedAppointment.consultationType} />
                </InfoCard>

                <InfoCard icon={CreditCard} title="Payment Info">
                  <InfoRow label="Consultation Fee" value={selectedAppointment.consultationFee ? `₹${selectedAppointment.consultationFee}` : null} />
                  <InfoRow label="Total Fee" value={selectedAppointment.totalFee ? `₹${selectedAppointment.totalFee}` : null} />
                  <InfoRow label="Payment Type" value={selectedAppointment.paymentType} />
                </InfoCard>

                <InfoCard icon={RefreshCw} title="Follow-Up">
                  <InfoRow label="Free Follow-Ups Left" value={selectedAppointment.freeFollowUpsLeft} />
                  <InfoRow label="Follow-Up Status" value={selectedAppointment.followupStatus} />
                  <InfoRow label="Consultation Expiry" value={selectedAppointment.consultationExpiration} />
                </InfoCard>

                <InfoCard icon={Stethoscope} title="Additional Info">
                  <InfoRow label="Clinic" value={selectedAppointment.clinicName} />
                  <InfoRow label="Branch" value={selectedAppointment.branchname} />
                  <InfoRow label="Booking For" value={selectedAppointment.bookingFor} />
                </InfoCard>
              </div>
            </div>
          ) : (
            <div className="pm2-empty">
              <CalendarDays size={36} className="pm2-empty-icon" />
              <p>No appointments found.</p>
            </div>
          )
        )}

        {/* ── Tab 3: Reports ── */}
        {activeKey === TAB_KEYS.REPORTS && (
          reportLoading ? (
            <div className="pm2-center"><CSpinner color="primary" /></div>
          ) : Array.isArray(report) && report.length > 0 ? (
            report.map((r, index) => (
              <div key={index} className="pm2-info-card" style={{ marginBottom: 12 }}>
                <div className="pm2-info-card-header" style={{ justifyContent: 'space-between' }}>
                  <div className="pm2-info-card-header">
                    <FileText size={14} className="pm2-header-icon" />Reports ({getValue(r.reportName)})

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
                  <div style={{ borderTop: '0.5px solid #d0dce9', paddingTop: 10 }}>
                    <span className="pm2-info-label" style={{ display: 'block', marginBottom: 6 }}>Report File</span>
                    {Array.isArray(r.reportFile) && r.reportFile.length > 0 ? (
                      r.reportFile.map((file, i) => {
                        const fileType = (file.startsWith('/9j/') || file.startsWith('iVBOR')) ? 'image/png' : 'application/pdf'
                        return (
                          <button
                            key={i}
                            className="pm2-file-btn"
                            onClick={() => openBase64File(file, fileType, `${r.reportName || 'report'}${fileType === 'application/pdf' ? '.pdf' : '.png'}`)}
                          >
                            <FileText size={12} /> View File {i + 1}
                          </button>
                        )
                      })
                    ) : <span className="pm2-info-value">N/A</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pm2-empty">
              <FileText size={36} className="pm2-empty-icon" />
              <p>No reports available.</p>
            </div>
          )
        )}

        {/* ── Tab 4: History ── */}
        {activeKey === TAB_KEYS.HISTORY && (
          loading ? (
            <div className="pm2-center"><CSpinner color="primary" /></div>
          ) : Array.isArray(history) && history.length > 0 ? (
            history.map((item, index) => {
              const doc = item.physiotherapyDoctorData || {}
              const complaints = doc.complaints || {}
              return (
                <div key={index} className="pm2-info-card" style={{ marginBottom: 12 }}>
                  <div className="pm2-info-card-header" style={{ justifyContent: 'space-between' }}>
                    <div className="pm2-info-card-header">
                      <ClipboardList size={14} className="pm2-header-icon" />History ({getValue(item.visitNumber)})

                    </div>
                    <span
                      className="pm2-status-pill"
                      style={{
                        background:
                          doc.overallStatus === 'Completed' ? '#3b6d11' :
                            doc.overallStatus === 'Pending' ? '#854f0b' : '#5f5e5a',
                      }}
                    >
                      {getValue(doc.overallStatus)}
                    </span>
                  </div>
                  <div className="pm2-info-card-body">
                    {/* Visit summary row */}
                    <div className="pm2-inner-grid" style={{ marginBottom: 12 }}>
                      <InfoRow label="Date" value={item.visitDate} />
                      <InfoRow label="Time" value={item.visitTime} />
                      <InfoRow label="Booking ID" value={doc.bookingId} />
                      <InfoRow label="Record ID" value={doc.therapistRecordId} />
                    </div>

                    {/* Complaints section */}
                    <div style={{ borderTop: '0.5px solid #d0dce9', paddingTop: 10, marginBottom: 10 }}>
                      <div className="pm2-mini-section-title">
                        <AlertCircle size={12} style={{ color: '#b5d4f4' }} /> Complaints
                      </div>
                      <div className="pm2-inner-grid-3">
                        <InfoRow label="Complaint" value={complaints.complaintDetails} />
                        <InfoRow label="Duration" value={complaints.duration} />
                        <InfoRow label="Pain Type" value={complaints.painType} />
                        <InfoRow label="Pain Intensity" value={complaints.painIntensity} />
                        <InfoRow label="Aggravating" value={complaints.aggravatingFactors} />
                        <InfoRow label="Relieving" value={complaints.relievingFactors} />
                        <InfoRow label="Medical History" value={complaints.medicalHistory} />
                        <InfoRow label="Surgical History" value={complaints.surgicalHistory} />
                        <InfoRow label="Medications" value={complaints.medications} />
                        <InfoRow label="Allergies" value={complaints.allergies} />
                        <InfoRow label="Previous Treatment" value={complaints.previousTreatment} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="pm2-view-detail-btn"
                        onClick={() => { setSelectedHistory(item); setViewModal(true) }}
                      >
                        <Eye size={13} /> View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="pm2-empty">
              <ClipboardList size={36} className="pm2-empty-icon" />
              <p>No visit history available.</p>
            </div>
          )
        )}
      </div>

      {/* ── Visit Detail Modal ── */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg">
        <CModalHeader style={{ borderBottom: '0.5px solid #d0dce9', padding: '16px 20px' }}>
          <CModalTitle style={{ fontSize: 15, fontWeight: 600, color: '#0c447c', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} className="pm2-header-icon" /> Visit Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ padding: 20, maxHeight: '80vh', overflowY: 'auto' }}>
          {selectedHistory && (() => {
            const doc = selectedHistory.physiotherapyDoctorData || {}
            return (
              <div>
                {/* Basic Info */}
                <div className="pm2-modal-section">
                  <div className="pm2-modal-section-title"><User size={13} /> Basic Info</div>
                  <div className="pm2-modal-grid">
                    <InfoRow label="Date" value={selectedHistory.visitDate} />
                    <InfoRow label="Doctor" value={doc.doctorName} />
                    <InfoRow label="Clinic" value={selectedHistory.clinicName} />
                    <InfoRow label="Booking ID" value={doc.bookingId} />
                  </div>
                </div>

                {/* Symptoms */}
                {selectedHistory.symptoms && (
                  <div className="pm2-modal-section">
                    <div className="pm2-modal-section-title"><Activity size={13} /> Symptoms</div>
                    <div className="pm2-modal-grid">
                      <InfoRow label="Details" value={selectedHistory.symptoms?.symptomDetails} />
                      <InfoRow label="Doctor Observation" value={selectedHistory.symptoms?.doctorObs} />
                      <InfoRow label="Diagnosis" value={selectedHistory.symptoms?.diagnosis} />
                      <InfoRow label="Duration" value={selectedHistory.symptoms?.duration} />
                    </div>
                  </div>
                )}

                {/* Tests */}
                <div className="pm2-modal-section">
                  <div className="pm2-modal-section-title"><FileText size={13} /> Tests</div>
                  {selectedHistory.tests?.selectedTests?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 14px' }}>
                      {selectedHistory.tests.selectedTests.map((test, i) => (
                        <span key={i} className="pm2-tag">{test}</span>
                      ))}
                    </div>
                  ) : <p className="pm2-muted-text">No tests found.</p>}
                </div>

                {/* Treatments */}
                <div className="pm2-modal-section">
                  <div className="pm2-modal-section-title"><Stethoscope size={13} /> Treatments</div>
                  <div style={{ padding: '10px 14px' }}>
                    {selectedHistory.treatments?.generatedData ? (
                      Object.entries(selectedHistory.treatments.generatedData).map(([name, details], i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <p style={{ fontWeight: 600, fontSize: 13, color: '#0c447c', marginBottom: 8 }}>{name}</p>
                          <div className="pm2-modal-grid" style={{ marginBottom: 10 }}>
                            <InfoRow label="Frequency" value={details.frequency} />
                            <InfoRow label="Total" value={details.totalSittings} />
                            <InfoRow label="Pending" value={details.pendingSittings} />
                            <InfoRow label="Current" value={details.currentSitting} />
                            <InfoRow label="Completed" value={details.takenSittings} />
                          </div>
                          {details?.dates?.length > 0 && (
                            <div className="pm2-table-wrapper">
                              <CTable className="pm2-table">
                                <CTableHead>
                                  <CTableRow>
                                    {['Date', 'Sitting', 'Status'].map((h) => (
                                      <CTableHeaderCell key={h} className="pm2-th">{h}</CTableHeaderCell>
                                    ))}
                                  </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                  {details.dates.map((d, idx) => (
                                    <CTableRow key={idx} className="pm2-tr">
                                      <CTableDataCell className="pm2-td pm2-muted">
                                        {d.date ? new Date(d.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                      </CTableDataCell>
                                      <CTableDataCell className="pm2-td pm2-muted">{d.sitting}</CTableDataCell>
                                      <CTableDataCell className="pm2-td pm2-muted">{d.status}</CTableDataCell>
                                    </CTableRow>
                                  ))}
                                </CTableBody>
                              </CTable>
                            </div>
                          )}
                        </div>
                      ))
                    ) : <p className="pm2-muted-text">No treatments found.</p>}
                  </div>
                </div>

                {/* Follow-Up */}
                {selectedHistory.followUp && (
                  <div className="pm2-modal-section">
                    <div className="pm2-modal-section-title"><RefreshCw size={13} /> Follow-Up</div>
                    <div className="pm2-modal-grid">
                      <InfoRow label="Next Follow-Up" value={selectedHistory.followUp?.nextFollowUpDate} />
                      <InfoRow label="Duration" value={selectedHistory.followUp?.durationValue ? `${selectedHistory.followUp.durationValue} ${selectedHistory.followUp.durationUnit}` : null} />
                      <InfoRow label="Note" value={selectedHistory.followUp?.followUpNote} />
                    </div>
                  </div>
                )}

                {/* Prescription */}
                <div className="pm2-modal-section">
                  <div className="pm2-modal-section-title"><FileText size={13} /> Prescription</div>
                  {selectedHistory.prescription?.medicines?.length > 0 ? (
                    <div className="pm2-table-wrapper" style={{ margin: '10px 14px 14px' }}>
                      <CTable className="pm2-table">
                        <CTableHead>
                          <CTableRow>
                            {['Name', 'Dose', 'Duration', 'Food', 'Type', 'Times'].map((h) => (
                              <CTableHeaderCell key={h} className="pm2-th">{h}</CTableHeaderCell>
                            ))}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {selectedHistory.prescription.medicines.map((m, i) => (
                            <CTableRow key={i} className="pm2-tr">
                              <CTableDataCell className="pm2-td pm2-bold">{m.name}</CTableDataCell>
                              <CTableDataCell className="pm2-td pm2-muted">{m.dose}</CTableDataCell>
                              <CTableDataCell className="pm2-td pm2-muted">{m.duration} {m.durationUnit}</CTableDataCell>
                              <CTableDataCell className="pm2-td pm2-muted">{m.food}</CTableDataCell>
                              <CTableDataCell className="pm2-td pm2-muted">{m.medicineType}</CTableDataCell>
                              <CTableDataCell className="pm2-td pm2-muted">{m.times?.join(', ')}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  ) : <p className="pm2-muted-text">No prescription found.</p>}

                  {selectedHistory.prescriptionPdf?.length > 0 && (
                    <div style={{ padding: '0 14px 14px' }}>
                      <iframe
                        title="Prescription PDF"
                        src={`data:application/pdf;base64,${selectedHistory.prescriptionPdf[0]}#toolbar=0&navpanes=0&scrollbar=0`}
                        width="100%" height="400px"
                        style={{ border: '0.5px solid #d0dce9', borderRadius: 8 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </CModalBody>
      </CModal>

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
        .pm2-header-icon { color: #b5d4f4; }
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
          border: 0.5px solid #d0dce9; border-radius: 10px;
          overflow: hidden; overflow-x: auto; margin-bottom: 12px;
        }
        .pm2-table { margin-bottom: 0 !important; font-size: 13px; }
        .pm2-th {
          background: #185fa5 !important; color: #fff !important;
          font-size: 12px !important; font-weight: 600 !important;
          padding: 10px 14px !important; white-space: nowrap; border: none !important;
        }
        .pm2-tr:hover { background: #f0f5fb !important; }
        .pm2-td {
          padding: 10px 14px !important; vertical-align: middle !important;
          font-size: 13px; color: #374151;
          border-bottom: 0.5px solid #eef2f7 !important; border-top: none !important;
        }
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
      `}</style>
    </div>
  )
}

export default PatientManagement