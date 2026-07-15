import { http } from '../../Utils/Interceptors'

/**
 * Period mapping:
 *  today  → 1
 *  week   → 2
 *  month  → 3
 *  year   → 4
 */
export const getAppointmentAnalytics = async (clinicId, branchId, period) => {
  let mappedPeriod = period
  if (period === 'today') mappedPeriod = 1
  else if (period === 'week') mappedPeriod = 2
  else if (period === 'month') mappedPeriod = 3
  else if (period === 'year') mappedPeriod = 4

  return await http.get(
    `/getDoctorAnalytics/${clinicId}/${branchId}/${mappedPeriod}`
  )
}

export const getAppointmentAnalyticsCustom = async (
  clinicId,
  branchId,
  startDate,
  endDate
) => {
  return await http.get(
    `/getDoctorAnalyticsCustom/${clinicId}/${branchId}/${startDate}/${endDate}`
  )
}
