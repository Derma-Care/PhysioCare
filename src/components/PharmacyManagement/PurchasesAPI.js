import axios from 'axios'
// import { axios } from "../../Utils/Interceptors"
import { wifiUrl } from '../../baseUrl'

/* ======================================================
   GET: ALL PURCHASES
====================================================== */
export const PurchaseData = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/api/pharmacy/purchases`)
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching purchase data:', error)
    throw error
  }
}

/* ======================================================
   GET: ALL PURCHASES
====================================================== */

/* ======================================================
   GET: BY ID
====================================================== */
export const getPurchaseById = async (id) => {
  try {
    const response = await axios.get(`${wifiUrl}/api/pharmacy/purchase/getById/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching purchase by ID:', error)
    throw error
  }
}

/* ======================================================
   GET: BY BILL NO
====================================================== */
// export const getPurchaseByBillNo = async (billNo) => {
//   try {
//     const response = await axios.get(`${wifiUrl}/api/pharmacy/purchase/getByBillNo/${billNo}`)
//     return response.data
//   } catch (error) {
//     console.error('Error fetching purchase by Bill No:', error)
//     throw error
//   }
// }

/* ======================================================
   POST: SAVE PURCHASE
====================================================== */
export const postPurchaseData = async (data) => {
  console.log(data)
  try {
    const response = await axios.post(`${wifiUrl}/api/pharmacy/purchases`, data)

    return response.data
  } catch (error) {
    console.error('Error adding purchase:', error.response?.data || error)
    throw error
  }
}

/* ======================================================
   PUT: UPDATE PURCHASE
====================================================== */
export const updatePurchaseData = async (id, updatedPurchase) => {
  try {
    const response = await axios.put(
      `${wifiUrl}/api/pharmacy/purchase/update/${id}`,
      updatedPurchase,
    )
    return response.data
  } catch (error) {
    console.error('Error updating purchase:', error.response?.data || error)
    throw error
  }
}

/* ======================================================
   DELETE: DELETE PURCHASE
====================================================== */
export const deletePurchaseData = async (id) => {
  try {
    const response = await axios.delete(`${wifiUrl}/api/pharmacy/purchase/delete/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting purchase:', error.response?.data || error)
    throw error
  }
}

// ================= GET PURCHASE BILL =================

export const getPurchaseByBillNo = async (clinicId, branchId, billNo) => {
  try {
    const res = await axios.get(
      `${wifiUrl}/api/pharmacy/purchases/getPurchaseByclinicIdBranchIdBillNo/${clinicId}/${branchId}/${billNo}`,
    )

    if (!res.status || res.status !== 200) {
      throw new Error('Failed to fetch purchase')
    }

    const data = res.data.data
    console.log(data)
    return data
  } catch (error) {
    console.error('Purchase API Error:', error)
    throw error
  }
}
