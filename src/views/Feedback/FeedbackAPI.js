import { http } from '../../Utils/Interceptors';
import { BASE_URL } from '../../baseUrl';

/**
 * ==========================================
 * OVERALL PATIENT FEEDBACK (Hospital, Doctor, etc.)
 * ==========================================
 */

// GET: Fetch all overall feedback records
export const getAllOverallFeedback = (CID, BID) => {
  return http.get(`${BASE_URL}/getByPatientFeedbackClinicIdAndBranchId/${CID}/${BID}`);
};

// POST: Create new overall feedback
export const createOverallFeedback = (payload) => {
  return http.post(`${BASE_URL}/createPatientFeedback`, payload);
};

// PUT: Update existing overall feedback
export const updateOverallFeedback = (id, payload) => {
  return http.put(`${BASE_URL}/updatePatientFeedback/${id}`, payload);
};

// DELETE: Remove overall feedback record
export const deleteOverallFeedback = (id) => {
  return http.delete(`${BASE_URL}/deletePatientFeedback/${id}`);
};


/**
 * ==========================================
 * SESSION FEEDBACK (Milestones, Progress)
 * ==========================================
 */

// GET: Fetch all submitted session feedback records
export const getAllSessionFeedback = (CID, BID) => {
  return http.get(`${BASE_URL}/getAllByUsingClinicIdAndBranchId/${CID}/${BID}`);
};

// GET: Fetch patients needing feedback details
export const getFeedbackDetails = (clinicId, branchId) => {
  return http.get(`${BASE_URL}/getFeedbackDetails/${clinicId}/${branchId}`);
};

// POST: Create new session feedback
export const createSessionFeedback = (payload) => {
  return http.post(`${BASE_URL}/createFeedback`, payload);
};

// PUT: Update existing session feedback
export const updateSessionFeedback = (id, payload) => {
  return http.put(`${BASE_URL}/updateFeedback/${id}`, payload);
};

// DELETE: Remove session feedback record
export const deleteSessionFeedback = (id) => {
  return http.delete(`${BASE_URL}/deleteFeedback/${id}`);
};