import { http } from '../../Utils/Interceptors'

export const getDashboardAnalytics = async (clinicId, branchId) => {
  return await http.get(`/getDashboardAnalytics/${clinicId}/${branchId}`)
}
