import axios from "axios"
import { BASE_URL } from "../../baseUrl"

// GET exercises
export const getExercises = (clinicId, branchId) => axios.get(`${BASE_URL}/getBytherapyExercisesClinicIdAndBranchId/${clinicId}/${branchId}`)

// GET therapies
export const getTherapiesService = (clinicId, branchId) => axios.get(`${BASE_URL}/getByTherapyServiceClinicIdAndBranchId/${clinicId}/${branchId}`)


// GET therapies
export const getTherapiesServicebytherapyId = (therapyId, clinicId, branchId) => axios.get(`${BASE_URL}/getTherapyServiceWithExercises/${therapyId}/${clinicId}/${branchId}`)

// ADD
export const addTherapy = (data) =>
    axios.post(`${BASE_URL}/createTherapyService`, data)

// UPDATE
export const updateTherapy = (id, data) =>
    axios.put(`${BASE_URL}/updateByTherapyServieId/${id}`, data)

// DELETE
export const deleteTherapy = (id) =>
    axios.delete(`${BASE_URL}/deleteByTherapyServiceId/${id}`)

