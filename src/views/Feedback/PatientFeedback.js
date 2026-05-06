import React, { useState, useEffect, useMemo } from 'react';
import { CRow, CCol, CSpinner, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';
import { ToastContainer } from 'react-toastify';
import { showCustomToast } from '../../Utils/Toaster';
import { useHospital } from '../Usecontext/HospitalContext';
import { CustomerData } from '../customerManagement/CustomerManagementAPI';
import './PatientFeedback.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHospital, faUserMd, faUserNurse, faCheckCircle,
  faPlus, faEye, faEdit, faTrash, faConciergeBell
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

const RATING_OPTIONS = [
  { id: 'bad', emoji: '😞', label: 'Bad', className: 'active-bad' },
  { id: 'normal', emoji: '😐', label: 'Normal', className: 'active-normal' },
  { id: 'good', emoji: '😄', label: 'Good', className: 'active-good' },
  { id: 'excellent', emoji: '😍', label: 'Like More', className: 'active-excellent' }
];

const PatientFeedback = () => {
  const { doctorData } = useHospital() || {};

  // State for CRUD
  const [feedbacks, setFeedbacks] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // View Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Data for Dropdowns
  const [patients, setPatients] = useState([]);

  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    hospitalFeedback: { rating: '', feedbackText: '' },
    doctorFeedback: { targetId: '', rating: '', feedbackText: '' },
    therapistFeedback: { targetId: '', rating: '', feedbackText: '' },
    receptionistFeedback: { targetId: '', rating: '', feedbackText: '' }
  });

  const [errors, setErrors] = useState({});

  // Fetch Patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await CustomerData();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };
    fetchPatients();
  }, []);

  // Use real doctors if available in context, else mock
  const doctorsList = doctorData?.data || [
    { doctorId: 'd1', doctorName: 'Dr. John Doe' },
    { doctorId: 'd2', doctorName: 'Dr. Sarah Smith' }
  ];

  const therapistsList = [
    { id: 't1', name: 'Alice Johnson (PT)' },
    { id: 't2', name: 'Bob Williams (OT)' }
  ];

  const receptionistsList = [
    { id: 'r1', name: 'Emily Davis' },
    { id: 'r2', name: 'Michael Brown' }
  ];

  const handlePatientSelect = (selectedOption) => {
    if (selectedOption) {
      setForm(prev => ({
        ...prev,
        patientId: selectedOption.value,
        patientName: selectedOption.label,
        patientPhone: selectedOption.mobileNumber || ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        patientId: '',
        patientName: '',
        patientPhone: ''
      }));
    }
    if (errors.patientId) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs.patientId;
        return newErrs;
      });
    }
  };

  const handleSectionChange = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.patientId) newErrors.patientId = 'Please select a Patient';

    // Ensure at least one rating is provided
    const hasAnyRating =
      form.hospitalFeedback.rating ||
      form.doctorFeedback.rating ||
      form.therapistFeedback.rating ||
      form.receptionistFeedback.rating;

    if (!hasAnyRating) {
      newErrors.general = 'Please provide at least one rating (Hospital, Doctor, Therapist, or Receptionist).';
    }

    // If rating provided for staff, ensure targetId is selected
    if (form.doctorFeedback.rating && !form.doctorFeedback.targetId) newErrors.doctorTarget = 'Please select a Doctor';
    if (form.therapistFeedback.rating && !form.therapistFeedback.targetId) newErrors.therapistTarget = 'Please select a Therapist';
    if (form.receptionistFeedback.rating && !form.receptionistFeedback.targetId) newErrors.receptionistTarget = 'Please select a Receptionist';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Construct payload for backend
    const payload = {
      patientId: form.patientId,
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      hospitalFeedback: form.hospitalFeedback.rating ? form.hospitalFeedback : null,
      doctorFeedback: form.doctorFeedback.rating ? form.doctorFeedback : null,
      therapistFeedback: form.therapistFeedback.rating ? form.therapistFeedback : null,
      receptionistFeedback: form.receptionistFeedback.rating ? form.receptionistFeedback : null,
      date: new Date().toISOString()
    };

    setTimeout(() => {
      setLoading(false);

      if (isEditing) {
        console.log("PUT /api/feedback Payload:", { id: editingId, ...payload });
        setFeedbacks(prev => prev.map(f => f.id === editingId ? { ...payload, id: editingId } : f));
        showCustomToast('Feedback updated successfully.', 'success');
      } else {
        console.log("POST /api/feedback Payload:", payload);
        const newFeedback = { ...payload, id: Date.now().toString() };
        setFeedbacks(prev => [newFeedback, ...prev]);
        showCustomToast('Feedback submitted successfully.', 'success');
      }
      closeForm();
    }, 800);
  };

  const openAddForm = () => {
    setForm({
      patientId: '',
      patientName: '',
      patientPhone: '',
      hospitalFeedback: { rating: '', feedbackText: '' },
      doctorFeedback: { targetId: '', rating: '', feedbackText: '' },
      therapistFeedback: { targetId: '', rating: '', feedbackText: '' },
      receptionistFeedback: { targetId: '', rating: '', feedbackText: '' }
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
    setIsFormVisible(true);
  };

  const openEditForm = (feedback) => {
    setForm({
      patientId: feedback.patientId,
      patientName: feedback.patientName,
      patientPhone: feedback.patientPhone,
      hospitalFeedback: feedback.hospitalFeedback || { rating: '', feedbackText: '' },
      doctorFeedback: feedback.doctorFeedback || { targetId: '', rating: '', feedbackText: '' },
      therapistFeedback: feedback.therapistFeedback || { targetId: '', rating: '', feedbackText: '' },
      receptionistFeedback: feedback.receptionistFeedback || { targetId: '', rating: '', feedbackText: '' }
    });
    setErrors({});
    setIsEditing(true);
    setEditingId(feedback.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      console.log("DELETE /api/feedback Payload ID:", id);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      showCustomToast('Feedback deleted.', 'success');
    }
  };

  const handleView = (feedback) => {
    console.log("GET /api/feedback Payload ID:", feedback.id);
    setSelectedFeedback(feedback);
    setViewModalVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
  };

  // Prepare Patient Options for react-select
  const patientOptions = patients.map(p => ({
    value: p.customerId,
    label: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
    mobileNumber: p.mobileNumber
  }));

  const getTargetName = (type, id) => {
    if (type === 'Doctor') return doctorsList.find(d => (d.doctorId || d.doctorName) === id)?.doctorName || id;
    if (type === 'Therapist') return therapistsList.find(t => t.id === id)?.name || id;
    if (type === 'Receptionist') return receptionistsList.find(r => r.id === id)?.name || id;
    return id;
  };

  const filteredFeedbacks = useMemo(() => {
    if (!searchQuery) return feedbacks;
    const lowerQuery = searchQuery.toLowerCase();
    
    return feedbacks.filter(f => {
      // 1. Patient match
      if (f.patientName?.toLowerCase().includes(lowerQuery)) return true;
      if (f.patientPhone?.includes(searchQuery)) return true;

      // 2. Doctor match
      if (f.doctorFeedback?.targetId) {
        const docName = getTargetName('Doctor', f.doctorFeedback.targetId);
        if (docName?.toLowerCase().includes(lowerQuery)) return true;
      }

      // 3. Therapist match
      if (f.therapistFeedback?.targetId) {
        const therName = getTargetName('Therapist', f.therapistFeedback.targetId);
        if (therName?.toLowerCase().includes(lowerQuery)) return true;
      }

      // 4. Receptionist match
      if (f.receptionistFeedback?.targetId) {
        const recName = getTargetName('Receptionist', f.receptionistFeedback.targetId);
        if (recName?.toLowerCase().includes(lowerQuery)) return true;
      }

      return false;
    });
  }, [feedbacks, searchQuery, doctorsList, therapistsList, receptionistsList]);

  return (
    <div className="pf-wrapper">
      <ToastContainer />
      <div className="pf-card">

        <div className="pf-header">
          <div className="pf-header-content" style={{ color: "white" }}>
            <h2>Patient Rating & Feedback</h2>
            <p style={{ color: "white" }}>Manage comprehensive feedback from patients.</p>
          </div>
          {!isFormVisible && (
            <button className="pf-add-btn" onClick={openAddForm}>
              <FontAwesomeIcon icon={faPlus} /> Add Feedback
            </button>
          )}
        </div>

        <div className="pf-body">
          {!isFormVisible ? (
            /* --- Data Table View --- */
            <>
              <div className="pf-filters">
                <input
                  type="text"
                  className="pf-search-input"
                  placeholder="Search by Patient, Mobile, or Staff Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="pf-table-wrapper">
                {filteredFeedbacks.length === 0 ? (
                  <div className="pf-empty-state">
                    <FontAwesomeIcon icon={faHospital} size="3x" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h4>No Feedbacks Found</h4>
                    <p>Click "Add Feedback" to create a new entry.</p>
                  </div>
                ) : (
                  <table className="pf-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Date</th>
                        <th>Patient Name</th>
                        <th>Mobile</th>
                        <th>Entities Rated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedbacks.map((f, index) => {
                        const ratedEntities = [];
                        if (f.hospitalFeedback) ratedEntities.push('Hospital');
                        if (f.doctorFeedback) ratedEntities.push('Doctor');
                        if (f.therapistFeedback) ratedEntities.push('Therapist');
                        if (f.receptionistFeedback) ratedEntities.push('Receptionist');

                        return (
                          <tr key={f.id}>
                            <td>{index + 1}</td>
                            <td>{new Date(f.date).toLocaleDateString()}</td>
                            <td>{f.patientName}</td>
                            <td>{f.patientPhone}</td>
                            <td>{ratedEntities.join(', ')}</td>
                            <td>
                              <div className="pf-action-btns">
                                <button className="pf-btn-icon pf-btn-view" onClick={() => handleView(f)} title="View">
                                  <FontAwesomeIcon icon={faEye} />
                                </button>
                                <button className="pf-btn-icon pf-btn-edit" onClick={() => openEditForm(f)} title="Edit">
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button className="pf-btn-icon pf-btn-delete" onClick={() => handleDelete(f.id)} title="Delete">
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            /* --- Form View --- */
            <form onSubmit={handleSubmit}>

              {/* Patient Details */}
              <div className="pf-target-section">
                <h4 className="pf-target-title">Patient Information</h4>
                <CRow>
                  <CCol md={6} className="mb-3 mb-md-0">
                    <label className="pf-label">Patient Name<span className="pf-req">*</span></label>
                    <Select
                      options={patientOptions}
                      value={patientOptions.find(p => p.value === form.patientId) || null}
                      onChange={handlePatientSelect}
                      placeholder="Search and select patient..."
                      isClearable
                    />
                    {errors.patientId && <span className="pf-error-text">{errors.patientId}</span>}
                  </CCol>
                  <CCol md={6}>
                    <label className="pf-label">Mobile Number</label>
                    <input
                      type="text"
                      className="pf-input"
                      placeholder="Auto-fetched mobile number"
                      value={form.patientPhone}
                      readOnly
                    />
                  </CCol>
                </CRow>
              </div>

              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}

              {/* HOSPITAL FEEDBACK */}
              <div className="pf-target-section">
                <h4 className="pf-target-title"><FontAwesomeIcon icon={faHospital} /> Hospital Experience</h4>
                <div className="pf-section">
                  <label className="pf-label">Rating</label>
                  <div className="pf-ratings">
                    {RATING_OPTIONS.map(opt => (
                      <div
                        key={`hosp-${opt.id}`}
                        className={`pf-rating-card ${form.hospitalFeedback.rating === opt.id ? `active ${opt.className}` : ''}`}
                        onClick={() => handleSectionChange('hospitalFeedback', 'rating', opt.id)}
                      >
                        <span className="pf-rating-emoji">{opt.emoji}</span>
                        <span className="pf-rating-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pf-section">
                  <label className="pf-label">Comments</label>
                  <textarea
                    className="pf-textarea"
                    placeholder="Feedback about the hospital..."
                    value={form.hospitalFeedback.feedbackText}
                    onChange={(e) => handleSectionChange('hospitalFeedback', 'feedbackText', e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* DOCTOR FEEDBACK */}
              <div className="pf-target-section">
                <h4 className="pf-target-title"><FontAwesomeIcon icon={faUserMd} /> Doctor Feedback</h4>
                <div className="pf-section">
                  <label className="pf-label">Select Doctor</label>
                  <select
                    className="pf-select"
                    value={form.doctorFeedback.targetId}
                    onChange={(e) => handleSectionChange('doctorFeedback', 'targetId', e.target.value)}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctorsList.map((doc, idx) => (
                      <option key={doc.doctorId || idx} value={doc.doctorId || doc.doctorName}>
                        {doc.doctorName}
                      </option>
                    ))}
                  </select>
                  {errors.doctorTarget && <span className="pf-error-text">{errors.doctorTarget}</span>}
                </div>
                <div className="pf-section">
                  <label className="pf-label">Rating</label>
                  <div className="pf-ratings">
                    {RATING_OPTIONS.map(opt => (
                      <div
                        key={`doc-${opt.id}`}
                        className={`pf-rating-card ${form.doctorFeedback.rating === opt.id ? `active ${opt.className}` : ''}`}
                        onClick={() => handleSectionChange('doctorFeedback', 'rating', opt.id)}
                      >
                        <span className="pf-rating-emoji">{opt.emoji}</span>
                        <span className="pf-rating-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pf-section">
                  <label className="pf-label">Comments</label>
                  <textarea
                    className="pf-textarea"
                    placeholder="Feedback about the doctor..."
                    value={form.doctorFeedback.feedbackText}
                    onChange={(e) => handleSectionChange('doctorFeedback', 'feedbackText', e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* THERAPIST FEEDBACK */}
              <div className="pf-target-section">
                <h4 className="pf-target-title"><FontAwesomeIcon icon={faUserNurse} /> Therapist Feedback</h4>
                <div className="pf-section">
                  <label className="pf-label">Select Therapist</label>
                  <select
                    className="pf-select"
                    value={form.therapistFeedback.targetId}
                    onChange={(e) => handleSectionChange('therapistFeedback', 'targetId', e.target.value)}
                  >
                    <option value="">-- Choose Therapist --</option>
                    {therapistsList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {errors.therapistTarget && <span className="pf-error-text">{errors.therapistTarget}</span>}
                </div>
                <div className="pf-section">
                  <label className="pf-label">Rating</label>
                  <div className="pf-ratings">
                    {RATING_OPTIONS.map(opt => (
                      <div
                        key={`ther-${opt.id}`}
                        className={`pf-rating-card ${form.therapistFeedback.rating === opt.id ? `active ${opt.className}` : ''}`}
                        onClick={() => handleSectionChange('therapistFeedback', 'rating', opt.id)}
                      >
                        <span className="pf-rating-emoji">{opt.emoji}</span>
                        <span className="pf-rating-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pf-section">
                  <label className="pf-label">Comments</label>
                  <textarea
                    className="pf-textarea"
                    placeholder="Feedback about the therapist..."
                    value={form.therapistFeedback.feedbackText}
                    onChange={(e) => handleSectionChange('therapistFeedback', 'feedbackText', e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* RECEPTIONIST FEEDBACK */}
              <div className="pf-target-section">
                <h4 className="pf-target-title"><FontAwesomeIcon icon={faConciergeBell} /> Receptionist Feedback</h4>
                <div className="pf-section">
                  <label className="pf-label">Select Receptionist</label>
                  <select
                    className="pf-select"
                    value={form.receptionistFeedback.targetId}
                    onChange={(e) => handleSectionChange('receptionistFeedback', 'targetId', e.target.value)}
                  >
                    <option value="">-- Choose Receptionist --</option>
                    {receptionistsList.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors.receptionistTarget && <span className="pf-error-text">{errors.receptionistTarget}</span>}
                </div>
                <div className="pf-section">
                  <label className="pf-label">Rating</label>
                  <div className="pf-ratings">
                    {RATING_OPTIONS.map(opt => (
                      <div
                        key={`rec-${opt.id}`}
                        className={`pf-rating-card ${form.receptionistFeedback.rating === opt.id ? `active ${opt.className}` : ''}`}
                        onClick={() => handleSectionChange('receptionistFeedback', 'rating', opt.id)}
                      >
                        <span className="pf-rating-emoji">{opt.emoji}</span>
                        <span className="pf-rating-label">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pf-section">
                  <label className="pf-label">Comments</label>
                  <textarea
                    className="pf-textarea"
                    placeholder="Feedback about the receptionist..."
                    value={form.receptionistFeedback.feedbackText}
                    onChange={(e) => handleSectionChange('receptionistFeedback', 'feedbackText', e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="pf-form-actions">
                <button type="button" className="pf-cancel-btn" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="pf-submit-btn" disabled={loading}>
                  {loading ? (
                    <><CSpinner size="sm" /> {isEditing ? 'Updating...' : 'Saving...'}</>
                  ) : (
                    <><FontAwesomeIcon icon={faCheckCircle} /> {isEditing ? 'Update Feedback' : 'Save Feedback'}</>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>

      {/* VIEW MODAL */}
      <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Feedback Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedFeedback && (
            <div>
              <div className="pf-view-detail" style={{ background: '#e6f1fb' }}>
                <h5>Patient Info</h5>
                <div className="pf-view-row">
                  <span className="pf-view-label">Name:</span>
                  <span className="pf-view-value">{selectedFeedback.patientName}</span>
                </div>
                <div className="pf-view-row">
                  <span className="pf-view-label">Mobile:</span>
                  <span className="pf-view-value">{selectedFeedback.patientPhone}</span>
                </div>
                <div className="pf-view-row">
                  <span className="pf-view-label">Date:</span>
                  <span className="pf-view-value">{new Date(selectedFeedback.date).toLocaleString()}</span>
                </div>
              </div>

              {selectedFeedback.hospitalFeedback && (
                <div className="pf-view-detail">
                  <h5><FontAwesomeIcon icon={faHospital} /> Hospital</h5>
                  <div className="pf-view-row">
                    <span className="pf-view-label">Rating:</span>
                    <span className="pf-view-value" style={{ textTransform: 'capitalize' }}>
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.hospitalFeedback.rating)?.emoji} {selectedFeedback.hospitalFeedback.rating}
                    </span>
                  </div>
                  {selectedFeedback.hospitalFeedback.feedbackText && (
                    <div className="pf-view-feedback">"{selectedFeedback.hospitalFeedback.feedbackText}"</div>
                  )}
                </div>
              )}

              {selectedFeedback.doctorFeedback && (
                <div className="pf-view-detail">
                  <h5><FontAwesomeIcon icon={faUserMd} /> Doctor: {getTargetName('Doctor', selectedFeedback.doctorFeedback.targetId)}</h5>
                  <div className="pf-view-row">
                    <span className="pf-view-label">Rating:</span>
                    <span className="pf-view-value" style={{ textTransform: 'capitalize' }}>
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.doctorFeedback.rating)?.emoji} {selectedFeedback.doctorFeedback.rating}
                    </span>
                  </div>
                  {selectedFeedback.doctorFeedback.feedbackText && (
                    <div className="pf-view-feedback">"{selectedFeedback.doctorFeedback.feedbackText}"</div>
                  )}
                </div>
              )}

              {selectedFeedback.therapistFeedback && (
                <div className="pf-view-detail">
                  <h5><FontAwesomeIcon icon={faUserNurse} /> Therapist: {getTargetName('Therapist', selectedFeedback.therapistFeedback.targetId)}</h5>
                  <div className="pf-view-row">
                    <span className="pf-view-label">Rating:</span>
                    <span className="pf-view-value" style={{ textTransform: 'capitalize' }}>
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.therapistFeedback.rating)?.emoji} {selectedFeedback.therapistFeedback.rating}
                    </span>
                  </div>
                  {selectedFeedback.therapistFeedback.feedbackText && (
                    <div className="pf-view-feedback">"{selectedFeedback.therapistFeedback.feedbackText}"</div>
                  )}
                </div>
              )}

              {selectedFeedback.receptionistFeedback && (
                <div className="pf-view-detail">
                  <h5><FontAwesomeIcon icon={faConciergeBell} /> Receptionist: {getTargetName('Receptionist', selectedFeedback.receptionistFeedback.targetId)}</h5>
                  <div className="pf-view-row">
                    <span className="pf-view-label">Rating:</span>
                    <span className="pf-view-value" style={{ textTransform: 'capitalize' }}>
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.receptionistFeedback.rating)?.emoji} {selectedFeedback.receptionistFeedback.rating}
                    </span>
                  </div>
                  {selectedFeedback.receptionistFeedback.feedbackText && (
                    <div className="pf-view-feedback">"{selectedFeedback.receptionistFeedback.feedbackText}"</div>
                  )}
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default PatientFeedback;
