import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllOtherStaffs = (clinicID,branchId) => {
  return http.get(`${BASE_URL}/getWardBoysByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addOtherStaff = (data) => {
  return http.post(`${BASE_URL}/addWardBoy`, data)
}

export const updateOtherStaff = (id, data) => {
  return http.put(`${BASE_URL}/updateWardBoyById/${id}`, data)
}

export const deleteOtherStaff = (id) => {
  return http.delete(`${BASE_URL}/deleteWardBoyById/${id}`)
}
