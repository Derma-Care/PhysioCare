import { BASE_URL } from "../../baseUrl"
import { http } from "../../Utils/Interceptors"


// ✅ ADD PACKAGE
export const addPackage = (data) => {
  return http.post(`${BASE_URL}/createPackage`, data)
}

// ✅ GET ALL PACKAGES
export const getAllPackages = () => {
  return http.get(`${BASE_URL}/getAllPackages`)
}

// ✅ UPDATE PACKAGE
export const updatePackage = (packageId, data) => {
  return http.put(`${BASE_URL}/updatePackageById/${packageId}`, data)
}

// ✅ DELETE PACKAGE
export const deletePackage = (packageId) => {
  return http.delete(`${BASE_URL}/deletePackageById/${packageId}`)
}