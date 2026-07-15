import { http } from '../../Utils/Interceptors'

/**
 * Period mapping:
 *  day    → 1
 *  week   → 2
 *  month  → 3
 *  year   → 4
 */
export const getPatientAnalytics = async (clinicId, branchId, period) => {
  let mappedPeriod = period
  if (period === 'day') mappedPeriod = 1
  else if (period === 'week') mappedPeriod = 2
  else if (period === 'month') mappedPeriod = 3
  else if (period === 'year') mappedPeriod = 4

  return await http.post(
    `/patient-analytics/${clinicId}/${branchId}/${mappedPeriod}`
  )
}

export const getPatientAnalyticsCustomDate = async (
  clinicId,
  branchId,
  startDate,
  endDate
) => {
  return await http.post(
    `/patient-analytics/${clinicId}/${branchId}/5`,
    { startDate, endDate }
  )
}
