import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllFrontDeskAPI = (clinicID,branchId) => {
  return http.get(`/getReceptionistsByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addFrontDeskAPI = (data) => {
  return http.post(`/createReceptionist`, data)
}

export const updateFrontDeskAPI = (id, data) => {
  return http.put(`/updateReceptionist/${id}`, data)
}

export const deleteFrontDeskAPI = (id) => {
  return http.delete(`/deleteReceptionist/${id}`)
}
