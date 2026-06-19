import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CRow, CCol, CSpinner, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';
import { ToastContainer } from 'react-toastify';
import { showCustomToast } from '../../Utils/Toaster';
import { useHospital } from '../Usecontext/HospitalContext';
import { CustomerData } from '../customerManagement/CustomerManagementAPI';
import './PatientFeedback.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHospital, faUserMd, faUserNurse, faCheckCircle,
  faPlus, faEye, faEdit, faTrash, faConciergeBell, faHistory
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import { getAllPhysios } from '../EmployeeManagement/NurseManagement/NurseAPI';
import { getAllFrontDeskAPI } from '../EmployeeManagement/FrontDesk/FrontDeskAPI';
import {
  getAllOverallFeedback,
  createOverallFeedback,
  updateOverallFeedback,
  deleteOverallFeedback
} from './FeedbackAPI';
import ConfirmationModal from '../../components/ConfirmationModal';

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

const PatientFeedback = () => {
  const { doctorData, addNotification } = useHospital() || {};
  const navigate = useNavigate();

  // State for CRUD
  const [feedbacks, setFeedbacks] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Delete Confirmation Modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [feedbackIdToDelete, setFeedbackIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Data for Dropdowns
  const [patients, setPatients] = useState([]);
  const [therapistsList, setTherapistsList] = useState([]);
  const [receptionistsList, setReceptionistsList] = useState([]);

  const hospitalId = localStorage.getItem('HospitalId');
  const branchId = localStorage.getItem('branchId');

  const [form, setForm] = useState({
    clinicId: hospitalId,
    branchId: branchId,
    patientId: '',
    patientName: '',
    patientPhone: '',
    hospitalFeedback: { rating: '', feedbackText: '' },
    doctorFeedback: { targetId: '', rating: '', feedbackText: '' },
    therapistFeedback: { targetId: '', rating: '', feedbackText: '' },
    receptionistFeedback: { targetId: '', rating: '', feedbackText: '' }
  });

  const [errors, setErrors] = useState({});

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await getAllOverallFeedback(hospitalId, branchId);
      if (res?.data?.data) setFeedbacks(res.data.data);
      else if (res?.data) setFeedbacks(res.data);
      else if (Array.isArray(res)) setFeedbacks(res);
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
      showCustomToast('Failed to load feedbacks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data on mount
  useEffect(() => {
    fetchFeedbacks();
    const fetchPatients = async () => {
      try {
        const data = await CustomerData();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      }
    };

    const fetchStaff = async () => {
      const hId = localStorage.getItem('HospitalId');
      const bId = localStorage.getItem('branchId');
      if (hId && bId) {
        try {
          const physiosRes = await getAllPhysios(hId, bId);
          let physioData = [];
          if (Array.isArray(physiosRes?.data?.data)) physioData = physiosRes.data.data;
          else if (Array.isArray(physiosRes?.data)) physioData = physiosRes.data;
          else if (Array.isArray(physiosRes)) physioData = physiosRes;
          setTherapistsList(physioData);

          const staffRes = await getAllFrontDeskAPI(hId, bId);
          let staffData = [];
          if (Array.isArray(staffRes?.data?.data)) staffData = staffRes.data.data;
          else if (Array.isArray(staffRes?.data)) staffData = staffRes.data;
          else if (Array.isArray(staffRes)) staffData = staffRes;
          setReceptionistsList(staffData);
        } catch (error) {
          console.error("PatientFeedback: Failed to fetch staff data", error);
        }
      }
    };
    fetchPatients();
    fetchStaff();
  }, []);

  // Use real doctors if available in context, else mock
  const doctorsList = doctorData?.data || [
    { doctorId: 'd1', doctorName: 'Dr. John Doe' },
    { doctorId: 'd2', doctorName: 'Dr. Sarah Smith' }
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Construct payload for backend
    const payload = {
      clinicId: hospitalId,
      branchId: branchId,
      patientId: form.patientId,
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      hospitalFeedback: form.hospitalFeedback.rating ? form.hospitalFeedback : null,
      doctorFeedback: form.doctorFeedback.rating ? form.doctorFeedback : null,
      therapistFeedback: form.therapistFeedback.rating ? form.therapistFeedback : null,
      receptionistFeedback: form.receptionistFeedback.rating ? form.receptionistFeedback : null,
      date: new Date().toISOString()
    };

    try {
      let res;
      if (isEditing) {
        res = await updateOverallFeedback(editingId, payload);
        showCustomToast(res?.data?.message || 'Feedback updated successfully.', 'success');
      } else {
        res = await createOverallFeedback(payload);
        showCustomToast(res?.data?.message || 'Feedback submitted successfully.', 'success');
      }
      fetchFeedbacks();
      closeForm();
    } catch (error) {
      console.error("Feedback Submission Failed", error);
      showCustomToast(error?.response?.data?.message || 'Failed to save feedback.', 'error');
    } finally {
      setLoading(false);
    }
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
    setEditingId(feedback.patientFeedbackId || feedback.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    setFeedbackIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await deleteOverallFeedback(feedbackIdToDelete);
      showCustomToast(res?.data?.message || 'Feedback deleted.', 'success');
      fetchFeedbacks();
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Failed to delete feedback", error);
      showCustomToast(error?.response?.data?.message || 'Failed to delete feedback.', 'error');
    } finally {
      setIsDeleting(false);
      setFeedbackIdToDelete(null);
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
    value: p.patientId,
    label: p.fullName || `${p.firstName} ${p.lastName}`.trim(),
    mobileNumber: p.mobileNumber
  }));

  const getTargetName = (type, id) => {
    if (type === 'Doctor') return doctorsList.find(d => (d.doctorId || d.doctorName) === id)?.doctorName || id;
    if (type === 'Therapist') {
      const t = therapistsList.find(t => (t.therapistId || t.id) === id);
      return t ? (t.fullName || t.name || `${t.firstName} ${t.lastName}`.trim()) : id;
    }
    if (type === 'Receptionist') {
      const r = receptionistsList.find(r => (r.receptionistId || r.id) === id);
      return r ? (r.fullName || r.name || `${r.firstName} ${r.lastName}`.trim()) : id;
    }
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
      {/* <ToastContainer /> */}
      <div className="pf-card">

        <div className="pf-header">
          <div className="pf-header-content">
            <h4 className='fw-bold'>Patient Rating & Feedback</h4>
            <p>Manage comprehensive feedback from patients.</p>
          </div>
          {!isFormVisible ? (
            <div className="d-flex gap-2">
              {/* <button className="pf-add-btn sf-btn-alt" onClick={() => addNotification({
                type: 'SESSION_COMPLETE',
                title: 'Full Session Completed',
                message: 'Patient has successfully completed all assigned sessions.',
                patientId: 'p1',
                patientName: 'John Doe',
                mobileNumber: '9876543210',
                bookingId: 'BK-2024-001'
              })} style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>
                <FontAwesomeIcon icon={faHistory} /> Test Notif
              </button> */}
              <button className="pf-add-btn sf-btn-alt" onClick={() => navigate('/session-feedback')}>
                <FontAwesomeIcon icon={faHistory} /> Session Feedback
              </button>
              <button className="pf-add-btn" onClick={openAddForm}>
                <FontAwesomeIcon icon={faPlus} /> Add Feedback
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="pf-add-btn sf-btn-alt"
                onClick={closeForm}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="patientFeedbackForm"
                className="pf-add-btn"
              >
                <FontAwesomeIcon icon={faCheckCircle} /> Save Feedback
              </button>
            </div>
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
                    <h6>No Feedbacks Found</h6>
                    <p>Click "Add Feedback" to create a new entry.</p>
                  </div>
                ) : (
                  <table className="pf-table pink-table">
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
                          <tr key={f.patientFeedbackId || f.id || index}>
                            <td>{index + 1}</td>
                            <td>{new Date(f.date).toLocaleDateString()}</td>
                            <td>{f.patientName}</td>
                            <td>{f.patientPhone}</td>
                            <td>{ratedEntities.join(', ')}</td>
                            <td>
                              <div className="pf-action-btns">
                                <button className="pf-btn-icon pf-btn-view" onClick={() => handleView(f)} title="View">
                                  <Eye size={14} />
                                </button>
                                <button className="pf-btn-icon pf-btn-edit" onClick={() => openEditForm(f)} title="Edit">
                                  <Edit2 size={14} />
                                </button>
                                <button className="pf-btn-icon pf-btn-delete" onClick={() => handleDelete(f.patientFeedbackId || f.id)} title="Delete">
                                  <Trash2 size={14} />
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
            <form id="patientFeedbackForm" onSubmit={handleSubmit}>

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
                      <option key={t.therapistId || t.id} value={t.therapistId || t.id}>
                        {t.fullName || t.name || `${t.firstName} ${t.lastName}`.trim()}
                      </option>
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
                      <option key={r.receptionistId || r.id} value={r.receptionistId || r.id}>
                        {r.fullName || r.name || `${r.firstName} ${r.lastName}`.trim()}
                      </option>
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
                    <span className="pf-view-value">
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.hospitalFeedback.rating)?.emoji} ({selectedFeedback.hospitalFeedback.rating}/10)
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
                    <span className="pf-view-value">
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.doctorFeedback.rating)?.emoji} ({selectedFeedback.doctorFeedback.rating}/10)
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
                    <span className="pf-view-value">
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.therapistFeedback.rating)?.emoji} ({selectedFeedback.therapistFeedback.rating}/10)
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
                    <span className="pf-view-value">
                      {RATING_OPTIONS.find(r => r.id === selectedFeedback.receptionistFeedback.rating)?.emoji} ({selectedFeedback.receptionistFeedback.rating}/10)
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

      {/* DELETE CONFIRMATION */}
      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteModalVisible(false);
            setFeedbackIdToDelete(null);
          }
        }}
      />
    </div>
  );
};

export default PatientFeedback;
