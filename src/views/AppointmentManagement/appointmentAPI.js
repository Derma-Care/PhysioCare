// import axios from 'axios'

// import {
//   Booking_service_Url,
//   DeleteBookings,
//   BASE_URL,
//   getAllBookedServices,
//   GetBookingBy_ClinicId,
// } from '../../baseUrl'

// export const AppointmentData = async () => {
//   console.log('appointdata calling')
//   try {
//     const response = await axios.get(`${Booking_service_Url}/${getAllBookedServices}`)
//     console.log(`appointdata calling ${response.data}`)

//     console.log(response.data)

//     return response.data
//   } catch (error) {
//     console.error('Error fetching service data:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }

// export const deleteBookingData = async (id) => {
//   try {
//     const response = await axios.delete(`${Booking_service_Url}/${DeleteBookings}/${id}`, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     console.log('Category deleted successfully:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error deleting booking:', error.response?.data || error)
//     throw error
//   }
// }

// export const GetdoctorsByClinicIdData = async (doctorId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/doctor/${doctorId}`)
//     console.log(`appointdata calling ${response.data}`)
//     return response
//   } catch (error) {
//     console.error('Error fetching doctor by ID:', error)
//     throw error
//   }
// }

// export const GetBookingByClinicIdData = async (id) => {
//   console.log('GetBookingByClinicId calling for clinicId:', id)
//   // const url = `${Booking_service_Url}/${GetBookingBy_ClinicId}/${id}`
//   // console.log(url)
//   try {
//     const response = await axios.get(`${Booking_service_Url}/${GetBookingBy_ClinicId}/${id}`)
//     console.log('GetBookingByClinicId response:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error fetching booking by clinicId:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }

import axios from 'axios'
import {
  Booking_service_Url,
  DeleteBookings,
  BASE_URL,
  getAllBookedServices,
  GetBookingBy_ClinicId,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const AppointmentData = async () => {
  const hospitalId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')
  try {
    const response = await axios.get(`${Booking_service_Url}/${getAllBookedServices}`) //TODO:chnage when apigetway call axios to http
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

export const GetBookingByClinicIdData = async (id) => {
  const hID = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')
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
  const hID = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')
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
