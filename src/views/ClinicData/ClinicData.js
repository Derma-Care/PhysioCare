// clinicData.js
// import { CategoryData, GetSubServices_ByClinicId  } from '../ProcedureManagement/ProcedureManagementAPI'
import {
  CategoryData,
  GetSubServices_ByClinicId,
} from '../ProcedureManagement/ProcedureManagementAPI'

export const fetchClinicDropdownData = async (hospitalId) => {
  try {
    const categoryResponse = await CategoryData()
    const categories =
      categoryResponse.data && Array.isArray(categoryResponse.data) ? categoryResponse.data : []

    const subServiceData = await GetSubServices_ByClinicId(hospitalId)
    const subServices = Array.isArray(subServiceData) ? subServiceData : []

    return { categories, subServices }
  } catch (error) {
    console.error('Error fetching clinic dropdown data:', error)
    return { categories: [], subServices: [] }
  }
}
