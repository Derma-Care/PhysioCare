import { BASE_URL } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'
import axios from 'axios'
// ✅ Get all pharmacists
export const getPharmacistsById = (hospitalId,branchid) => {
  return http.get(`${BASE_URL}/getPharmacistsByHospitalIdAndBranchId/${hospitalId}/${branchid}`)
}
export const getPharmacistsByDept = (pharmacistId) => {
  return http.get(`${BASE_URL}/getAllPharmacists/${pharmacistId}`)
}

// ✅ Add pharmacist (multipart/form-data)
// PharmacistAPI.js
export const addPharmacist = (payload) => {
  // return axios.post("http://localhost:8080/clinic-admin/addPharmacist", payload, {
  return http.post(`${BASE_URL}/addPharmacist`, payload, {
    headers: { "Content-Type": "application/json" },
  })
}


// ✅ Update pharmacist
export const UpdatePharmacistById = (pharmacistId, formData) => {
  return http.put(`${BASE_URL}/updatePharmacist/${pharmacistId}`, formData, {
    headers: { 'Content-Type': 'application/json' },
  })
}

// ✅ Delete pharmacist
export const DeletePharmacistById = (pharmacistId) => {
  return http.delete(`${BASE_URL}/deletePharmacist/${pharmacistId}`)
}
