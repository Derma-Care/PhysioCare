import axios from 'axios'
import { BASE_URL ,getData,postData} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const getReassign = async () => {
  try {
    const response = await http.get(`/${getData}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const postReassign = async (data) => {
  try {
    const response = await http.post(`/${postData}`,data)
    console.log(response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
