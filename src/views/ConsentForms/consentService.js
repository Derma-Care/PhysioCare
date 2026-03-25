import { BASE_URL } from '../../baseUrl'
import { http } from '../../Utils/Interceptors'
import { GetGenericFormData, GetProcedureFormData } from './ConsentFormsAPI'

export const fetchConsentData = async (appointment, hospitalId) => {
  try {
    if (appointment?.subServiceName) {
      return await GetProcedureFormData(hospitalId, 2)
    } else {
      return await GetGenericFormData(hospitalId, 1)
    }
  } catch (error) {
    console.error('Error fetching consent form:', error)
    return null
  }
}

export const updateAppointmentBasedOnBookingId = (data) => {
  return http.put(`${BASE_URL}/updateAppointmentBasedOnBookingId`, data)
}
