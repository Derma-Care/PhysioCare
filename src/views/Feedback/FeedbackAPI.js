import { http } from '../../Utils/Interceptors';
import { BASE_URL } from '../../baseUrl';

// GET: Fetch all feedback details for a clinic/branch
export const getFeedbackDetails = (clinicId, branchId) => {
  return http.get(`${BASE_URL}/getFeedbackDetails/${clinicId}/${branchId}`);
};

// POST: Submit session feedback
export const submitSessionFeedback = (payload) => {
  return http.post(`${BASE_URL}/addFeedback`, payload);
};

// PUT: Update session feedback
export const updateSessionFeedback = (id, payload) => {
  return http.put(`${BASE_URL}/updateFeedback/${id}`, payload);
};

// DELETE: Delete session feedback
export const deleteSessionFeedback = (id) => {
  return http.delete(`${BASE_URL}/deleteFeedback/${id}`);
};
