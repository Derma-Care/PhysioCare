import axios from 'axios'

import { BASE_URL, ClinicAllData, clinicPost } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const clinicData = async () => {
  try {
    const response = await http.get(`${ClinicAllData}`)
    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

// export const CategoryData = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/${Category}`)

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

export const postClinicData = async (serviceData) => {
  try {
    console.log('Sending data to API:', serviceData)

    const response = await http.post(`/${clinicPost}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    // alert(
    //   `Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`,
    // )
  }
}

export const updateServiceData = async (serviceId, serviceData) => {
  console.log(serviceId, serviceData)
  try {
    const response = await http.put(`/updateClinic/${serviceId}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Service updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

// export const deleteServiceData = async (serviceId) => {
//   try {
//     console.log('Service name:', serviceId)
//     const response = await axios.delete(`${BASE_URL}/${deleteService}/${serviceId}`)

//     console.log('Service deleted successfully:', response.data)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }
