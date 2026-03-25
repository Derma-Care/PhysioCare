import axios from 'axios'
import { http } from '../Utils/Interceptors'
import { wifiUrl } from '../baseUrl'

/* eslint-disable prettier/prettier */
export const fetchMedicinesApi = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/api/pharmacy/medicines/getAllMedicines`)

    if (!response || response.status !== 200) {
      throw new Error('Failed to fetch medicines')
    }

    const data = response.data
    console.log(data)
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
 
 