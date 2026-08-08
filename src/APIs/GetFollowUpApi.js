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
  const clinicid = sessionStorage.getItem('HospitalId')

  return http.get(`${BASE_URL}/bookings/Inprogress/patientId/${patientId}/${clinicid}`)
}


export const getBookingsForFollowUps = (bookingId) => {
  const clinicid = sessionStorage.getItem('HospitalId')

  return http.get(`${BASE_URL}/getBookedServiceById/${bookingId}`)
}

export const getBookingsTodayFollowUps = (branchIdOverride, date) => {
  const clinicid = sessionStorage.getItem('HospitalId')
  const branchId = branchIdOverride || sessionStorage.getItem('branchId')

  // Use provided date, or default to today's date
  const queryDate = date || new Date().toISOString().split('T')[0]

  return http.get(`${BASE_URL}/customDate/${clinicid}/${branchId}/${queryDate}`)
}

export const getUpcomingFollowUps = (branchIdOverride) => {
  const clinicid = sessionStorage.getItem("HospitalId")
  const branchId = branchIdOverride || sessionStorage.getItem("branchId")

  return http.get(`${BASE_URL}/upcoming/${clinicid}/${branchId}/2`)
}



export const getDateRangeFollowUps = (fromDate, toDate, branchIdOverride) => {
  const clinicid = sessionStorage.getItem("HospitalId")
  const branchId = branchIdOverride || sessionStorage.getItem("branchId")
  return http.get(
    `${BASE_URL}/dateRange/${clinicid}/${branchId}/${fromDate}/${toDate}`
  );
};
