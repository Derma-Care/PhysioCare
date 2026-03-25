import axios from 'axios'
import {
  BASE_URL,
  Doctor_Url,
  getAllDCtrNotifications,
  getDoctorIdAndNotifications,
  NoficationResponse,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const DoctorNotifyData = async (hospitalId, doctorId) => {
  console.log('DoctorNotifyData calling...')
  try {
    const response = await axios.get(
      `${Doctor_Url}/${getAllDCtrNotifications}/${hospitalId}/${doctorId}`, //TODO:chnage when apigetway call axios to http
    )
    console.log('DoctorNotifyData response:', response.data)

    // Return the full response object, not just response.data
    return response
  } catch (error) {
    console.error('Error fetching doctor notifications:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
      console.error('Error Response Headers:', error.response.headers)
    } else if (error.request) {
      console.error('Error Request:', error.request)
    } else {
      console.error('Error Message:', error.message)
    }
    throw error // Re-throw the error so the calling component can catch it
  }
}

export const postNotifyData = async (requestData) => {
  try {
    console.log('Sending data to API')
    const response = await axios.post(`${Doctor_Url}/${NoficationResponse}`, requestData, {
      //TODO:chnage when apigetway call axios to http
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    alert(
      `Error: ${error.response?.status} - ${error.response?.data?.message || error.response?.statusText}`,
    )
    throw error
  }
}

export const DoctorId_NotificationsData = async (hospitalId) => {
  try {
    const res = await http.get(`/doctors/hospitalById/${hospitalId}`)
    return res
  } catch (error) {
    console.error('Error fetching doctor notifications:', error)
    throw error
  }
}
