import axios from 'axios'
import {
  AddConsent,
  BASE_URL,
  DeleteConsent,
  EditConsent,
  GetGenericConsent,
  GetProcedureConsent,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'
export const AddConsentFormData = async (consentData, hospitalId, consentFormType) => {
  try {
    const response = await http.post(
      `${AddConsent}/${hospitalId}/${consentFormType}`,
      consentData,
      { headers: { 'Content-Type': 'application/json' } },
    )
    console.log('Add API response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response || error.message)
    throw error
  }
}

export const updateConsentData = async (updatedConsent, hospitalId, consentFormType) => {
  try {
    const response = await http.put(
      `${EditConsent}/${hospitalId}/${consentFormType}`,
      updatedConsent,
      { headers: { 'Content-Type': 'application/json' } },
    )
    return response.data
  } catch (error) {
    console.error('Error updating consentForm:', error.response || error.message)
    throw error
  }
}

export const deleteConsentData = async (id) => {
  try {
    const response = await http.delete(`${DeleteConsent}/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    })
    console.log('ConsentForm deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting ConsentForm:', error.response || error.message)
    throw error
  }
}

export const GetGenericFormData = async (hospitalId, consentFormType) => {
  try {
    const response = await http.get(`${GetGenericConsent}/${hospitalId}/${consentFormType}`)
    console.log('Fetched data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching test data:', error.response || error.message)
    throw error
  }
}

export const GetProcedureFormData = async (hospitalId, consentFormType) => {
  try {
    const response = await http.get(`${GetProcedureConsent}/${hospitalId}/${consentFormType}`)
    console.log('Procedure Consent Form data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching Procedure Form data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
