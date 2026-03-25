import axios from 'axios'
import {
  BASE_URL,
  AddCustomer,
  GetAllCustomers,
  GetCustomersByHospitalId,
  GetCustomersByBranchId,
  GetCustomersByHospitalIdAndBranchId,
  Customer,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// Fetch all customers
export const CustomerData = async () => {
  const hospitalId = localStorage.getItem('HospitalId')
  try {
    const url = `${BASE_URL}/${GetAllCustomers}/${hospitalId}`
    const response = await http.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

// **Add a new customer
export const addCustomer = async (customerDTO) => {
  try {
    const url = `${BASE_URL}/${AddCustomer}` //TODO:chnage when apigetway call axios to http
    const response = await axios.post(url, customerDTO, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to add customer:', error)
    throw error
  }
}

// Update existing customer
export const updateCustomerData = async (customerId, customerDTO) => {
  try {
    const url = `${BASE_URL}/${Customer}/${customerId}`
    const response = await axios.put(url, customerDTO, {
      //TODO:chnage when apigetway call axios to http
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to update customer:', error)
    throw error
  }
}

// Delete a customer
export const deleteCustomerData = async (customerId) => {
  try {
    const url = `${BASE_URL}/${Customer}/${customerId}`
    const response = await axios.delete(url) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Failed to delete customer:', error)
    throw error
  }
}

export const CustomerByCustomerId = async (customerId) => {
  try {
    const url = `${BASE_URL}/${Customer}/${customerId}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

export const CustomerDataByHsptlId = async (hospitalId) => {
  try {
    const url = `${BASE_URL}/${GetCustomersByHospitalId}/${hospitalId}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

export const CustomerDataByBranchId = async (branchId) => {
  try {
    const url = `${BASE_URL}/${GetCustomersByBranchId}/${branchId}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}
export const CustomerByClinicNdBranchId = async (hospitalId, branchId) => {
  try {
    const url = `${BASE_URL}/${GetCustomersByHospitalIdAndBranchId}/${hospitalId}/branch/${branchId}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}
export const getCustomerByMobile = async (mobileNumber) => {}
