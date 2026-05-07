import React, { useState, useEffect, useMemo } from 'react';
import {
  CRow, CCol, CSpinner, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CButton, CFormCheck
} from '@coreui/react';
import { ToastContainer } from 'react-toastify';
import { showCustomToast } from '../../Utils/Toaster';
import { useHospital } from '../Usecontext/HospitalContext';
import { CustomerData } from '../customerManagement/CustomerManagementAPI';
import './SessionFeedback.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck, faUserMd, faUserNurse, faCheckCircle,
  faPlus, faEye, faEdit, faTrash, faHistory, faStar
} from '@fortawesome/free-solid-svg-icons';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import Select from 'react-select';
import { COLORS } from '../../Constant/Themes';

const RATING_OPTIONS = [
  { id: '1', emoji: '😡', label: '1', className: 'active-1' },
  { id: '2', emoji: '😠', label: '2', className: 'active-2' },
  { id: '3', emoji: '😞', label: '3', className: 'active-3' },
  { id: '4', emoji: '😟', label: '4', className: 'active-4' },
  { id: '5', emoji: '😐', label: '5', className: 'active-5' },
  { id: '6', emoji: '🙂', label: '6', className: 'active-6' },
  { id: '7', emoji: '😊', label: '7', className: 'active-7' },
  { id: '8', emoji: '😄', label: '8', className: 'active-8' },
  { id: '9', emoji: '😍', label: '9', className: 'active-9' },
  { id: '10', emoji: '🤩', label: '10', className: 'active-10' }
];

const SessionFeedback = () => {
  const { doctorData, addNotification, notifications, setNotifications, setNotificationCount } = useHospital() || {};

  // State for CRUD
  const [sessions, setSessions] = useState([
    {
      id: 's1',
      patientId: 'p1',
      patientName: 'John Doe',
      patientPhone: '9876543210',
      doctorId: 'd1',
      doctorName: 'Dr. John Doe',
      bookingId: "Der-Mai-2026-0001",
      therapistId: 't1',
      therapistName: 'Alice Johnson',
      serviceType: "PACKAGE",
      service: [
        { serviceId: "PKG_AUTO", serviceName: "Auto Package" }
      ],
      totalSessions: 10,
      sessionsCompleted: 5,
      isHalfSessionCompleted: true,
      isFullSessionCompleted: false,
      whatWentWell: 'The exercises are helping.',
      improvements: 'More frequent sessions.',
      date: '2026-05-06',
      time: '14:30',
      clinicId: 'C101'
    }
  ]);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data for Dropdowns
  const [patients, setPatients] = useState([]);

  const hospitalId = localStorage.getItem('HospitalId');
  const branchId = localStorage.getItem('branchId');

  // View Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data based on the provided API structure
  const MOCK_FEEDBACK_DATA = [
    {
      patientId: "B0110_PT_61AFD0",
      patientName: "Prashnath",
      mobileNumber: "7842259803",
      bookingId: "Der-Mai-2026-0001",
      doctorId: "00010111",
      doctorName: "Dr. Kaleeswaran",
      therapistId: "THER-DD0F6E",
      therapistName: "Banavath",
      therapistRecordId: "69fad1cc5dc5c090f4fcb68b",
      serviceType: "PACKAGE",
      service: [
        { serviceId: "PKG_AUTO", serviceName: "Auto Package" }
      ],
      totalNoOfSessions: 10,
      noOfSessionsCompleted: 5,
      halfSessionsCompleted: true,
      fullSessionsCompleted: false
    },
    {
      patientId: "P_002_RJ",
      patientName: "Rajesh Kumar",
      mobileNumber: "9988776655",
      bookingId: "BK-2026-0042",
      doctorId: "DOC_01",
      doctorName: "Dr. Anita Sharma",
      therapistId: "THER_05",
      therapistName: "Suresh Babu",
      therapistRecordId: "rec_987654",
      serviceType: "PHYSIOTHERAPY",
      service: [
        { serviceId: "SRV_SHLD", serviceName: "Shoulder Rehab" }
      ],
      totalNoOfSessions: 12,
      noOfSessionsCompleted: 12,
      halfSessionsCompleted: true,
      fullSessionsCompleted: true
    },
    {
      patientId: "P_003_SN",
      patientName: "Sita Nair",
      mobileNumber: "8877665544",
      bookingId: "BK-2026-0089",
      doctorId: "DOC_02",
      doctorName: "Dr. Vijay Varma",
      therapistId: "THER_02",
      therapistName: "Meera Das",
      therapistRecordId: "rec_123456",
      serviceType: "EXERCISE",
      service: [
        { serviceId: "SRV_CORE", serviceName: "Core Strengthening" }
      ],
      totalNoOfSessions: 8,
      noOfSessionsCompleted: 2,
      halfSessionsCompleted: false,
      fullSessionsCompleted: false
    }
  ];

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    doctorId: '',
    doctorName: '',
    therapistId: '',
    therapistName: '',
    serviceType: '',
    serviceNames: '',
    totalSessions: '',
    sessionsCompleted: '',
    isHalfSessionCompleted: false,
    isFullSessionCompleted: false,
    bookingId: '',
    rating: '',
    whatWentWell: '',
    improvements: '',
    clinicId: localStorage.getItem('HospitalId') || ''
  });

  const [errors, setErrors] = useState({});

  // Handle auto-population from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoPatientId = params.get('patientId');
    if (autoPatientId && patients.length > 0) {
      const p = patients.find(p => p.patientId === autoPatientId);
      if (p) {
        setForm(prev => ({
          ...prev,
          patientId: p.patientId,
          patientName: p.patientName,
          patientPhone: p.mobileNumber,
          bookingId: p.bookingId,
          doctorId: p.doctorId,
          doctorName: p.doctorName,
          therapistId: p.therapistId,
          therapistName: p.therapistName,
          serviceType: p.serviceType,
          serviceNames: p.service?.map(s => s.serviceName).join(', ') || '—',
          totalSessions: p.totalNoOfSessions,
          sessionsCompleted: p.noOfSessionsCompleted,
          isHalfSessionCompleted: p.halfSessionsCompleted,
          isFullSessionCompleted: p.fullSessionsCompleted
        }));
        setIsFormVisible(true);
      }
    }
  }, [patients]);

  useEffect(() => {
    console.log("SessionFeedback: Loading Mock Data");
    setPatients(MOCK_FEEDBACK_DATA);
  }, []);

  const doctorsList = doctorData?.data || [
    { doctorId: 'd1', doctorName: 'Dr. John Doe' },
    { doctorId: 'd2', doctorName: 'Dr. Sarah Smith' }
  ];

  const handlePatientSelect = (selectedOption) => {
    if (selectedOption) {
      setForm(prev => ({
        ...prev,
        patientId: selectedOption.patientId,
        patientName: selectedOption.patientName,
        patientPhone: selectedOption.mobileNumber,
        bookingId: selectedOption.bookingId,
        doctorId: selectedOption.doctorId,
        doctorName: selectedOption.doctorName,
        therapistId: selectedOption.therapistId,
        therapistName: selectedOption.therapistName,
        serviceType: selectedOption.serviceType,
        serviceNames: selectedOption.service?.map(s => s.serviceName).join(', ') || '—',
        totalSessions: selectedOption.totalNoOfSessions,
        sessionsCompleted: selectedOption.noOfSessionsCompleted,
        isHalfSessionCompleted: selectedOption.halfSessionsCompleted,
        isFullSessionCompleted: selectedOption.fullSessionsCompleted
      }));
    } else {
      setForm(prev => ({
        ...prev,
        patientId: '', patientName: '', patientPhone: '',
        bookingId: '', doctorName: '', therapistName: '',
        serviceType: '', serviceNames: '',
        totalSessions: '', sessionsCompleted: ''
      }));
    }
    if (errors.patientId) setErrors(prev => { const n = { ...prev }; delete n.patientId; return n; });
  };

  const validateForm = () => {
    const e = {};
    if (!form.patientId) e.patientId = 'Required';
    if (!form.therapistId) e.therapistId = 'Required';
    if (!form.totalSessions) e.totalSessions = 'Required';
    if (!form.sessionsCompleted) e.sessionsCompleted = 'Required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const now = new Date();

    // Derive milestones
    const ratio = form.sessionsCompleted / form.totalSessions;
    const isFull = ratio >= 1;
    const isHalf = ratio >= 0.5 && ratio < 1;

    const payload = {
      ...form,
      isHalfSessionCompleted: isHalf,
      isFullSessionCompleted: isFull,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      setLoading(false);
      if (isEditing) {
        setSessions(prev => prev.map(s => s.id === editingId ? { ...payload, id: editingId } : s));
        showCustomToast('Session feedback updated.', 'success');
      } else {
        const newSession = { ...payload, id: Date.now().toString() };
        setSessions(prev => [newSession, ...prev]);
        showCustomToast('Session feedback saved.', 'success');
      }
      closeForm();
    }, 800);
  };

  const openAddForm = () => {
    setForm({
      patientId: '', patientName: '', patientPhone: '',
      doctorId: '', doctorName: '', therapistId: '', therapistName: '',
      serviceType: '', totalSessions: '', sessionsCompleted: '',
      isHalfSessionCompleted: false, isFullSessionCompleted: false,
      rating: '',
      whatWentWell: '', improvements: '',
      clinicId: localStorage.getItem('HospitalId') || ''
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
    setIsFormVisible(true);
  };

  const openEditForm = (session) => {
    setForm(session);
    setErrors({});
    setIsEditing(true);
    setEditingId(session.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this session record?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
      showCustomToast('Record deleted.', 'info');
    }
  };

  const handleView = (session) => {
    setSelectedSession(session);
    setViewModalVisible(true);
  };

  const closeForm = () => setIsFormVisible(false);

  const patientOptions = patients.map(p => ({
    value: p.patientId,
    label: `${p.patientName} (${p.mobileNumber})`,
    ...p
  }));

  const filteredSessions = useMemo(() => {
    if (!searchQuery) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(s =>
      s.patientName?.toLowerCase().includes(q) ||
      s.doctorName?.toLowerCase().includes(q) ||
      s.therapistName?.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  return (
    <div className="sf-wrapper">
      <ToastContainer />
      <div className="sf-card">
        <div className="sf-header">
          <div className="sf-header-content">
            <h4 className='fw-bold'>Session Feedback Management</h4>
            <p>Track therapy progress and session-specific insights.</p>
          </div>
          {!isFormVisible ? (
            <button className="sf-add-btn" onClick={openAddForm}>
              <FontAwesomeIcon icon={faPlus} /> Add Session Feedback
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="sf-add-btn sf-btn-alt"
                onClick={closeForm}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="sessionFeedbackForm"
                className="sf-add-btn"
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Save Feedback
              </button>
            </div>
          )}
        </div>

        <div className="sf-body">
          {!isFormVisible ? (
            <>
              <div className="sf-filters">
                <input
                  type="text"
                  className="sf-search-input"
                  placeholder="Search by Patient, Doctor or Therapist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sf-table-wrapper">
                {filteredSessions.length === 0 ? (
                  <div className="sf-empty-state">
                    <FontAwesomeIcon icon={faHistory} size="3x" style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h6>No Session Records Found</h6>
                    <p>Start tracking session milestones to see them here.</p>
                  </div>
                ) : (
                  <table className="sf-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Booking ID</th>
                        <th>Date</th>
                        <th>Patient</th>
                        <th>Doctor / Therapist</th>
                        <th>Progress</th>
                        <th>Rating</th>
                        <th>Milestone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSessions.map((s, idx) => (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td><span className="sf-booking-badge">{s.bookingId || '—'}</span></td>
                          <td>{s.date}</td>
                          <td>
                            <div className="sf-pat-cell">
                              <span className="sf-pat-name">{s.patientName}</span>
                              <span className="sf-pat-phone">{s.patientPhone}</span>
                            </div>
                          </td>
                          <td>
                            <div className="sf-staff-cell">
                              <span><FontAwesomeIcon icon={faUserMd} className="me-1 opacity-50" /> {s.doctorName}</span>
                              <span><FontAwesomeIcon icon={faUserNurse} className="me-1 opacity-50" /> {s.therapistName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="sf-progress-wrap">
                              <span className="sf-prog-text">{s.sessionsCompleted} / {s.totalSessions}</span>
                              <div className="sf-prog-bar">
                                <div
                                  className="sf-prog-fill"
                                  style={{ width: `${(s.sessionsCompleted / (s.totalSessions || 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {s.rating ? (
                              <div className="sf-rating-badge" style={{ fontSize: '13px', fontWeight: '600' }}>
                                {RATING_OPTIONS.find(r => r.id === s.rating)?.emoji} {s.rating}
                              </div>
                            ) : (
                              <span className="opacity-50">—</span>
                            )}
                          </td>
                          <td>
                            {s.isFullSessionCompleted ? (
                              <span className="sf-badge sf-badge-full">Full Completed</span>
                            ) : s.isHalfSessionCompleted ? (
                              <span className="sf-badge sf-badge-half">Half Completed</span>
                            ) : (
                              <span className="sf-badge sf-badge-none">Ongoing</span>
                            )}
                          </td>
                          <td>
                            <div className="sf-action-btns">
                              <button className="sf-btn-icon sf-btn-view" onClick={() => handleView(s)} title="View"><Eye size={14} /></button>
                              <button className="sf-btn-icon sf-btn-edit" onClick={() => openEditForm(s)} title="Edit"><Edit2 size={14} /></button>
                              <button className="sf-btn-icon sf-btn-delete" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} id="sessionFeedbackForm" className="sf-form-grid">
              <div className="sf-form-section">
                <h5 className="sf-form-subtitle" style={{ color: COLORS.primary }}><FontAwesomeIcon icon={faCalendarCheck} /> Session Details</h5>
                <CRow>
                  <CCol md={12} className="mb-3">
                    <label className="sf-label">Patient (Search Name or Mobile)<span className="sf-req">*</span></label>
                    <Select
                      options={patientOptions}
                      value={patientOptions.find(p => p.value === form.patientId)}
                      onChange={handlePatientSelect}
                      placeholder="Select Patient..."
                      isClearable
                    />
                    {errors.patientId && <span className="sf-err">{errors.patientId}</span>}
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="sf-label">Booking ID</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.bookingId || '—'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <label className="sf-label">Service Type</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.serviceType || '—'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>

                  <CCol md={6} className="mb-3">
                    <label className="sf-label">Doctor</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.doctorName || '—'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <label className="sf-label">Therapist</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.therapistName || '—'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                  <CCol md={2} className="mb-3">
                    <label className="sf-label">Total Sessions</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.totalSessions || '0'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                  <CCol md={2} className="mb-3">
                    <label className="sf-label">Sessions Completed</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.sessionsCompleted || '0'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                  <CCol md={3} className="mb-3">
                    <label className="sf-label">Milestone Status</label>
                    <div
                      className="sf-input d-flex align-items-center"
                      style={{ background: '#f0f9ff', color: '#0369a1', fontWeight: 'bold', border: '1px solid #bae6fd' }}
                    >
                      {form.isFullSessionCompleted
                        ? "🏆 Course Completed (100%)"
                        : form.isHalfSessionCompleted
                          ? "📊 Milestone: 50% Achieved"
                          : "⚙️ Treatment in Progress"}
                    </div>
                  </CCol>
                  <CCol md={5} className="mb-3">
                    <label className="sf-label">Service Names</label>
                    <input
                      type="text" className="sf-input" readOnly
                      value={form.serviceNames || '—'}
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    />
                  </CCol>
                </CRow>
              </div>

              <div className="sf-form-section">
                <h5 className="sf-form-subtitle" style={{ color: COLORS.primary }}><FontAwesomeIcon icon={faStar} /> Experience Feedback</h5>

                <div className="mb-4" >
                  <label className="sf-label"  >Session Experience Rating</label>
                  <div className="sf-ratings">
                    {RATING_OPTIONS.map(opt => (
                      <div
                        key={`sf-rate-${opt.id}`}
                        className={`sf-rating-card ${form.rating === opt.id ? `active ${opt.className}` : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, rating: opt.id }))}
                      >
                        <span className="sf-rating-emoji">{opt.emoji}</span>
                        <span className="sf-rating-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <CRow>
                  <CCol md={6} className="mb-3">
                    <label className="sf-label">What went well?</label>
                    <textarea
                      className="sf-textarea" rows="3" value={form.whatWentWell}
                      onChange={e => setForm({ ...form, whatWentWell: e.target.value })}
                      placeholder="Positive highlights..."
                    ></textarea>
                  </CCol>
                  <CCol md={6} className="mb-3">
                    <label className="sf-label">Improvements</label>
                    <textarea
                      className="sf-textarea" rows="3" value={form.improvements}
                      onChange={e => setForm({ ...form, improvements: e.target.value })}
                      placeholder="Areas for improvement..."
                    ></textarea>
                  </CCol>
                </CRow>
              </div>

              <div className="sf-form-actions">
                <CButton color="secondary" variant="ghost" onClick={closeForm}>Cancel</CButton>
                <button type="submit" className="sf-submit-btn" disabled={loading}>
                  {loading ? <CSpinner size="sm" /> : <><FontAwesomeIcon icon={faCheckCircle} /> Save Record</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg" className='custom-modal' backdrop="static">
        <CModalHeader><CModalTitle>Session Report</CModalTitle></CModalHeader>
        <CModalBody>
          {selectedSession && (
            <div className="sf-report-view">
              <div className="sf-report-section main">
                <div className="sf-rep-row"><strong>Patient:</strong> <span>{selectedSession.patientName} ({selectedSession.patientPhone})</span></div>
                <div className="sf-rep-row"><strong>Booking ID:</strong> <span className="sf-booking-badge">{selectedSession.bookingId || '—'}</span></div>
                <div className="sf-rep-row">
                  <strong>Progress:</strong> 
                  <span className={`badge ${selectedSession.isFullSessionCompleted ? 'bg-success' : 'bg-primary'}`}>
                    {selectedSession.sessionsCompleted} / {selectedSession.totalSessions} Sessions
                  </span>
                </div>
                <div className="sf-rep-row">
                  <strong>Milestone:</strong> 
                  <span style={{ fontWeight: '700', color: selectedSession.isFullSessionCompleted ? '#166534' : (selectedSession.isHalfSessionCompleted ? '#854d0e' : '#0369a1') }}>
                    {selectedSession.isFullSessionCompleted 
                      ? "🏆 Course Completed (100%)" 
                      : selectedSession.isHalfSessionCompleted 
                        ? "📊 Milestone: 50% Achieved" 
                        : "⚙️ Treatment in Progress"}
                  </span>
                </div>
                {selectedSession.rating && (
                  <div className="sf-rep-row">
                    <strong>Rating:</strong>
                    <span>{RATING_OPTIONS.find(r => r.id === selectedSession.rating)?.emoji} ({selectedSession.rating}/10)</span>
                  </div>
                )}
              </div>
              <div className="sf-report-section">
                <div className="sf-rep-row"><strong>Doctor:</strong> <span>{selectedSession.doctorName}</span></div>
                <div className="sf-rep-row"><strong>Therapist:</strong> <span>{selectedSession.therapistName}</span></div>
                <div className="sf-rep-row"><strong>Service Type:</strong> <span>{selectedSession.serviceType}</span></div>
                <div className="sf-rep-row"><strong>Service Names:</strong> <span>{selectedSession.serviceNames || (selectedSession.service?.map(s => s.serviceName).join(', ')) || '—'}</span></div>
              </div>
              <div className="sf-report-section feedback">
                <h6>Feedback Highlights</h6>
                <div className="sf-rep-box"><strong>What went well:</strong> <p>{selectedSession.whatWentWell || '—'}</p></div>
                <div className="sf-rep-box"><strong>Improvements:</strong> <p>{selectedSession.improvements || '—'}</p></div>
              </div>
              <div className="sf-report-footer">
                <span>Clinic ID: {selectedSession.clinicId}</span>
                <span>Submitted: {selectedSession.date} at {selectedSession.time}</span>
              </div>
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  );
};

export default SessionFeedback;
