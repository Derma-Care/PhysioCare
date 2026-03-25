// import https from 'https'
import { http, https } from '../../Utils/Interceptors'
import { wifiUrl } from '../../baseUrl'

// ======================================================
// GET ALL Cities
// ======================================================
export const Citydata = async () => {
  try {
    const response = await http.get(`${wifiUrl}/api/pharmacy/city/all`)
    console.log('city data:', response.data.data)
    return response.data.data || [] // <-- return the array of cities
  } catch (error) {
    console.error('Error fetching city data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const getCitybyId = async (id) => {
  try {
    const response = await https.get(`/api/pharmacy/city/all`)
    console.log('city data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching city data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}


// ======================================================
// POST - ADD city
// ======================================================
export const postCityData = async (data) => {
 try {
    const response = await http.post(
      `${wifiUrl}/api/pharmacy/city/save`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Add city Response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error adding city:', error.response?.data || error)
    throw error
  }
}

// ======================================================
// PUT - UPDATE city
// ======================================================
export const updateCityData = async (updatedCity, id) => {
  try {
    const requestData = {
      cityName: updatedCity.cityName || '',
    }

    const response = await https.put(`/api/pharmacy/city/update/${id}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating city:', error.response?.data || error)
    throw error
  }
}

export const deleteCityData = async (id) => {
  try {
    const response = await https.delete(`/api/pharmacy/city/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('City deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting city:', error.response?.data || error)
    throw error
  }
}