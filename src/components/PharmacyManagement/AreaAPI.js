// import https from 'https'
import { http, https } from '../../Utils/Interceptors'
import { wifiUrl } from '../../baseUrl'

// ======================================================
// GET ALL Cities
// ======================================================
export const Areadata = async () => {
  try {
    const response = await http.get(`${wifiUrl}/api/pharmacy/area/all`)
    console.log('area data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching area data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const getAreabyId = async (id) => {
  try {
    const response = await https.get(`/api/pharmacy/area/getById/${id}`)
    console.log('area data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching area data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const getAreabyCityId = async (cityId) => {
  try {
    const response = await http.get(`${wifiUrl}/api/pharmacy/area/city/${cityId}`)
    console.log('area data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching area data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

// ======================================================
// POST - ADD area
// ======================================================
export const postAreaData = async (data) => {
  try {
    const requestData = {
      cityId: data.cityId,
      cityName: data.cityName,
      areaNames: data.areaNames, // ✅ correct array
    }

    const response = await http.post(`${wifiUrl}/api/pharmacy/area/save`, requestData)
    return response.data
  } catch (error) {
    console.error('Area Save Error:', error)
    throw error
  }
}

// ======================================================
// PUT - UPDATE area
// ======================================================
export const updateCityData = async (updatedCity, id) => {
  try {
    const requestData = {
      cityId: data.cityId || '',
      cityName: data.cityName || '',
      areaNames: data.areaNames || [],
    }

    const response = await https.put(`/api/pharmacy/area/update/${id}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating area:', error.response?.data || error)
    throw error
  }
}
export const deleteAreaeData = async (id) => {
  try {
    const response = await https.delete(`/api/pharmacy/city/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Area deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting area:', error.response?.data || error)
    throw error
  }
}
