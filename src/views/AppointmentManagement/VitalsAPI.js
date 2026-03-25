import axios from 'axios'
import {
  AddVitals,
  BASE_URL,
  DeleteVitals,
  GetVitalsByPatientId,
  UpdateVitals,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const VitalsDataById = async (bookingId, patientId) => {
  try {
    const response = await http.get(`/getVitals/${bookingId}/${patientId}`)
    console.log('Fetched Vitals:', response.data)
    return response.data.data // 👈 must return this
  } catch (error) {
    console.error('Error fetching vitals:', error.response?.data || error.message)
    throw error
  }
}

// --- 1. Modified postCategoryData function ---
export const postVitalsData = async (VitalsData, bookingId) => {
  try {
    const requestData = {
      height: VitalsData.height || '',
      weight: VitalsData.weight || '',
      bloodPressure: VitalsData.bloodPressure || '',
      temperature: VitalsData.temperature || '',
      bmi: VitalsData.bmi || '',
    }

    const url = `/${AddVitals}/${bookingId}`
    console.log('Final API URL:', url) // 👈 debug
    console.log('API Request Body:', requestData)

    const response = await http.post(url, requestData, {
      headers: { 'Content-Type': 'application/json' },
    })

    console.log('API Response:', response)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response?.data || error.message)
    throw error
  }
}

export const updateVitalsData = async (updatedVitals, bookingId, patientId) => {
  try {
    const response = await http.put(`/${UpdateVitals}/${bookingId}/${patientId}`, updatedVitals, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error updating Vitals:', error)
    throw error
  }
}

export const deleteVitalsData = async (bookingId, patientId) => {
  try {
    const response = await http.delete(`/${DeleteVitals}/${bookingId}/${patientId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Vitals deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting patientId:', error.response ? error.response.data : error)
    throw error
  }
}
