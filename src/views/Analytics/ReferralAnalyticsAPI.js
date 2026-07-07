import { BASE_URL } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// 1. Get all Referring Doctors for a Clinic
export const getAllReferDoctors = (clinicId) => {
  return http.get(`${BASE_URL}/getReferralDoctorsByClinicId/${clinicId}`)
}



// 5. Get all patient bookings for Referral and Payment details
export const GetBookingByClinicIdData = async () => {
  const hID = localStorage.getItem('HospitalId')
  const branchId = localStorage.getItem('branchId')
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
