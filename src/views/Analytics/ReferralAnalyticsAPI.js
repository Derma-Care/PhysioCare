import { BASE_URL } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// 1. Get all Referring Doctors for a Clinic
export const getAllReferDoctors = (clinicId) => {
  return http.get(`${BASE_URL}/getReferralDoctorsByClinicId/${clinicId}`)
}

// 2. Get detailed patients for a referring doctor
export const getDoctorReferralPatientDetails = async (clinicId, branchId, doctorReferralId) => {
  try {
    const url = `${BASE_URL}/getDoctorReferralPatientDetails/${clinicId}/${branchId}/${doctorReferralId}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching doctor referral patient details:', error.message)
    throw error
  }
}

// 5. Get all patient bookings for Referral and Payment details
export const GetBookingByClinicIdData = async () => {
  const hID = sessionStorage.getItem('HospitalId')
  const branchId = sessionStorage.getItem('branchId')
  try {
    const response = await http.get(
      `${BASE_URL}/getAllbookingsDetailsByClinicAndBranchId/${hID}/${branchId}`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching bookings for referral analytics:', error.message)
    throw error
  }
}

// 6. Get doctor referral analytics by clinic/branch and timeframe filter
// filter: 1 = today, 2 = week, 3 = month, 4 = year
export const getDoctorReferralAnalytics = async (clinicId, branchId, filter = 4) => {
  try {
    const url = `${BASE_URL}/getDoctorReferralAnalytics/${clinicId}/${branchId}/${filter}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching doctor referral analytics:', error.message)
    throw error
  }
}

// Get doctor referral analytics for a custom date range
export const getDoctorReferralAnalyticsCustom = async (clinicId, branchId, fromDate, toDate) => {
  try {
    const url = `${BASE_URL}/getDoctorReferralAnalyticsCustom/${clinicId}/${branchId}/${fromDate}/${toDate}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching doctor referral analytics (custom):', error.message)
    throw error
  }
}

// 7. Get other referral channels analytics by clinic/branch and timeframe filter
// filter: 1 = today, 2 = week, 3 = month, 4 = year
export const getReferralChannelsAnalytics = async (clinicId, branchId, filter = 4) => {
  try {
    const url = `${BASE_URL}/getReferralChannels/${clinicId}/${branchId}/${filter}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching referral channels analytics:', error.message)
    throw error
  }
}

// Get referral channels analytics for a custom date range
export const getReferralChannelsCustom = async (clinicId, branchId, fromDate, toDate) => {
  try {
    const url = `${BASE_URL}/getReferralChannelsCustom/${clinicId}/${branchId}/${fromDate}/${toDate}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching referral channels analytics (custom):', error.message)
    throw error
  }
}

// 8. Get detailed patients for a referring channel
export const getReferralChannelPatientDetails = async (clinicId, branchId, channelName) => {
  try {
    const url = `${BASE_URL}/getReferralChannelPatientDetails/${clinicId}/${branchId}/${channelName}`
    console.debug('[ReferralAnalyticsAPI] GET', url)
    const response = await http.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching referral channel patient details:', error.message)
    throw error
  }
}
