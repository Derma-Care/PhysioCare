import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// ✅ All names match your imports in ReferDoctorManagement.js now

export const getAllReferDoctors = (clinicId) => {
  return http.get(`${BASE_URL}/getReferralDoctorsByClinicId/${clinicId}`,)
}

export const addReferDoctor = (data) => {
  return http.post(`${BASE_URL}/addReferralDoctor`, data)
}

export const updateReferDoctor = (id, data) => {
  return http.put(`${BASE_URL}/updateReferralDoctorById/${id}`, data)
}

export const deleteReferDoctor = (id) => {
  return http.delete(`${BASE_URL}/deleteReferralDoctorById/${id}`)
}