import { BASE_URL, wifiUrl } from '../baseUrl'

// export const getInProgressBookings = async (patientId) => {
//   try {
//     const response = await axios.get(
//       `${wifiUrl}/api/customer/bookings/Inprogress/patientId/${patientId}`
//     )

//     if (response.status === 200) {
//       console.log('In-progress bookings:', response.data.data)
//       return response.data.data
//     } else {
//       console.error('Unexpected response:', response)
//       return []
//     }
//   } catch (error) {
//     console.error('Error fetching in-progress bookings:', error)
//     throw error
//   }
// }

import { http } from '../Utils/Interceptors'

export const getInProgressfollowupBookings = (patientId) => {
  const clinicid = localStorage.getItem('HospitalId')

  return http.get(`${BASE_URL}/bookings/Inprogress/patientId/${patientId}/${clinicid}`)
}
