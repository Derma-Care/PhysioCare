import { BASE_URL, wifiUrl } from '../baseUrl'
import { http } from '../Utils/Interceptors'



export const getBookingsByPatientId = (patientId) => {
  const clinicid = sessionStorage.getItem('HospitalId')
  return http.get(`${BASE_URL}/bookings/byInput/${patientId}/${clinicid}`)
}

export const getBookingByPatientId = (patientId) => {
  const clinicid = sessionStorage.getItem('HospitalId')
  return http.get(`${BASE_URL}/customer/patientId/${patientId}/${clinicid}`)
}

export const sendReceiptEmail = (payload) => {
  return http.post(`${BASE_URL}/send-patient-email`, payload)
}

