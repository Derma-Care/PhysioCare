import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// ------------------------------------------------------------------
// ✅ Fetch all opSales for a clinic
// ------------------------------------------------------------------
export const getAllOpSales = async () => {
  const clinicId = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')

  if (!clinicId) {
    console.error('❌ No HospitalId found in localStorage')
    return []
  }

  try {
    const response = await axios.get(`${BASE_URL}/op-sales/getAllOpSales/${clinicId}/${branchId}`)
    console.log('📦 All OpSales Response:', response.data)

    return response?.data?.data || []
  } catch (error) {
    console.error('❌ Error fetching opSales:', error)
    return []
  }
}

// ------------------------------------------------------------------
// ✅ Fetch opSale details by ID
// ------------------------------------------------------------------
export const getOpSaleById = async (opSaleId) => {
  if (!opSaleId) {
    console.error('⚠️ No OpSale ID provided')
    return null
  }

  try {
    const response = await axios.get(`${BASE_URL}/getOpSaleById/${opSaleId}`)
    console.log('📄 OpSale By ID Response:', response.data)

    return response?.data?.data || null
  } catch (error) {
    console.error('❌ Error fetching opSale by ID:', error)
    return null
  }
}

//

export const createReturnBill = async (payload) => {
  try {
    const res = await axios.post(`${wifiUrl}/api/pharmacy/return-bill/createReturnBill`, payload)

    return res.data
  } catch (error) {
    console.error('Return bill error', error)
    throw error
  }
}

export const getReturnBillByClinicAndBranch = async (clinicId, branchId) => {
  try {
    const res = await axios.get(
      `${wifiUrl}/api/pharmacy/return-bill/getReturnByClinicIdAndBranchId/${clinicId}/${branchId}`,
    )

    return res.data
  } catch (error) {
    console.error('Get return bill error', error)
    throw error
  }
}

export const getBillByNo = async (billNo) => {
  try {
    const res = await axios.get(`${wifiUrl}/clinic-admin/op-sales/bill/${billNo}`)
    return res.data // ✅ return only bill object
  } catch (err) {
    console.log('API Error', err)
    throw err
  }
}

export const updateSalesReturn = async (returnNo, data) => {
  try {
    const res = await axios.put(
      `${wifiUrl}/api/pharmacy/return-bill/updateByReceiptNo/${returnNo}`,
      data,
    )

    return res.data
  } catch (err) {
    console.log('Update API error', err)
    throw err
  }
}
export const deleteReturnBill = async (receiptNo) => {
  try {
    const res = await axios.delete(
      `${wifiUrl}/api/pharmacy/return-bill/deleteByreceiptNo/${receiptNo}`,
    )
    return res.data
  } catch (err) {
    console.log('Delete API error', err)
    throw err
  }
}

export const getAllSalesReturns = async (clinicId, branchId) => {
  const res = await axios.get(
    `${BASE_URL}/sales-return/getAllSalesReturns/clinicId/${clinicId}/branchId/${branchId}`,
  )
  return res.data
}
