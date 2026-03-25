import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

export const getAllAdmins = (clinicId,branchId) => {
  return http.get(`${BASE_URL}/getAllAdministrators/${clinicId}/${branchId}`)
}
export const addAdmin = (data) => {
  return http.post(`${BASE_URL}/addAdministrator`, data)
}
export const UpdateAdmin = (clinicId, adminId, data) => {
  return http.put(`${BASE_URL}/updateAdministrator/${clinicId}/${adminId}`, data)
}
export const DeleteAdmin = (clinicId, adminId) => {
  return http.delete(`${BASE_URL}/deleteAdministrator/${clinicId}/${adminId}`)
}
