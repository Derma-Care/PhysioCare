

import axios from 'axios'
import {
  Booking_service_Url,
  DeleteBookings,
  BASE_URL,
  getAllBookedServices,
  GetBookingBy_ClinicId,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// export const AppointmentData = async () => {
//   const hospitalId = sessionStorage.getItem('HospitalId')
//   const branchId = sessionStorage.getItem('branchId')
//   try {
//     const response = await http.get(`/getAllbookingsDetailsByClinicAndBranchId/${hospitalId}/${branchId}`) //TODO:chnage when apigetway call axios to http
//     return response.data
//   } catch (error) {
//     console.error('Error fetching service data:', error.message)
//     throw error
//   }
// }

export const AppointmentData = async (branchIdOverride) => {
  const hospitalId = sessionStorage.getItem('HospitalId')
  const branchId = branchIdOverride || sessionStorage.getItem('branchId')
  try {
    const response = await http.get(`/filter/status/${hospitalId}/${branchId}`) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    throw error
  }
}


export const deleteBookingData = async (id) => {
  try {
    const response = await axios.delete(`${Booking_service_Url}/${DeleteBookings}/${id}`, {
      //TODO:chnage when apigetway call axios to http
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Error deleting booking:', error.response?.data || error)
    throw error
  }
}

export const GetdoctorsByClinicIdData = async (doctorId) => {
  try {
    const response = await http.get(`${BASE_URL}/doctor/${doctorId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching doctor by ID:', error)
    throw error
  }
}

export const GetBookingByClinicIdData = async (id, branchIdOverride) => {
  const hID = sessionStorage.getItem('HospitalId')
  const branchId = branchIdOverride || sessionStorage.getItem('branchId')
  console.log(id)
  try {
    const response = await axios.get(
      `${BASE_URL}/getAllbookingsDetailsByClinicAndBranchId/${hID}/${branchId}`,
    ) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Error fetching booking by clinicId:', error.message)
    throw error
  }
}
export const GetTodayBooking = async (id, branchIdOverride) => {
  const hID = sessionStorage.getItem('HospitalId')
  const branchId = branchIdOverride || sessionStorage.getItem('branchId')
  console.log(id)
  try {
    const response = await axios.get(
      `${BASE_URL}/getTodayBookingsByClinicIdAndBranchId/${hID}/${branchId}`,
    ) //TODO:chnage when apigetway call axios to http
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching booking by clinicId:', error.message)
    throw error
  }
}



// Assume `bookingDetails` is a JS object with the same structure as your Dart model

export const followUpBookings = async (bookingDetails) => {
  console.log('Request URL:', BASE_URL)
  console.log('Request payload:', bookingDetails)

  try {
    const response = await axios.post(BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDetails),
    })

    const responseBody = await response.text()
    console.log('Response body:', responseBody)

    if (response.ok) {
      console.log('Booking posted successfully!')
      // Parse JSON if available
      const responseData = responseBody ? JSON.parse(responseBody) : null
      return responseData
    } else {
      console.log('Failed to post booking. Status code:', response.status)
      return null
    }
  } catch (error) {
    console.log('Error posting booking:', error)
    return null
  }
}
export const bookingUpdate = async (bookingDetails) => {
  console.log('Request URL:', `${BASE_URL}/updateAppointmentBasedOnBookingId`)
  console.log('Request payload:', bookingDetails)

  try {
    const response = await axios.put(
      `${BASE_URL}/updateAppointmentBasedOnBookingId`,
      bookingDetails, // 👈 send object directly
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Response data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error posting booking:', error.response?.data || error.message)
    return null
  }
}

export const GetBookingInprogress = async () => {
  const hID = sessionStorage.getItem('HospitalId')
  const branchId = sessionStorage.getItem('branchId')
  try {
    const response = await axios.get(`${BASE_URL}/appointments/byIds/${hID}/${branchId}`) //TODO:chnage when apigetway call axios to http
    console.log(`${BASE_URL}/appointments/byIds/${hID}/${branchId}`)
    console.log(response.data.data)
    return response.data.data
  } catch (error) {
    console.error('Error fetching booking by clinicId:', error.message)
    throw error
  }
}
