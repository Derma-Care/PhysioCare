import axios from "axios"

const API = "http://localhost:5000/api"

export const getAssignedPatients = (therapistId) =>
  axios.get(`${API}/therapist/assigned/${therapistId}`)

export const getSessions = (therapistId, type) =>
  axios.get(`${API}/therapist/sessions/${therapistId}?type=${type}`)

export const updateSession = (data) =>
  axios.post(`${API}/therapist/session/update`, data)

export const uploadMedia = (formData) =>
  axios.post(`${API}/therapist/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })