import axios from 'axios'
import {
  AddCategory,
  BASE_URL,
  CategoryAllData,
  UpdateCategory,
  deleteCategory,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const CategoryData = async () => {
  try {
    const response = await http.get(`/${CategoryAllData}`)

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

export const postCategoryData = async (categoryData) => {
  try {
    console.log('Sending data to API:', categoryData)

    const requestData = {
      categoryName: categoryData.categoryName || '',
      categoryImage: categoryData.categoryImage || '',
    }

    console.log('Data being sent:', requestData)

    const response = await http.post(`/${AddCategory}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    alert(
      `Error: ${error.response?.status} - ${error.response?.data?.message || error.response?.statusText}`,
    )
    throw error
  }
}

export const updateCategoryData = async (categoryId, updatedCategory) => {
  console.log('Category ID:', categoryId)
  console.log('Updated Category Data:', updatedCategory)

  try {
    const response = await http.put(
      `/${UpdateCategory}/${categoryId}`,updatedCategory,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Category updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export const deleteCategoryData = async (categoryId) => {
  try {
    const response = await http.delete(`/${deleteCategory}/${categoryId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Category deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting category:', error.response ? error.response.data : error)
    throw error
  }
}
