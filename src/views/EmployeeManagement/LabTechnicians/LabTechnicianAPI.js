import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllLabTechnicians = (clinicID, branchId) => {
  return http.get(`${BASE_URL}/getLabTechniciansByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addLabTechnician = (data) => {
  return http.post(`${BASE_URL}/addLabTechnician`, data)
}

export const updateLabTechnician = (id, data) => {
  return http.put(`${BASE_URL}/updateById/${id}`, data)
}

export const deleteLabTechnician = (id) => {
  return http.delete(`${BASE_URL}/deleteById/${id}`)
}
