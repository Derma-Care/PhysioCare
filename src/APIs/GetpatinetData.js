import { BASE_URL, wifiUrl } from '../baseUrl'
import { http } from '../Utils/Interceptors'

export const getBookingsByPatientId = (patientId) => {
  const clinicid = localStorage.getItem('HospitalId')
  return http.get(`${wifiUrl}/clinic-admin/bookings/byInput/${patientId}/${clinicid}`)
}
