import axios from 'axios'
import {
  AddDisease,
  AllDiseases,
  BASE_URL,
  DeleteDisease,
  GetDiseasesByHId,
  UpdateDisease,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const DiseaseData = async () => {
  try {
    const response = await http.get(`/${AllDiseases}`)
    console.log('Disease data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching disease data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const TestdDiseaseByHId = async (hospitalId) => {
  try {
    const response = await http.get(`/${GetDiseasesByHId}/${hospitalId}`)
    console.log('test data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching test data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
// ✅ 2. Add a new disease
// ✅ Add a new disease
export const postDiseaseData = async (diseaseData) => {
  try {
    const requestData = {
      diseaseName: diseaseData.diseaseName || '',
      hospitalId: diseaseData.hospitalId || '',
      probableSymptoms: diseaseData.probableSymptoms || '',
      notes: diseaseData.notes || '',
    }

    const response = await http.post(`/${AddDisease}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Add Disease Response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error adding disease:', error.response?.data || error)
    throw error
  }
}

export const updateDiseaseData = async (updatedDisease, id, hospitalId) => {
  try {
    const requestData = {
      diseaseName: updatedDisease.diseaseName || '',
      probableSymptoms: updatedDisease.probableSymptoms || '',
      notes: updatedDisease.notes || '',
      hospitalId: hospitalId,
    }

    const response = await http.put(`/${UpdateDisease}/${id}/${hospitalId}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error updating disease:', error.response?.data || error)
    throw error
  }
}

// ✅ 4. Delete disease
export const deleteDiseaseData = async (diseaseId, hospitalId) => {
  try {
    const response = await http.delete(`/${DeleteDisease}/${diseaseId}/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Disease deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting disease:', error.response?.data || error)
    throw error
  }
}
