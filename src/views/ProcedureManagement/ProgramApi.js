import axios from "axios"
import { BASE_URL, wifiUrl } from "../../baseUrl"


// GET therapies
export const getProgramService = (clinicId, branchId) => axios.get(`${BASE_URL}/program/getBycIdAndbId/${clinicId}/${branchId}`)


// GET therapies
export const getProgramServicebyProgramId = (programId, clinicId, branchId) => axios.post(`${BASE_URL}/program/getBycIdAndbIdAndId/${clinicId}/${branchId}/${programId}`)

// ADD
export const addProgram = (data) =>
    axios.post(`${BASE_URL}/program/create`, data)

// UPDATE
export const updateProgram = (id, data) =>
    axios.put(`${BASE_URL}/program/update/${id}`, data)

// DELETE
export const deleteProgram = (id) =>
    axios.delete(`${BASE_URL}/program/delete/${id}`)

export const getprogramsfromDoctors = (clinicId, branchId, patientId, bookingId) =>
  axios.get(
    `${wifiUrl}/api/physiotherapy-doctor/getProgramAndTherapyInfo/${clinicId}/${branchId}/${patientId}/${bookingId}`
  )
