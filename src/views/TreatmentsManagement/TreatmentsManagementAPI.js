import axios from 'axios'
import {
  AddTreatment,
  AllTreatment,
  BASE_URL,
  DeleteTreatment,
  GetTreatmentsByHId,
  UpdateTreatment,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const TreatmentData = async () => {
  try {
    const response = await http.get(`/${AllTreatment}`)
    console.log('treatment data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching treatment data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const TreatmentDataById = async (hospitalId) => {
  try {
    const response = await http.get(`/${GetTreatmentsByHId}/${hospitalId}`)
    console.log('treatment data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching treatment data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const postTreatmentData = async (treatmentData) => {
  try {
    const requestData = {
      treatmentName: treatmentData.treatmentName || '', // Consider renaming this to treatmentName in the backend
      hospitalId: treatmentData.hospitalId || '',
    }

    const response = await http.post(`/${AddTreatment}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Treatment added successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error adding treatment:', error.response)
    throw error
  }
}

export const updateTreatmentData = async (updatedTreatment, treatmentId, hospitalId) => {
  try {
    // Map frontend fields to backend expected format
    const payload = {
      treatmentName: updatedTreatment.treatmentName, // Match backend field name
    }

    const response = await http.put(`/${UpdateTreatment}/${treatmentId}/${hospitalId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating treatment:', error.response || error)
    throw error
  }
}

export const deleteTreatmentData = async (treatmentId, hospitalId) => {
  try {
    const response = await http.delete(`/${DeleteTreatment}/${treatmentId}/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Treatment deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting treatment:', error.response ? error.response.data : error)
    throw error
  }
}
