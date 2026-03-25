import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// ------------------- Add Nurse -------------------
export const addNurse = (data) => {
  return http.post(`${BASE_URL}/addNurse`, data)
}

// ------------------- Get All Nurses by Hospital -------------------
export const getAllNurses = (hospitalId,branchId) => {
  return http.get(`${BASE_URL}/getAllNursesByBranchIdAndHospiatlId/${hospitalId}/${branchId}`)
}

// ------------------- Get Single Nurse -------------------
export const getNurse = (hospitalId, nurseId) => {
  return http.get(`${BASE_URL}/getNurse/${hospitalId}/${nurseId}`)
}

// ------------------- Update Nurse -------------------

export const updateNurse = (hospitalId, nurseId, data) => {
  return http.put(`${BASE_URL}/updateNurse/${nurseId}`, data, {})
}

// ------------------- Delete Nurse -------------------
export const deleteNurse = (hospitalId, nurseId) => {
  return http.delete(`${BASE_URL}/deleteNurse/${hospitalId}/${nurseId}`)
}

// ------------------- Nurse Login -------------------
export const nurseLogin = (data) => {
  return http.post(`${BASE_URL}/nurseLogin`, data)
}

// ------------------- Reset Nurse Login Password -------------------
export const resetNurseLogin = (data) => {
  return http.post(`${BASE_URL}/resetNurseLogin`, data)
}
