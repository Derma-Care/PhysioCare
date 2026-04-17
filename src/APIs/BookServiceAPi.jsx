 
import { BASE_URL, wifiUrl } from '../baseUrl'
import { http } from '../Utils/Interceptors'

export const postBooking = (data) => {
  return http.post(`${BASE_URL}/physioAppointment`,data)
}

export const followUPBooking = (data) => {
  return http.post(`${wifiUrl}/api/customer/bookService`,data)
}
