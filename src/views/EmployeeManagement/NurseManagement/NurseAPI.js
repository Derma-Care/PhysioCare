import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// ------------------- Add Physio -------------------
export const addPhysio = (data) => {
  return http.post(`${BASE_URL}/addTherapist`, data)
}

// ------------------- Get All Physios by Hospital -------------------
export const getAllPhysios = (hospitalId,branchId) => {
  return http.get(`${BASE_URL}/getByTherapistClinicIdAndBranchId/${hospitalId}/${branchId}`)
}

// ------------------- Get Single Physio -------------------
export const getPhysio = (hospitalId, physioId) => {
  return http.get(`${BASE_URL}/getPhysio/${hospitalId}/${physioId}`)
}

// ------------------- Update Physio -------------------

export const updatePhysio = ( therapistId, data) => {
  return http.put(`${BASE_URL}/updateByTherapistId/${therapistId}`, data, {})
}

// ------------------- Delete Physio -------------------
export const deletePhysio = (therapistId) => {
  return http.delete(`${BASE_URL}/deleteByTherapistId/${therapistId}`)
}

// ------------------- Nurse Login -------------------
export const nurseLogin = (data) => {
  return http.post(`${BASE_URL}/nurseLogin`, data)
}

// ------------------- Reset Nurse Login Password -------------------
export const resetNurseLogin = (data) => {
  return http.post(`${BASE_URL}/resetNurseLogin`, data)
}
