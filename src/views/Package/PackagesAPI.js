import axios from "axios"
import { BASE_URL } from "../../baseUrl"

// GET exercises
export const getExercises = (clinicId, branchId) => axios.get(`${BASE_URL}/getBytherapyExercisesClinicIdAndBranchId/${clinicId}/${branchId}`)

// GET therapies
export const getTherapiesService = (clinicId, branchId) =>
  axios.get(
    `${BASE_URL}/getPackageByClinicIdAndBranchId/${clinicId}/${branchId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )


// GET therapies
export const getTherapiesServicebytherapyId = (packageId, clinicId, branchId) => axios.get(`${BASE_URL}/getPackageWithProgramsByUsingClinicIdBranchIdAndPackageId/${clinicId}/${branchId}/${packageId}`)

// ADD
export const addTherapy = (data) =>
  axios.post(
    `${BASE_URL}/createPackageManagemet`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

// UPDATE
export const updateTherapy = (packageId, data) =>
    axios.put(`${BASE_URL}/updatePackageByPackageId/${packageId}`, data)

// DELETE
export const deleteTherapy = (packageId) =>
    axios.delete(`${BASE_URL}/deletePackageByPackageId/${packageId}`)

