import { BASE_URL } from '../baseUrl'

const API_URL = `${BASE_URL}/follow-options/getAll`

export const getFollowOptions = async () => {
  try {
    const response = await http.get(API_URL)
    if (response.data.success) {
      return response.data.data[0].followOptions // returns array of options
    } else {
      console.error('Failed to fetch follow options')
      return []
    }
  } catch (error) {
    console.error('Error fetching follow options:', error)
    return []
  }
}
