import axios from "axios"
import { BASE_URL } from "../../baseUrl"

// GET exercises
export const getTherapy = (clinicId, branchId) => axios.get(`${BASE_URL}/getByTherapyServiceClinicIdAndBranchId/${clinicId}/${branchId}`)

// GET therapies
export const getProgramService = (clinicId, branchId) => axios.get(`${BASE_URL}/program/getAll`)


// GET therapies
export const getProgramServicebyProgramId = (programId, clinicId, branchId) => axios.get(`${BASE_URL}/getTherapyServiceWithExercises/${programId}/${clinicId}/${branchId}`)

// ADD
export const addProgram = (data) =>
    axios.post(`${BASE_URL}/program/create`, data)

// UPDATE
export const updateProgram = (id, data) =>
    axios.put(`${BASE_URL}/program/update/${id}`, data)

// DELETE
export const deleteProgram = (id) =>
    axios.delete(`${BASE_URL}/program/delete/${id}`)

