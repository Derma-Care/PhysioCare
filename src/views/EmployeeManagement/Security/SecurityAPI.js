import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllSecuritys = (clinicID, branchId) => {
  return http.get(`${BASE_URL}/getSecurityStaffByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addSecurity = (data) => {
  return http.post(`${BASE_URL}/addSecurityStaff`, data)
}

export const updateSecurity = (id, data) => {
  return http.put(`${BASE_URL}/updateSecurityStaffById/${id}`, data)
}

export const deleteSecurity = (id) => {
  return http.delete(`${BASE_URL}/deleteSecurityStaffById/${id}`)
}
