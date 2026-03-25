 
import { wifiUrl } from '../baseUrl'
import { http } from '../Utils/Interceptors'

export const postBooking = (data) => {
  return http.post(`${wifiUrl}/api/customer/bookService`,data)
}