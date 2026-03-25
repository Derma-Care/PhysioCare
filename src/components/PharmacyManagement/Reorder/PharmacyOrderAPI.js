import axios from 'axios'
import { wifiUrl } from '../../../baseUrl'

export const createOrderAPI = async (data) => {
  const res = await axios.post(`${wifiUrl}/api/pharmacy/orders/createOrder`, data)
  return res.data
}

export const getAllOrdersAPI = async (clinicId, branchId) => {
  const res = await axios.get(
    `${wifiUrl}/api/pharmacy/orders/getByClinicIdAndBranchId/${clinicId}/${branchId}`,
  )

  return res.data
}

export const getAllOrdersAPIBySupplierId = async (clinicId, branchId, supplierId) => {
  const res = await axios.get(
    `${wifiUrl}/api/pharmacy/orders/getByClinicIdBranchIdSupplierId/${clinicId}/${branchId}/${supplierId}`,
  )

  return res.data
}
