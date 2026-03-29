/* eslint-disable prettier/prettier */

import axios from "axios"
import { BASE_URL, wifiUrl } from "../../../baseUrl"
 
 



/* ================= CREATE ================= */

export const createTherapyExercise = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/createTherapyExercises`,
      data
    )
    return res.data
  } catch (error) {
    console.log("createTherapyExercise error", error)
    throw error
  }
}

/* ================= GET ================= */

export const getTherapyExercise = async (
  clinicId,
  branchId,
  
) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getBytherapyExercisesClinicIdAndBranchId/${clinicId}/${branchId}`
    )
    return res.data
  } catch (error) {
    console.log("getTherapyExercise error", error)
    throw error
  }
}

/* ================= GET ================= */

export const getTherapyExerciseById = async (
  clinicId,
  branchId,
  therapyExercisesId
) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getBytherapyExercisesClinicIdAndBranchIdAndtherapyExercisesId/${clinicId}/${branchId}/${therapyExercisesId}`
    )
    return res.data
  } catch (error) {
    console.log("getTherapyExerciseById error", error)
    throw error
  }
}



/* ================= UPDATE ================= */

export const updateTherapyExercise = async (
  therapyExercisesId,
  data
) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/updateTherapyExercisesById/${therapyExercisesId}`,
      data
    )
    return res.data
  } catch (error) {
    console.log("updateTherapyExercise error", error)
    throw error
  }
}



/* ================= DELETE ================= */

export const deleteTherapyExercise = async (
  therapyExercisesId
) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/deleteTherapyExercisesById/${therapyExercisesId}`
    )
    return res.data
  } catch (error) {
    console.log("deleteTherapyExercise error", error)
    throw error
  }
}

export const getClinicData = async (clinicId, branchId, therapistId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/getByClinicIdBranchIdAndTherapistId/${clinicId}/${branchId}/${therapistId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching clinic data:", error);
    throw error;
  }
};


export const createTherapyNotes = async (data) => {
  console.log(data)
  try {
    const res = await axios.post(
      `${BASE_URL}/saveRecord`,
      data
    )
    return res.data
  } catch (error) {
    console.log("saveRecord error", error)
    throw error
  }
}

 

// ✅ DASHBOARD API
export const getDashboard = async (clinicId, branchId, therapistId) => {
  try {
    const res = await axios.get(
      `${wifiUrl}/api/physiotherapy-doctor/physiotherapy-record/dashboard/${clinicId}/${branchId}/${therapistId}`
    )
    return res.data?.data
  } catch (err) {
    console.error("Dashboard API Error:", err)
    return null
  }
}

 

export const getSessionDetails = async (clinicId, branchId, therapistId, sessionId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/getRecordByClinicIdBranchIdtherapistRecordIdAndSessionId/${clinicId}/${branchId}/${therapistId}/${sessionId}`
    )
    return res.data
  } catch (err) {
    console.error("API Error:", err)
    return null
  }
}